import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: ['storage'],
    icons: {
      16: 'icon/active16.png',
      32: 'icon/active32.png',
      48: 'icon/active48.png',
      96: 'icon/active96.png',
      128: 'icon/active128.png',
    }
  },
});
