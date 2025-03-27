/**
 * Utility functions for Tooltip Dictionary
 */
import { browser } from 'wxt/browser';

/**
 * Returns a promise that resolves when the DOM is ready
 */
export function domReady(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (document.readyState === "interactive" || document.readyState === "complete") {
      resolve();
    } else {
      document.addEventListener("DOMContentLoaded", () => resolve());
    }
  });
}

// Icon paths for inactive state
export const inactiveIcons = {
  16: "icon/nonactive16.png",
  32: "icon/nonactive32.png",
  48: "icon/nonactive48.png",
  96: "icon/nonactive96.png",
  128: "icon/nonactive128.png"
};

// Icon paths for active state
export const activeIcons = {
  16: "icon/active16.png",
  32: "icon/active32.png",
  48: "icon/active48.png",
  96: "icon/active96.png",
  128: "icon/active128.png"
};

/**
 * Changes the extension icon based on its active state
 */
export async function changeIcon(isActive: boolean): Promise<void> {
  const iconPaths = isActive ? activeIcons : inactiveIcons;
  await browser.action.setIcon({ path: iconPaths });
}

/**
 * Send a message to the background script
 */
export async function sendMessage<T>(message: any): Promise<T> {
  return await browser.runtime.sendMessage(message);
}
