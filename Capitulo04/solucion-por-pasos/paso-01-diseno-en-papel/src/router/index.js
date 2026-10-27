// router/index.js: el enrutador que dejó create-vue, todavía SIN rutas.
// Si abres /proyectos con este archivo verás el aviso "No match found": en el paso 2 lo reemplazas.
import { createRouter, createWebHistory } from 'vue-router' // Vue Router: relaciona direcciones (URL) con componentes

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),      // direcciones limpias, sin # (capítulo 3)
  routes: [],                                               // lista de rutas: vacía por ahora
})

export default router                                       // main.js lo importa y lo instala
