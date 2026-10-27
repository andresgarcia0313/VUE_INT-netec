// main.js: punto de entrada. createApp crea la aplicación Vue con App.vue como componente raíz
// y mount la dibuja dentro del <div id="app"> de index.html. Se reemplaza en el paso 5.
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
