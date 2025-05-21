import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: './', //added this line but is good for opening project locally "offline"
  plugins: [vue()],
})
