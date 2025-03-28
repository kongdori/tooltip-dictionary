import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Tooltip Dictionary',
    permissions: ['storage'],
    icons: {
      16: 'icon/active16.png',
      32: 'icon/active32.png',
      48: 'icon/active48.png',
      96: 'icon/active96.png',
      128: 'icon/active128.png',
    },
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtxee2F/x9Qm2heCGgRXf2LqXpyMHYPYlpXx9HeFRHxvQBSN9ppmHJumACzLVTE9oVjYpASysk24GOA7e2vAX9BpNziUzIHHTfOELs0fUpNscHbuxJzFYzTg/PvFEm2yCkfcv9K/ebSgJ/EnSOa0Q9dM3NdoneZY2W1g8TlMdGszqoJOB9thba7bdF3YO9hysUswwAaO9dPrwKZPu8G4394ZFe3EXUXGIdXXomO3sb7c0/cjg7oysnSF63xNsZ45vKwaTM4rXYmQ4c+KRxNuBtPEZEQ4lQ3h+Az0qQu406KED8gjuYAyBpSm5N9fNmAfcGxiTT/ir8UsOA/3rpmDuZwIDAQAB'
  },
});
