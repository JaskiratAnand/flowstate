import { defineConfig } from 'wxt';
import tailwind from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  vite: () => ({
    plugins: [tailwind()],
  }),
  manifest: ({ browser }) => ({
    name: 'FlowState - Pomodoro Timer & Todo List',
    permissions: [
      'storage',
      'alarms',
      'notifications',
      'declarativeNetRequest',
      ...(browser === 'firefox' ? [] : ['offscreen']),
    ],
    host_permissions: ['<all_urls>'],
    web_accessible_resources: [
      {
        resources: ['blocked.html'],
        matches: ['<all_urls>'],
      },
    ],
    action: {
      default_icon: 'icon/48.png',
    },
    icons: {
      '16': 'icon/16.png',
      '32': 'icon/32.png',
      '48': 'icon/48.png',
      '96': 'icon/96.png',
      '128': 'icon/128.png',
    },
  }),
});
