// OptionStorage.js functionality
const defaultOptions = {
  active: true,
  tooltipYOffset: 30,
  tooltipYPosition: "down",
  fontSize: 9,
  fontWeight: "normal",
  textColor: "rgb(241, 241, 241)",
  backgroundGradColorTop: "rgb(105, 105, 105)",
  backgroundGradColorBottom: "rgb(84, 84, 84)",
  borderColor: "#707070",
  delayTime: 200,
};

const setOptions = function(options) {
  return new Promise(function(resolve, reject) {
    chrome.storage.sync.set(options, resolve);
  });
};

const getOptions = function(options) {
  return new Promise(function(resolve, reject) {
    chrome.storage.sync.get(options, resolve);
  });
};

// Utils.js functionality
const domReady = function() {
  return new Promise(function(resolve, reject) {
    if (document.readyState === "interactive" || document.readyState === "complete") {
      resolve();
    } else {
      document.addEventListener("DOMContentLoaded", resolve);
    }
  });
};

const nonActiveIcons = {
  16: "images/nonactive16.png",
  32: "images/nonactive32.png",
  48: "images/nonactive48.png",
  64: "images/nonactive64.png",
  96: "images/nonactive96.png",
  128: "images/nonactive128.png"
};

const activeIcons = {
  16: "images/active16.png",
  32: "images/active32.png",
  48: "images/active48.png",
  64: "images/active64.png",
  96: "images/active96.png",
  128: "images/active128.png"
};

const changeIcon = function(isActive) {
  const icons = isActive ? activeIcons : nonActiveIcons;
  chrome.action.setIcon({ path: icons });
};

// Register message listener at the top level of the script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.query) {
    const url = `https://api.100factories.com/api/v1/dictionary/tooltip?term=${encodeURIComponent(request.query.toLowerCase())}&sourceLocale=en-US&targetLocale=ko-KR`;
    
    // Using fetch and handling the response properly for service workers
    fetch(url, {
      headers: {
        "Authorization": `Basic ${btoa("tooltip-dictionary:47a542829d42ca0031d3bcae2fa92223005986dc1e24649284e1d6543a41b25e")}`,
        "Content-Type": "application/json",
      },
    })
      .then(response => response.json())
      .then(data => {
        sendResponse(data && data.isTranslatable ? { word: data.root, mean: data.translations } : null);
      })
      .catch(error => {
        console.error("Error fetching dictionary data:", error);
        sendResponse(null);
      });
      
    return true; // This keeps the message channel open for the async response
  }
});

// Initialize extension on install or update
chrome.runtime.onInstalled.addListener(async () => {
  try {
    // Check for existing options and set defaults if needed
    const existingOptions = await getOptions();
    if (Object.keys(existingOptions).length === 0) {
      await setOptions(defaultOptions);
    }
    
    // Set the icon based on active state
    const { active } = await getOptions("active");
    changeIcon(active);
  } catch (error) {
    console.error("Error initializing extension:", error);
  }
});

// Make sure the icon is set correctly when the service worker starts
getOptions("active")
  .then(options => {
    changeIcon(options.active);
  })
  .catch(error => {
    console.error("Error setting icon:", error);
  });
