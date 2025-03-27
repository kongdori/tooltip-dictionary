import { defineContentScript } from 'wxt/sandbox';
import { browser } from 'wxt/browser';
import { domReady } from '../utils/utils';
import { getOptions } from '../utils/optionStorage';
import detectWord from '../utils/detect';

// Used to track the latest tooltip request
let currentRequestId = 0;

export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    const TOOLTIP_ID = "tooltip-dictionary-popup";
    let activeTimeout: number | undefined = undefined;
    let activeRequestId = 0;

    /**
     * Checks if a tooltip for a specific word is already displayed
     */
    function isTooltipDisplayed(word: string): boolean {
      const tooltip = document.getElementById(TOOLTIP_ID);
      return !!tooltip && String(tooltip.dataset.word).trim() === String(word).trim();
    }

    /**
     * Removes the currently displayed tooltip
     */
    function removeTooltip(): void {
      const tooltip = document.getElementById(TOOLTIP_ID);
      if (tooltip) {
        tooltip.remove();
      }
    }

    /**
     * Sets a timeout to display the tooltip
     */
    function setTooltipTimeout(delay: number, word: string, event: MouseEvent): void {
      if (activeTimeout) {
        clearTimeout(activeTimeout);
      }
      
      // Increment request ID for each new request
      activeRequestId = ++currentRequestId;
      const requestId = activeRequestId;

      activeTimeout = window.setTimeout(() => {
        activeTimeout = undefined;
        // Only create a tooltip if this is still the active request
        if (requestId === currentRequestId) {
          new TooltipHandler(word, event, requestId);
        }
      }, delay);
    }

    /**
     * Interface for translation result
     */
    interface TranslationResult {
      word: string;
      mean: string[];
    }

    /**
     * Handles the creation and display of tooltips
     */
    class TooltipHandler {
      id: string;
      word: string;
      event: MouseEvent;
      requestId: number;

      /**
       * Creates a new tooltip handler
       */
      constructor(word: string, event: MouseEvent, requestId: number) {
        this.id = TOOLTIP_ID;
        this.word = word;
        this.event = event;
        this.requestId = requestId;

        Promise.all([this.translate(), getOptions()])
          .then(([translation, options]) => {
            // Only render if this is still the active request
            if (this.requestId === currentRequestId) {
              this.renderTooltip(translation, options);
            }
          })
          .catch((error) => {
            // Handle errors silently
            console.error('Tooltip Dictionary error:', error);
          });
      }

      /**
       * Gets the page coordinates from a mouse event
       */
      getPageCoordinateOfMouseEvent(event: MouseEvent): { x: number; y: number } {
        // Use pageX/Y if available
        if (event.pageX !== undefined && event.pageY !== undefined) {
          return { x: event.pageX, y: event.pageY };
        }

        // Otherwise calculate from clientX/Y and scroll position
        if (event.clientX !== undefined && event.clientY !== undefined) {
          return {
            x: event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft),
            y: event.clientY + (document.documentElement.scrollTop || document.body.scrollTop)
          };
        }

        return { x: 0, y: 0 };
      }

      /**
       * Adjusts the coordinates of the tooltip to ensure it's visible
       */
      correctCoordinateOfTooltip(
        tooltipElement: HTMLElement,
        mousePosition: { x: number; y: number },
        options: any
      ): { x: number; y: number } {
        const windowScrollX = window.pageXOffset;
        const windowScrollY = window.pageYOffset;
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;
        const tooltipWidth = tooltipElement.offsetWidth;
        const tooltipHeight = tooltipElement.offsetHeight;

        const tooltipYOffset = 20;

        let posX = mousePosition.x;
        let posY = options.tooltipYPosition === "down"
          ? mousePosition.y + tooltipYOffset
          : mousePosition.y - tooltipYOffset - tooltipHeight;

        // Adjust Y position to be inside viewport
        const maxY = windowScrollY + viewportHeight;
        if (posY + tooltipHeight > maxY) {
          posY = maxY - tooltipHeight - 5;
        }
        if (posY < windowScrollY) {
          posY = windowScrollY;
        }

        // Adjust X position to be inside viewport
        const maxX = windowScrollX + viewportWidth;
        if (posX + tooltipWidth > maxX) {
          posX = maxX - tooltipWidth - 5;
        }
        if (posX < windowScrollX) {
          posX = windowScrollX;
        }

        return { x: posX, y: posY };
      }

      /**
       * Renders the tooltip with translation results
       */
      renderTooltip(translation: TranslationResult, options: any): void {
        // Double-check this is still the active request before rendering
        if (this.requestId !== currentRequestId) {
          return;
        }
        
        // Remove any existing tooltip first
        removeTooltip();
        
        const tooltipElement = document.createElement("div");
        tooltipElement.id = this.id;

        // Set light mode design
        tooltipElement.style.setProperty("background", `linear-gradient(to bottom, #ffffff, #f9fafc)`);
        tooltipElement.style.setProperty("display", "block");
        tooltipElement.style.setProperty("padding", "2px 6px");
        tooltipElement.style.setProperty("position", "absolute");
        tooltipElement.style.setProperty("z-index", "2147483647");
        tooltipElement.style.setProperty("font-size", `${options.fontSize}pt`);
        tooltipElement.style.setProperty("font-weight", "normal");
        tooltipElement.style.setProperty("color", "#333333");
        tooltipElement.style.setProperty("border-radius", "4px");
        tooltipElement.style.setProperty("box-shadow", "0 1px 4px rgba(0,0,0,0.1)");
        tooltipElement.style.setProperty("border", `1px solid #a1aabb`);
        tooltipElement.style.setProperty("font-family", "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif");

        // Set tooltip content
        tooltipElement.dataset.word = translation.word;
        tooltipElement.textContent = `${translation.word}: ${translation.mean.join(", ")}`;   

        // Add tooltip to the DOM
        document.body.appendChild(tooltipElement);

        // Position the tooltip
        const position = this.correctCoordinateOfTooltip(
          tooltipElement,
          this.getPageCoordinateOfMouseEvent(this.event),
          options
        );

        tooltipElement.style.setProperty("left", `${position.x}px`);
        tooltipElement.style.setProperty("top", `${position.y}px`);
      }

      /**
       * Sends a message to the background script to translate the word
       */
      async translate(): Promise<TranslationResult> {
        const message = { query: this.word };

        try {
          const response = await browser.runtime.sendMessage(message) as TranslationResult;
          return response;
        } catch (error) {
          console.error('Error translating word:', error);
          return { word: this.word, mean: ['Translation unavailable'] };
        }
      }
    }

    // Initialize the extension when DOM is ready
    domReady().then(() => {
      document.addEventListener('mousemove', async (event) => {
        try {
          const options = await getOptions(['active', 'delayTime']);
          
          if (options.active) {
            const word = detectWord({ x: event.clientX, y: event.clientY });

            if (word !== "") {
              if (!isTooltipDisplayed(word)) {
                setTooltipTimeout(options.delayTime, word, event);
              }
            } else {
              // Cancel any pending requests when mouse moves away from text
              if (activeTimeout) {
                clearTimeout(activeTimeout);
                activeTimeout = undefined;
              }
              // Invalidate current request
              currentRequestId++;
              removeTooltip();
            }
          }
        } catch (error) {
          console.error('Error in mousemove handler:', error);
        }
      });
    });
  },
});
