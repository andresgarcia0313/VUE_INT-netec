// main.js: el que trajo create-vue. createApp crea la aplicación, app.use(router) instala
// Vue Router (registra <RouterLink> y <RouterView>) y mount la dibuja en el <div id="app">.
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
