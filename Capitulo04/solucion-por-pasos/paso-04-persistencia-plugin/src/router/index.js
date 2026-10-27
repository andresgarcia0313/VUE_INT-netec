// router/index.js: las rutas de la aplicación y la guardia que exige sesión (repaso del capítulo 3).
// Concepto nuevo de hoy: la guardia ya no usa una variable fija (haySesion = false),
// sino la tienda de sesión de Pinia, la misma que actualiza el formulario de login.
import { createRouter, createWebHistory } from 'vue-router' // repaso del capítulo 3
import { useAuthStore } from '@/stores/auth.js'             // la tienda de sesión

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),      // direcciones limpias, sin #
  routes: [
    { path: '/', redirect: '/proyectos' },                  // la raíz lleva a proyectos
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') }, // carga perezosa
    {
      path: '/proyectos',
      component: () => import('@/views/ProjectsView.vue'),  // se descarga solo al visitarla
      meta: { requiresAuth: true },                         // exige sesión
    },
  ],
})

// beforeEach: guardia global, se ejecuta antes de CADA cambio de ruta.
// Devolver true deja pasar; devolver otra ruta redirige allá.
router.beforeEach((to) => {                                 // antes de cada navegación
  // La tienda se pide DENTRO de la función: si se pidiera arriba, en el nivel del módulo,
  // Pinia aún no estaría instalada y saldría el error "getActivePinia() was called...".
  const auth = useAuthStore()                               // DENTRO de la guardia: Pinia ya está instalada
  if (to.meta.requiresAuth && !auth.isAuthenticated) {      // ¿pide sesión y no la hay?
    return { name: 'login', query: { redirect: to.fullPath } } // al formulario, guardando el destino
  }
  return true                                               // si no, adelante
})

export default router                                       // main.js lo instala
