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
    permissions: ['storage', 'alarms', 'notifications'],
  },
});
