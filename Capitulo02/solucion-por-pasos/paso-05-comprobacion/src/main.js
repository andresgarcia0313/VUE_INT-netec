// main.js: punto de entrada, tal como lo deja create-vue. En este laboratorio no se cambia.
// index.html lo carga con <script type="module" src="/src/main.js">.
import { createApp } from 'vue'
import App from './App.vue'

// createApp(App) crea la aplicación con el componente raíz App.vue;
// mount('#app') la dibuja dentro del <div id="app"> de index.html.
createApp(App).mount('#app')
