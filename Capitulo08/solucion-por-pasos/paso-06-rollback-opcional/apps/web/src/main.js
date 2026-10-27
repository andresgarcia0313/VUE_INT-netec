// main.js: el de create-vue más dos líneas. La observabilidad se instala ANTES de app.use(router)
// y de mount, para que sus guardias ya estén puestas cuando ocurra la primera navegación.
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { instalarObservabilidad } from './observabilidad.js' // nuevo

const app = createApp(App)
instalarObservabilidad(app, router) // nuevo: engancha el enrutador y el manejador de errores

app.use(router)

app.mount('#app')
