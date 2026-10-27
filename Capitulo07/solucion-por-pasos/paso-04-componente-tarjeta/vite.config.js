// vite.config.js: configuración de Vite, el servidor de desarrollo y empaquetador del proyecto.
// create-vue lo dejó listo y en este laboratorio no se toca.
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'                 // enseña a Vite a leer archivos .vue
import vueDevTools from 'vite-plugin-vue-devtools'   // agrega las Vue DevTools al navegador en desarrollo

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      // alias '@': permite escribir import x from '@/utils/...' en lugar de rutas con ../../
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
