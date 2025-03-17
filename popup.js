/*!
 * Tooltip Dictionary
 * Unminified version of popup.js
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
  // Module 1: Options storage
  1: [
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

  // Module 2: Popup UI and event handlers
  2: [
    function (require, module, exports) {
      "use strict";

      /**
       * Sets a property on an object with property descriptor options
       * @param {Object} obj - Target object
       * @param {string} key - Property name
       * @param {*} value - Property value
       * @return {Object} The modified object
       */
      function defineProperty(obj, key, value) {
        return key in obj
          ? Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
          })
          : (obj[key] = value), obj;
      }

      /**
       * Initialize active checkbox event handler
       */
      function initActiveCheckbox() {
        document.getElementById("active_control").addEventListener("click", function () {
          var isActive = this.checked;
          optionStorage.setOptions({ active: isActive }).then(utils.changeIcon(isActive));
        });
      }

      /**
       * Initialize select dropdown event handlers
       */
      function initSelectDropdowns() {
        var selectElements = document.getElementsByTagName("select");

        for (var i = 0; i < selectElements.length; i++) {
          $(selectElements[i]).on("change", function () {
            var selectedValue = $("#" + this.id + " option:selected").val();

            // Convert to number if it's a numeric value
            selectedValue = isNaN(Number(selectedValue))
              ? String(selectedValue)
              : Number(selectedValue);

            // Get option name from element ID (e.g., "fontSize_control" -> "fontSize")
            var optionName = this.id.split("_")[0];

            // Create an object with the option to update
            var optionUpdate = {};
            optionUpdate[optionName] = selectedValue;

            // Save the updated option
            optionStorage.setOptions(optionUpdate);
          });
        }
      }

      /**
       * Populate a select dropdown with options
       * @param {string} selectId - ID of the select element to populate
       * @param {Array} options - Array of option values
       */
      function populateSelectDropdown(selectId, options) {
        var selectElement = document.getElementById(selectId);

        try {
          for (var i = 0; i < options.length; i++) {
            var optionValue = options[i];
            var optionElement = document.createElement("option");

            optionElement.value = String(optionValue).toLocaleLowerCase();
            optionElement.text = optionValue;
            selectElement.appendChild(optionElement);
          }
        } catch (error) {
          console.error("Error populating select dropdown:", error);
        }
      }

      Object.defineProperty(exports, "__esModule", { value: true });

      var optionStorage = require("./optionStorage");
      var utils = require("./utils");

      /**
       * Creates an array of numbers from start to end with the given step
       * @param {number} start - Start value (inclusive)
       * @param {number} end - End value (inclusive)
       * @param {number} step - Step value (default: 1)
       * @return {Array} Array of numbers
       */
      var range = function (start, end, step) {
        step = step !== undefined ? step : 1;

        var result = [];
        var steps = Math.floor((end - start) / step);

        for (var i = 0; i <= steps; i++) {
          result.push(i * step + start);
        }

        return result;
      };

      // Initialize the popup UI components
      initActiveCheckbox();

      // Populate select dropdowns with options
      populateSelectDropdown("delayTime_control", range(100, 1000, 100));  // 100, 200, ..., 1000
      populateSelectDropdown("fontSize_control", range(5, 15));            // 5, 6, ..., 15
      populateSelectDropdown("tooltipYPosition_control", ["Down", "Up"]);

      // Initialize select dropdown event handlers
      initSelectDropdowns();

      // Initialize UI with saved settings
      utils
        .domReady()
        .then(function () {
          return optionStorage.getOptions();
        })
        .then(function (options) {
          // Set UI controls to reflect saved settings
          document.getElementById("active_control").checked = options.active;
          document.getElementById("delayTime_control").value = options.delayTime;
          document.getElementById("fontSize_control").value = options.fontSize;
          document.getElementById("tooltipYPosition_control").value = options.tooltipYPosition;
        })
        .then(function () {
          // Initialize Materialize CSS select dropdowns
          $("select").material_select();
        });
    },
    { "./optionStorage": 1, "./utils": 3 }
  ],

  // Module 3: Utility functions
  3: [
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
        chrome.browserAction.setIcon({ path: iconPaths });
      };
    },
    {}
  ]
},
  {},
  [2]
);
