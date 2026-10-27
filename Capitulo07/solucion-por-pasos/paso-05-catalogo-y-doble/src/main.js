// main.js: arranca la aplicación y entrega el servicio real con provide.
// provide/inject es la inyección de dependencias de Vue: quien provee decide qué objeto recibe
// quien lo pide. Aquí provee main.js con el servicio real; en App.spec.js provee la prueba con un doble.
import { createApp } from 'vue'          // crea la aplicación
import App from './App.vue'             // componente raíz
import { api } from './api.js'          // servicio real de datos

createApp(App).provide('api', api).mount('#app') // entrega el servicio a quien lo pida con inject
