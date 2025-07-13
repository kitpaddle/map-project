import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => ({
  plugins: [vue()],

  // pick base path depending on the build command
  base: mode === 'gh'            // when you run: vite build --mode gh
    ? '/map-project/'        // → GitHub Pages (repo name)
    : './',                  // default build / offline bundle
}));
