import { defineContentScript } from 'wxt/sandbox';
import { browser } from 'wxt/browser';
import detectWord from '@/utils/detect';
import { debounce } from 'lodash';

export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    const TOOLTIP_ID = "tooltip-dictionary-popup";

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
     * Creates a tooltip directly without timeout management
     */
    function createTooltip(word: string, event: MouseEvent): void {
      new TooltipHandler(word, event);
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

      /**
       * Creates a new tooltip handler
       */
      constructor(word: string, event: MouseEvent) {
        this.id = TOOLTIP_ID;
        this.word = word;
        this.event = event;

        Promise.all([this.translate(), getOptions()])
          .then(([translation, options]) => {
            // Render if translation was successful
            if (translation != null) {
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
      async translate(): Promise<TranslationResult | null> {
        const message = { query: this.word };

        try {
          const response = await browser.runtime.sendMessage(message) as TranslationResult;
          return response;
        } catch (error) {
          console.error('Error translating word:', error);
          return null;
        }
      }
    }

    // Initialize the extension when DOM is ready
    domReady().then(() => {
      let lastRequestedWord = "";
      
      // Create a debounced function for showing tooltips
      const debouncedShowTooltip = debounce((word: string, event: MouseEvent) => {
        // If the same word is requested, do nothing
        if (word === lastRequestedWord) {
          return;
        }
        
        lastRequestedWord = word;
        createTooltip(word, event);
      }, 200); // Default delay, will be updated from options

      document.addEventListener('mousemove', async (event) => {
        try {
          const options = await getOptions(['active', 'delayTime']);
          
          if (options.active) {
            const word = detectWord({ x: event.clientX, y: event.clientY });

            if (word !== "") {
              const tooltip = document.getElementById(TOOLTIP_ID);
              
              // If the tooltip is already displayed for a different word, remove it
              if (tooltip && tooltip.dataset.word && tooltip.dataset.word !== word) {
                removeTooltip();
              }
              
              if (!isTooltipDisplayed(word)) {
                // Update the delay time dynamically
                debouncedShowTooltip.cancel();
                debouncedShowTooltip.delay = options.delayTime;
                debouncedShowTooltip(word, event);
              }
            } else {
              // Cancel pending show operations and immediately remove tooltip
              debouncedShowTooltip.cancel();
              removeTooltip();
              
              // Reset last requested word if mouse leaves the text
              lastRequestedWord = "";
            }
          }
        } catch (error) {
          console.error('Error in mousemove handler:', error);
        }
      });
    });
  },
});
