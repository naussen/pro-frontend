import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/sala-[hash].js`,
        chunkFileNames: `assets/sala-[hash].js`,
        assetFileNames: `assets/sala-[hash].[ext]`
      }
    }
  }
})
