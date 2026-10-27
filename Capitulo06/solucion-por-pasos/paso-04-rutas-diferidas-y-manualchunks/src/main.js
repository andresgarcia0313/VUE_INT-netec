// main.js: punto de entrada de la aplicación. create-vue lo dejó listo y en este laboratorio no se toca.
import { createApp } from 'vue'          // createApp crea una instancia de aplicación Vue
import App from './App.vue'              // componente raíz: lo primero que se dibuja
import router from './router'            // el enrutador definido en src/router/index.js

const app = createApp(App)               // la aplicación arranca desde App.vue

// app.use(router) instala Vue Router como plugin: registra <RouterView> y <RouterLink>
// en todos los componentes y habilita useRoute() y useRouter().
app.use(router)

app.mount('#app')                        // dibuja la aplicación dentro del <div id="app"> de index.html
