// vite.config.js tal como lo deja create-vue. Vite lee este archivo al arrancar (npm run dev)
// y al compilar (npm run build). En el paso 3 lo reemplazas para agregar el visualizador.
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'                 // enseña a Vite a leer archivos .vue
import vueDevTools from 'vite-plugin-vue-devtools'   // panel Vue DevTools, solo en desarrollo

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      // '@' en un import significa la carpeta src
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
