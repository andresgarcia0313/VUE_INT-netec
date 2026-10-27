// main.js: el punto de arranque. Es el primer archivo de tu código que ejecuta el navegador
// (index.html lo carga con <script type="module" src="/src/main.js">).
// Así lo dejó create-vue con --router y --pinia; en el paso 2 lo reemplazas.
import { createApp } from 'vue'          // createApp crea una aplicación de Vue a partir de un componente raíz
import { createPinia } from 'pinia'      // Pinia: la librería oficial para guardar estado compartido (tiendas)

import App from './App.vue'              // el componente raíz: todo lo demás se dibuja dentro de él
import router from './router'            // el enrutador (capítulo 3): Vite abre src/router/index.js

const app = createApp(App)               // crea la aplicación, todavía sin mostrarla

app.use(createPinia())                   // .use instala un plugin: aquí Pinia, para que existan las tiendas
app.use(router)                          // y el enrutador, para que existan las rutas

app.mount('#app')                        // la dibuja dentro de <div id="app"> de index.html
