// main.js: punto de entrada de la aplicación, tal como lo deja create-vue.
// Es el primer archivo de JavaScript que carga index.html (<script type="module" src="/src/main.js">).
import { createApp } from 'vue'          // createApp crea una instancia de aplicación Vue
import App from './App.vue'              // componente raíz: lo primero que se dibuja

// mount('#app') busca el <div id="app"> de index.html y dibuja ahí el componente App.
// En el paso 1 este archivo se reemplaza para cargar estilos y activar la medición.
createApp(App).mount('#app')
