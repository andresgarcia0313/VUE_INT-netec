// vite.config.js: configuración de Vite, la herramienta que sirve la app mientras programas (npx vite)
// y la empaqueta para publicarla (npm run build). Así la dejó create-vue: no lo tocas en este laboratorio.
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'                 // enseña a Vite a leer archivos .vue
import vueDevTools from 'vite-plugin-vue-devtools'   // Vue DevTools dentro de la página (Alt + Shift + D): pestaña Pinia

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)) // el atajo @ apunta a src/: '@/stores/auth.js'
    },
  },
})
