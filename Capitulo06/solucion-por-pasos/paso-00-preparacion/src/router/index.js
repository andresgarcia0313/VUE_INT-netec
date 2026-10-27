// router/index.js tal como lo deja create-vue con --router.
// createRouter crea el enrutador; createWebHistory usa direcciones limpias (sin #) con la History API del navegador.
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // Tabla de rutas vacía: ninguna dirección coincide todavía. Se llena en el paso 1.
  routes: [],
})

export default router
