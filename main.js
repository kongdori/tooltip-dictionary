/*!
 * Tooltip Dictionary
 * Unminified version of main.js
 */
(function browserifyShim(modules, cache, entryPoints) {
  function require(moduleName, calledFromParent) {
    if (!cache[moduleName]) {
      if (!modules[moduleName]) {
        var requireFunction = typeof window.require === "function" && window.require;
        if (!calledFromParent && requireFunction) {
          return requireFunction(moduleName, true);
        }
        if (typeof window.require === "function") {
          return window.require(moduleName, true);
        }
        var error = new Error("Cannot find module '" + moduleName + "'");
        error.code = "MODULE_NOT_FOUND";
        throw error;
      }

      var moduleObject = cache[moduleName] = { exports: {} };
      modules[moduleName][0].call(
        moduleObject.exports,
        function (item) {
          var subModuleName = modules[moduleName][1][item];
          return require(subModuleName || item);
        },
        moduleObject,
        moduleObject.exports,
        browserifyShim,
        modules,
        cache,
        entryPoints
      );
    }
    return cache[moduleName].exports;
  }

  for (var i = typeof window.require === "function" && window.require, a = 0; a < entryPoints.length; a++) {
    require(entryPoints[a]);
  }

  return require;
})({
  // Module 1: Word detection
  1: [
    function (require, module, exports) {
      "use strict";

      /**
       * Checks if a character is a whitespace character
       * @param {string} char - The character to check
       * @return {boolean} True if the character is whitespace
       */
      function isWhitespace(char) {
        return /[ \f\n\r\t\v\u00A0\u2028\u2029]/.test(char);
      }

      /**
       * Checks if a character is a special character
       * @param {string} char - The character to check
       * @return {boolean} True if the character is a special character
       */
      function isSpecialCharacter(char) {
        return /[\^\$\!\@\#\%\&\*\-\_\=\+\,\.\:\/\;\"\'\(\)\[\]\{\<\>}]/.test(char);
      }

      /**
       * Checks if an element is a block-level element
       * @param {HTMLElement} element - The element to check
       * @return {boolean} True if the element is a block-level element
       */
      function isBlockElement(element) {
        return !element || /^(BR|DIV|P|PRE|TD|TR|TABLE)$/i.test(element.nodeName);
      }

      /**
       * Gets the next sibling of an element, considering parent relationships
       * @param {HTMLElement} element - The element to find the next sibling for
       * @return {HTMLElement|null} The next sibling or null
       */
      function getNextSibling(element) {
        var nextSibling = null;

        if (element.nextSibling) {
          nextSibling = element.nextSibling;
        } else if (element.parentNode && element.parentNode.nextSibling) {
          nextSibling = element.parentNode.nextSibling;
        }

        return isBlockElement(nextSibling) ? null : nextSibling;
      }

      /**
       * Gets the previous sibling of an element, considering parent relationships
       * @param {HTMLElement} element - The element to find the previous sibling for
       * @return {HTMLElement|null} The previous sibling or null
       */
      function getPreviousSibling(element) {
        var previousSibling = null;

        if (element.previousSibling) {
          previousSibling = element.previousSibling;
        } else if (element.parentNode && element.parentNode.previousSibling) {
          previousSibling = element.parentNode.previousSibling;
        }

        return isBlockElement(previousSibling) ? null : previousSibling;
      }

      /**
       * Gets the index of an element among its siblings
       * @param {HTMLElement} element - The element to find the index for
       * @return {number} The index of the element
       */
      function getElementIndex(element) {
        var index = 0;
        while ((element = element.previousSibling)) {
          index++;
        }
        return index;
      }

      /**
       * Gets the position information from a text range
       * @param {TextRange} textRange - The text range
       * @param {boolean} isStart - Whether to get the start position
       * @return {Object} Object containing node and offset information
       */
      function getTextRangePosition(textRange, isStart) {
        var duplicatedRange = textRange.duplicate();
        duplicatedRange.collapse(isStart);

        var compareResult, result, placeholder;
        var container = duplicatedRange.parentElement();
        var span = document.createElement("span");
        var compareMethod = isStart ? "StartToStart" : "StartToEnd";

        do {
          container.insertBefore(span, span.previousSibling);
          duplicatedRange.moveToElementText(span);
        } while ((compareResult = duplicatedRange.compareEndPoints(compareMethod, textRange)) > 0 && span.previousSibling);

        if (compareResult === -1 && span.nextSibling) {
          duplicatedRange.setEndPoint(isStart ? "EndToStart" : "EndToEnd", textRange);
          result = {
            node: span.nextSibling,
            offset: duplicatedRange.text.length
          };
        } else {
          result = {
            node: container,
            offset: getElementIndex(span)
          };
        }

        span.parentNode.removeChild(span);
        return result;
      }

      /**
       * Extracts a word from a click position
       * @param {Object} position - The x,y coordinates of the mouse click
       * @return {string} The extracted word or empty string if no word is found
       */
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.default = function (position) {
        var wordStart, wordEnd, wordPosition, caretPosition, node, offset;

        // Handle different browser implementations for getting text node at point
        if (document.body.createTextRange) {
          try {
            caretPosition = document.body.createTextRange();
            caretPosition.moveToPoint(position.x, position.y);
            caretPosition.select();

            var rangeInfo = getTextRangePosition(caretPosition, true);
            node = rangeInfo.node;
            offset = rangeInfo.offset;
          } catch (e) {
            return "";
          }
        } else if (document.caretPositionFromPoint) {
          caretPosition = document.caretPositionFromPoint(position.x, position.y);
          if (!caretPosition) {
            return "";
          }
          node = caretPosition.offsetNode;
          offset = caretPosition.offset;
        } else if (document.caretRangeFromPoint) {
          caretPosition = document.caretRangeFromPoint(position.x, position.y) || new Range();
          node = caretPosition.startContainer;
          offset = caretPosition.startOffset;
        }

        // Ensure we have a valid text node
        if (!node || node.nodeType !== Node.TEXT_NODE) {
          return "";
        }

        var text = node.textContent;

        // Check if the offset is valid
        if (offset <= 0 || offset >= text.length) {
          return "";
        }

        // Check if the character at offset is valid for word detection
        if (isWhitespace(text[offset]) || isSpecialCharacter(text[offset])) {
          return "";
        }

        // Find word boundaries
        wordStart = wordEnd = wordPosition = offset;

        // Find word start
        while (wordStart > 0 && !isWhitespace(text[wordStart - 1]) && !isSpecialCharacter(text[wordStart - 1])) {
          wordStart--;
        }

        // Store the start of the word
        wordPosition = wordStart;

        // Find word end
        while (wordEnd < text.length - 1 && !isWhitespace(text[wordEnd + 1]) && !isSpecialCharacter(text[wordEnd + 1])) {
          wordEnd++;
        }

        // Extract the word
        var word = text.substring(wordPosition, wordEnd + 1);

        // Handle words at text node boundaries
        if (wordEnd === text.length - 1 || wordStart === 0) {
          var nextSibling = getNextSibling(node);
          var prevSibling = getPreviousSibling(node);

          // Check next node for continuation of the word
          if (wordEnd == text.length - 1 && nextSibling) {
            var nextText = nextSibling.textContent || "";
            for (wordEnd = 0; wordEnd < nextText.length && !isWhitespace(nextText[wordEnd]) && !isSpecialCharacter(nextText[wordEnd]); wordEnd++) {
              word += nextText[wordEnd];
            }
          }
          // Check previous node for start of the word
          else if (wordStart === 0 && prevSibling) {
            var prevText = prevSibling.textContent || "";
            for (wordStart = prevText.length - 1; wordStart >= 0 && !isWhitespace(prevText[wordStart]) && !isSpecialCharacter(prevText[wordStart]); wordStart--) {
              word = prevText[wordStart] + word;
            }
          }
        }

        return word;
      };
    },
    {},
  ],

  // Module 2: Main tooltip functionality
  2: [
    function (require, module, exports) {
      "use strict";

      function _classCallCheck(instance, constructor) {
        if (!(instance instanceof constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }

      var _createClass = (function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) {
              descriptor.writable = true;
            }
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) {
            defineProperties(Constructor.prototype, protoProps);
          }
          if (staticProps) {
            defineProperties(Constructor, staticProps);
          }
          return Constructor;
        };
      })();

      Object.defineProperty(exports, "__esModule", { value: true });

      var _detect = require("./detect");
      var _optionStorage = require("./optionStorage");
      var _utils = require("./utils");

      // Main module namespace
      (function (TooltipDictionary) {
        var TOOLTIP_ID = "tooltip";
        var activeTimeout = undefined;

        /**
         * Checks if a tooltip for a specific word is already displayed
         * @param {string} word - The word to check
         * @return {boolean} True if a tooltip for this word exists
         */
        function isTooltipDisplayed(word) {
          var tooltip = document.getElementById(TOOLTIP_ID);
          return !!tooltip && String(tooltip.dataset.word).trim() === String(word).trim();
        }

        /**
         * Removes the currently displayed tooltip
         */
        function removeTooltip() {
          var tooltip = document.getElementById(TOOLTIP_ID);
          if (tooltip) {
            tooltip.remove();
          }
        }

        /**
         * Sets a timeout to display the tooltip
         * @param {number} delay - The delay in milliseconds
         * @param {string} word - The word to display
         * @param {Event} event - The mouse event
         */
        function setTooltipTimeout(delay, word, event) {
          if (activeTimeout) {
            clearTooltipTimeout(activeTimeout);
          }

          activeTimeout = setTimeout(function () {
            activeTimeout = undefined;
            new TooltipHandler(word, event);
          }, delay);
        }

        /**
         * Clears a tooltip timeout
         * @param {number} timeout - The timeout to clear
         */
        function clearTooltipTimeout(timeout) {
          if (timeout) {
            clearTimeout(timeout);
          }
        }

        /**
         * Handles the creation and display of tooltips
         */
        var TooltipHandler = (function () {
          /**
           * Creates a new tooltip handler
           * @param {string} word - The word to look up
           * @param {Event} event - The mouse event
           */
          function TooltipHandler(word, event) {
            var _this = this;

            _classCallCheck(this, TooltipHandler);

            this.id = TOOLTIP_ID;
            this.word = word;
            this.event = event;

            Promise.all([this.translate(), _optionStorage.getOptions()])
              .then(function (results) {
                _this.renderTooltip(results[0], results[1]);
              })
              .catch(function (error) {
                // Handle errors silently
              });
          }

          _createClass(TooltipHandler, [
            {
              key: "getPageCoordinateOfMouseEvent",

              /**
               * Gets the page coordinates from a mouse event
               * @param {Event} event - The mouse event
               * @return {Object} Object with x and y coordinates
               */
              value: function getPageCoordinateOfMouseEvent(event) {
                if (!event) {
                  event = window.event;
                }

                // Use pageX/Y if available
                if (event.pageX && event.pageY) {
                  return { x: event.pageX, y: event.pageY };
                }

                // Otherwise calculate from clientX/Y and scroll position
                if (event.clientX && event.clientY) {
                  return {
                    x: event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft),
                    y: event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop)
                  };
                }

                return { x: 0, y: 0 };
              }
            },
            {
              key: "correctCoordinateOfTooltip",

              /**
               * Adjusts the coordinates of the tooltip to ensure it's visible
               * @param {HTMLElement} tooltipElement - The tooltip element
               * @param {Object} mousePosition - The mouse position {x, y}
               * @param {Object} options - The tooltip options
               * @return {Object} Corrected position {x, y}
               */
              value: function correctCoordinateOfTooltip(tooltipElement, mousePosition, options) {
                var windowScrollX = window.pageXOffset;
                var windowScrollY = window.pageYOffset;
                var viewportWidth = document.documentElement.clientWidth;
                var viewportHeight = document.documentElement.clientHeight;
                var tooltipWidth = tooltipElement.offsetWidth;
                var tooltipHeight = tooltipElement.offsetHeight;

                var posX = mousePosition.x;
                var posY = options.tooltipYPosition == "down"
                  ? mousePosition.y + options.tooltipYOffset
                  : mousePosition.y - options.tooltipYOffset - tooltipHeight;

                // Adjust Y position to be inside viewport
                var maxY = windowScrollY + viewportHeight;
                if (posY + tooltipHeight > maxY) {
                  posY = maxY - tooltipHeight - 5;
                }
                if (posY < windowScrollY) {
                  posY = windowScrollY;
                }

                // Adjust X position to be inside viewport
                var maxX = windowScrollX + viewportWidth;
                if (posX + tooltipWidth > maxX) {
                  posX = maxX - tooltipWidth - 5;
                }
                if (posX < windowScrollX) {
                  posX = windowScrollX;
                }

                return { x: posX, y: posY };
              }
            },
            {
              key: "renderTooltip",

              /**
               * Renders the tooltip with translation results
               * @param {Object} translation - The translation result
               * @param {Object} options - The tooltip options
               */
              value: function renderTooltip(translation, options) {
                var tooltipElement = document.createElement("div");
                tooltipElement.id = this.id;

                var gradient = "-webkit-gradient(linear, left top, left bottom, from(" +
                  options.backgroundGradColorTop + "), to(" +
                  options.backgroundGradColorBottom + "))";

                // Set tooltip styles
                tooltipElement.style.setProperty("background", gradient);
                tooltipElement.style.setProperty("display", "block");
                tooltipElement.style.setProperty("padding", "2px 4px");
                tooltipElement.style.setProperty("position", "absolute");
                tooltipElement.style.setProperty("z-index", "2147483647", "important");
                tooltipElement.style.setProperty("font-size", String(options.fontSize) + "pt");
                tooltipElement.style.setProperty("font-weight", options.fontWeight);
                tooltipElement.style.setProperty("color", options.textColor);
                tooltipElement.style.setProperty("-webkit-border-radius", ".2em");
                tooltipElement.style.setProperty("-webkit-box-shadow", "2px 2px 5px rgba(0,0,0,.4)");

                // Set tooltip content
                tooltipElement.dataset.word = String(translation.word);
                tooltipElement.textContent = String(translation.word + ": " + translation.mean.join(", "));

                // Add tooltip to the DOM
                document.getElementsByTagName("body")[0].appendChild(tooltipElement);

                // Position the tooltip
                var position = this.correctCoordinateOfTooltip(
                  tooltipElement,
                  this.getPageCoordinateOfMouseEvent(this.event),
                  options
                );

                tooltipElement.style.setProperty("left", String(position.x) + "px", "important");
                tooltipElement.style.setProperty("top", String(position.y) + "px", "important");
              }
            },
            {
              key: "translate",

              /**
               * Sends a message to the background script to translate the word
               * @return {Promise} Promise that resolves with translation
               */
              value: function translate() {
                var message = { query: this.word };

                return new Promise(function (resolve, reject) {
                  chrome.runtime.sendMessage(message, function (response) {
                    resolve(response);
                  });
                });
              }
            }
          ]);

          return TooltipHandler;
        })();

        // Initialize the extension when DOM is ready
        _utils.domReady().then(function () {
          document.onmousemove = function (event) {
            _optionStorage.getOptions(["active", "delayTime"]).then(function (options) {
              if (options.active) {
                var word = _detect.default({ x: event.clientX, y: event.clientY });

                if (word != "") {
                  if (!isTooltipDisplayed(word)) {
                    setTooltipTimeout(options.delayTime, word, event);
                  }
                } else {
                  clearTooltipTimeout(activeTimeout);
                  removeTooltip();
                }
              }
            });
          };
        });
      })(_detect || (_detect = {}));
    },
    { "./detect": 1, "./optionStorage": 3, "./utils": 4 }
  ],

  // Module 3: Options storage
  3: [
    function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", { value: true });

      /**
       * Default extension options
       */
      exports.defaultOptions = {
        active: true,
        tooltipYOffset: 30,
        tooltipYPosition: "down",
        fontSize: 9,
        fontWeight: "normal",
        textColor: "rgb(241, 241, 241)",
        backgroundGradColorTop: "rgb(105, 105, 105)",
        backgroundGradColorBottom: "rgb(84, 84, 84)",
        borderColor: "#707070",
        delayTime: 200
      };

      /**
       * Saves options to Chrome storage
       * @param {Object} options - Options to save
       * @return {Promise} Promise that resolves when options are saved
       */
      exports.setOptions = function (options) {
        return new Promise(function (resolve, reject) {
          chrome.storage.sync.set(options, resolve);
        });
      };

      /**
       * Gets options from Chrome storage
       * @param {Array|undefined} keys - Optional array of option keys to retrieve
       * @return {Promise} Promise that resolves with the options
       */
      exports.getOptions = function (keys) {
        return new Promise(function (resolve, reject) {
          chrome.storage.sync.get(keys, resolve);
        });
      };
    },
    {}
  ],

  // Module 4: Utility functions
  4: [
    function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", { value: true });

      /**
       * Returns a promise that resolves when the DOM is ready
       * @return {Promise} Promise that resolves when the DOM is ready
       */
      exports.domReady = function () {
        return new Promise(function (resolve, reject) {
          if (document.readyState === "interactive" || document.readyState === "complete") {
            resolve();
          } else {
            document.addEventListener("DOMContentLoaded", resolve);
          }
        });
      };

      // Icon paths for inactive state
      var inactiveIcons = {
        16: "images/nonactive16.png",
        32: "images/nonactive32.png",
        48: "images/nonactive48.png",
        64: "images/nonactive64.png",
        96: "images/nonactive96.png",
        128: "images/nonactive128.png"
      };

      // Icon paths for active state
      var activeIcons = {
        16: "images/active16.png",
        32: "images/active32.png",
        48: "images/active48.png",
        64: "images/active64.png",
        96: "images/active96.png",
        128: "images/active128.png"
      };

      /**
       * Changes the extension icon based on its active state
       * @param {boolean} isActive - Whether the extension is active
       */
      exports.changeIcon = function (isActive) {
        var iconPaths = isActive ? activeIcons : inactiveIcons;
        chrome.action.setIcon({ path: iconPaths });
      };
    },
    {}
  ]
},
  {},
  [2]
);
