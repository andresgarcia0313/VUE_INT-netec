// router/index.js: la tabla de rutas de Catálogo Pro (capítulo 3).
// Concepto: un import estático (arriba del archivo) mete la vista en el paquete inicial, aunque
// nadie la visite. Así suele llegar un proyecto real; en el paso 4 dos de estas vistas pasan a import().
import { createRouter, createWebHistory } from 'vue-router'    // funciones del enrutador
import CatalogoView from '../views/CatalogoView.vue'            // la vista de entrada sí va en el paquete inicial
import ReportesView from '../views/ReportesView.vue'            // hoy viaja en el paquete inicial
import AdminView from '../views/AdminView.vue'                  // también

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),          // direcciones limpias, sin #; BASE_URL vale '/'
  routes: [
    { path: '/', component: CatalogoView },                     // se necesita al abrir la página
    { path: '/reportes', component: ReportesView },
    { path: '/admin', component: AdminView }
  ]
})
