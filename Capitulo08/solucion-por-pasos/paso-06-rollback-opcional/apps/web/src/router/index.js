// Mapa de rutas: cada dirección del navegador muestra una vista dentro de <RouterView> (capítulo 3).
import { createRouter, createWebHistory } from 'vue-router'
import InicioVista from '@/vistas/InicioVista.vue' // @ es el atajo a src/ que trae vite.config.js
import CatalogoVista from '@/vistas/CatalogoVista.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // URL limpias como /catalogo: Nginx tendrá que entenderlas
  routes: [
    { path: '/', component: InicioVista },
    { path: '/catalogo', component: CatalogoVista }
  ]
})

export default router // main.js lo importa con import router from './router'
