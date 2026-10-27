// vitest.config.js: configuración de Vitest. Las líneas de create-vue quedan igual;
// las marcadas NUEVO agregan la preparación común (setupFiles) y la medición de cobertura.
import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,                                       // reutiliza plugins y alias de vite.config.js
  defineConfig({
    test: {                                         // todo lo de Vitest va aquí
      environment: 'jsdom',                         // navegador de mentira: crea window y document
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      setupFiles: ['./vitest.setup.js'],            // NUEVO: preparación que corre antes de cada archivo de pruebas
      coverage: {                                   // NUEVO: qué líneas ejecutaron las pruebas
        provider: 'v8',                             // la mide el motor V8 de Node.js
        reporter: ['text', 'html'],                 // tabla en la terminal y página en coverage/index.html
        include: ['src/**/*.{js,vue}'],             // el código de la aplicación
        exclude: ['src/main.js', 'src/api.js', 'src/__tests__/**'], // arranque, red y pruebas: no se miden
        thresholds: { lines: 80, functions: 80, statements: 80, branches: 75 } // mínimos de la estrategia
      }
    },
  }),
)
