// vite.config.js: configuración de Vite que trae create-vue; en este laboratorio no se toca.
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'                 // enseña a Vite a leer archivos .vue (también los de packages/ui)
import vueDevTools from 'vite-plugin-vue-devtools'   // agrega las Vue DevTools al navegador en desarrollo

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      // alias '@': import x from '@/vistas/...' apunta a src/ sin escribir rutas con ../
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
