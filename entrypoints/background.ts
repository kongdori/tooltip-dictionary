import { defineBackground } from 'wxt/sandbox';
import { browser } from 'wxt/browser';

export default defineBackground(async () => {
  console.log('Tooltip Dictionary background initialized', { id: browser.runtime.id });
  
  // Listen for extension installation or update
  browser.runtime.onInstalled.addListener(async () => {
    try {
      // Check for existing options and set defaults if needed
      const existingOptions = await getOptions();
      if (Object.keys(existingOptions).length === 0) {
        await setOptions(defaultOptions);
      }
      
      // Set the icon based on active state
      const options = await getOptions(['active']);
      await changeIcon(options.active);
    } catch (error) {
      console.error("Error initializing extension:", error);
    }
  });

  // Make sure the icon is set correctly when the background script starts
  try {
    const options = await getOptions(['active']);
    await changeIcon(options.active);
  } catch (error) {
    console.error("Error setting icon:", error);
  }

  // Set up message listener for dictionary lookups
  browser.runtime.onMessage.addListener((request: any, sender, sendResponse) => {
    if (request && request.query) {
      const url = `https://api.100factories.com/api/v1/dictionary/tooltip?term=${encodeURIComponent(request.query.toLowerCase())}&sourceLocale=en-US&targetLocale=ko-KR`;
      
      // Add timeout of 3 seconds for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      fetch(url, {
        headers: {
          "Authorization": `Basic ${btoa("tooltip-dictionary:47a542829d42ca0031d3bcae2fa92223005986dc1e24649284e1d6543a41b25e")}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal
      })
        .then(response => response.json())
        .then(data => {
          clearTimeout(timeoutId);
          sendResponse(data && data.isTranslatable ? { word: data.root, mean: data.translations } : null);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          // Check if the error was caused by the timeout
          if (error.name === 'AbortError') {
            console.log('Dictionary API request timed out after 3 seconds');
          } else {
            console.error("Error fetching dictionary data:", error);
          }
          sendResponse(null);
        });
    } else {
      // If we don't handle this message, respond with null
      sendResponse(null);
    }
    
    // Always return true to indicate we'll call sendResponse asynchronously
    return true;
  });
});
