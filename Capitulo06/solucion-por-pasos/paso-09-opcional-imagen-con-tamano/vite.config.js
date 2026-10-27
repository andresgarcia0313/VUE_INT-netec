// vite.config.js: la configuración de Vite con el visualizador del paquete (tema 6.2).
// Concepto: defineConfig puede recibir una FUNCIÓN que recibe { mode }. Con "vite build --mode analisis"
// mode vale 'analisis' y solo entonces se agrega el plugin; en las demás compilaciones la expresión
// da false y Vite ignora ese lugar de la lista.
import { fileURLToPath, URL } from 'node:url'                // convierte una dirección de archivo en ruta del disco
import { defineConfig } from 'vite'                          // ayuda para escribir la configuración
import vue from '@vitejs/plugin-vue'                         // enseña a Vite a leer archivos .vue
import vueDevTools from 'vite-plugin-vue-devtools'           // panel Vue DevTools (lo trajo create-vue)
import { visualizer } from 'rollup-plugin-visualizer'        // dibuja el mapa del paquete

// Paso 4: expresión regular que reconoce las carpetas de Vue dentro de node_modules.
// [\\/] acepta \ (Windows) y / (macOS y Linux).
const VUE = /node_modules[\\/](vue|@vue|vue-router)[\\/]/    // patrón: carpetas de Vue y de su enrutador

export default defineConfig(({ mode }) => ({                 // mode vale 'analisis' con npm run build:analisis
  plugins: [
    vue(),                                                   // plugin de Vue
    vueDevTools(),                                           // solo actúa con npm run dev: no entra en dist
    mode === 'analisis' && visualizer({                      // el mapa solo se genera si se pide
      filename: 'estadisticas.html',                         // archivo del mapa, en la carpeta del proyecto
      gzipSize: true                                         // muestra también el peso comprimido
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))  // '@' en un import significa la carpeta src
    }
  },
  // Paso 4. Concepto: manualChunks decide en qué archivo (fragmento o chunk) va cada módulo.
  // Vue cambia poco entre publicaciones; en su propio archivo, el navegador lo conserva en caché
  // aunque tu código cambie.
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {                                   // Vite la llama con la ruta de cada módulo
          if (!id.includes('node_modules')) return           // código propio: Vite decide solo
          if (VUE.test(id)) return 'vue'                     // Vue y el enrutador viajan juntos en vue-*.js
          return 'vendor'                                    // cualquier otra librería externa
        }
      }
    }
  }
}))
