// main.js: el punto de arranque. Es el primer archivo de tu código que ejecuta el navegador
// (index.html lo carga con <script type="module" src="/src/main.js">).
// Así lo dejó create-vue con --pinia; en el paso 1 lo reemplazas para encender MSW antes de Vue.
import { createApp } from 'vue'          // createApp crea una aplicación de Vue a partir de un componente raíz
import { createPinia } from 'pinia'      // Pinia: la librería oficial de estado compartido (tiendas, capítulo 4)

import App from './App.vue'              // el componente raíz: todo lo demás se dibuja dentro de él

const app = createApp(App)               // crea la aplicación, todavía sin mostrarla

app.use(createPinia())                   // .use instala un plugin: aquí Pinia, para que existan las tiendas

app.mount('#app')                        // la dibuja dentro de <div id="app"> de index.html
