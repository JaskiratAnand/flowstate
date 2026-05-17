import { defineConfig } from 'wxt';
import tailwind from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  vite: () => ({
    plugins: [tailwind()],
  }),
  manifest: {
    name: 'FocusFlow',
    permissions: ['storage', 'alarms', 'notifications'],
    action: {
      default_icon: 'icon.svg',
    },
    icons: {
      '128': 'icon/128.png',
    },
  },
});
