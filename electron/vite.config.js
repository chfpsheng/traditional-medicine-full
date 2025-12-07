import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import electronRenderer from 'vite-plugin-electron-renderer'

export default defineConfig({
  plugins: [
    vue(),
    electron({
      main: {
        entry: 'main.js',
      },
    }),
    electronRenderer(),
  ],
  server: {
    port: 3000,
  },
})