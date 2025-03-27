import { defineBackground } from 'wxt/sandbox';

// Define default options similar to the original service_worker.js
const defaultOptions = {
  active: true,
  delayTime: 200,
  fontSize: 10,
  tooltipYPosition: "Down",
  tooltipYOffset: 30,
  fontWeight: "normal",
  textColor: "rgb(241, 241, 241)",
  backgroundGradColorTop: "rgb(105, 105, 105)",
  backgroundGradColorBottom: "rgb(84, 84, 84)",
  borderColor: "#707070",
};

// Define types for options
type OptionsType = typeof defaultOptions;
type OptionKey = keyof OptionsType;

// Utility to set options
const setOptions = async (options: Partial<OptionsType>): Promise<void> => {
  await browser.storage.sync.set(options);
};

// Utility to get options
const getOptions = async <T extends OptionKey | undefined = undefined>(
  key?: T
): Promise<T extends OptionKey ? { [K in T]: OptionsType[K] } : OptionsType> => {
  return await browser.storage.sync.get(key as any) as any;
};

// Icon paths
const nonActiveIcons = {
  16: "icon/nonactive16.png",
  32: "icon/nonactive32.png",
  48: "icon/nonactive48.png",
  96: "icon/nonactive96.png",
  128: "icon/nonactive128.png"
};

const activeIcons = {
  16: "icon/active16.png",
  32: "icon/active32.png",
  48: "icon/active48.png",
  96: "icon/active96.png",
  128: "icon/active128.png"
};

// Utility to change icon
const changeIcon = (isActive: boolean): void => {
  const icons = isActive ? activeIcons : nonActiveIcons;
  browser.action.setIcon({ path: icons });
};

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
      const { active } = await getOptions("active");
      changeIcon(active);
    } catch (error) {
      console.error("Error initializing extension:", error);
    }
  });

  // Make sure the icon is set correctly when the background script starts
  try {
    const options = await getOptions("active");
    changeIcon(options.active);
  } catch (error) {
    console.error("Error setting icon:", error);
  }

  // Set up message listener for dictionary lookups
  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.query) {
      const url = `https://api.100factories.com/api/v1/dictionary/tooltip?term=${encodeURIComponent(request.query.toLowerCase())}&sourceLocale=en-US&targetLocale=ko-KR`;
      
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
        
      return true;
    }
  });
});
