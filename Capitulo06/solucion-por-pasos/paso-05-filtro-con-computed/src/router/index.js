// router/index.js: la tabla de rutas de Catálogo Pro (capítulo 3).
// Concepto (paso 4): una ruta diferida usa component: () => import('...'). import() con paréntesis es
// dinámico: Vite saca esa vista a un archivo aparte (fragmento) y el navegador lo descarga solo
// cuando alguien visita la ruta. La vista de entrada sigue con import estático porque se ve al abrir.
import { createRouter, createWebHistory } from 'vue-router'    // funciones del enrutador
import CatalogoView from '../views/CatalogoView.vue'            // la vista de entrada sí va en el paquete inicial

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),          // direcciones limpias, sin #; BASE_URL vale '/'
  routes: [
    { path: '/', component: CatalogoView },                     // se necesita al abrir la página
    { path: '/reportes', component: () => import('../views/ReportesView.vue') }, // se descarga al visitar la ruta
    { path: '/admin', component: () => import('../views/AdminView.vue') }        // igual: fragmento aparte
  ]
})
