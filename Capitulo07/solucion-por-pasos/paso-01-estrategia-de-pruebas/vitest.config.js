// vitest.config.js: configuración de Vitest, el ejecutor de pruebas unitarias y de componentes.
// Así lo deja create-vue; en el paso 2 se le agregan la preparación común y la cobertura.
import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,                                       // mergeConfig: reutiliza plugins y alias de vite.config.js
  defineConfig({
    test: {
      environment: 'jsdom',                         // jsdom: un navegador simulado en Node.js, con window y document
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
