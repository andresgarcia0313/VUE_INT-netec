// Punto de entrada: crea la aplicación y la dibuja en la página
import { createApp } from 'vue'              // función que crea una aplicación Vue
import App from './App.vue'                  // componente principal
import './style.css'                         // estilos de toda la aplicación

const app = createApp(App)                   // crea la aplicación con el componente principal
// app.config.performance: Vue marca en la línea de tiempo del navegador cuánto tarda cada
// componente en dibujarse (marcas "<TarjetaProducto> patch" en la pestaña Rendimiento de Chrome).
// Solo sirve para medir en desarrollo; no cambia lo que se ve en pantalla.
app.config.performance = true                // deja que Chrome mida cada dibujo (pestaña Rendimiento)
app.mount('#app')                            // la dibuja dentro de <div id="app"> de index.html
