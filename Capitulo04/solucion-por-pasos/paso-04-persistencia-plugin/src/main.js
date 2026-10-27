// main.js: el punto de arranque de la aplicación (index.html lo carga primero).
// Concepto: Pinia es un PLUGIN de Vue. Se crea una sola instancia (createPinia) y se instala con .use();
// desde ese momento cualquier componente, guardia o tienda puede pedir una tienda con useXxxStore().
// Paso 4: Pinia también acepta SUS PROPIOS plugins con pinia.use(); cada uno se ejecuta una vez por tienda.
import { createApp } from 'vue'                      // crea la aplicación
import { createPinia } from 'pinia'                  // crea Pinia, el gestor de tiendas
import App from './App.vue'                          // componente principal
import router from './router'                        // enrutador: Vite abre src/router/index.js
import { persistPlugin } from './plugins/persist.js' // paso 4: guarda lo que cada tienda declara

const pinia = createPinia()                          // la instancia de Pinia, en una variable para hablarle
pinia.use(persistPlugin)                             // paso 4: se registra antes de que nazca cualquier tienda

// El orden importa: la guardia del enrutador pide la tienda de sesión,
// así que Pinia tiene que estar instalada antes que el enrutador.
createApp(App)                                       // crea la aplicación con App como raíz
  .use(pinia)                                        // primero Pinia: la guardia del enrutador usa una tienda
  .use(router)                                       // después el enrutador
  .mount('#app')                                     // la dibuja dentro de <div id="app">
