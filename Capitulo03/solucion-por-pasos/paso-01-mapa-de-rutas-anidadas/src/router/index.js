// router/index.js: la tabla de rutas y la configuración del enrutador (Vue Router 4).
// Cada ruta une una dirección (path) con un componente; name permite navegar sin escribir la dirección.
import { createRouter, createWebHistory } from 'vue-router'    // funciones para crear el enrutador
import ProjectHubLayout from '../views/ProjectHubLayout.vue'    // marco con el menú del área de trabajo
import NotFoundView from '../views/NotFoundView.vue'            // página para direcciones que no existen
// Importación estática: estas vistas viajan dentro del archivo principal index-<código>.js.
import DashboardView from '../views/DashboardView.vue'          // vista del tablero
import ProjectsView from '../views/ProjectsView.vue'            // vista de proyectos
import TaskDetailView from '../views/TaskDetailView.vue'        // vista de detalle de una tarea

const routes = [                                                // la tabla: dirección -> componente
  // redirect: la raíz no dibuja nada, reenvía a otra ruta (aquí, por su name).
  { path: '/', redirect: { name: 'dashboard' } },               // la raíz lleva al tablero, por nombre
  // Ruta anidada: el padre /app dibuja ProjectHubLayout y, en su RouterView, la hija que coincida.
  {
    path: '/app',                                               // ruta padre del área de trabajo
    component: ProjectHubLayout,                                // su RouterView dibuja a los hijos
    children: [                                                 // hijas: /app/dashboard, /app/projects...
      { path: 'dashboard', name: 'dashboard', component: DashboardView },
      { path: 'projects', name: 'projects', component: ProjectsView },
      // :taskId es un parámetro dinámico; props: true lo entrega a la vista como prop.
      { path: 'tasks/:taskId', name: 'task-detail', component: TaskDetailView, props: true }, // :taskId llega como prop
    ],
  },
  // Comodín (catch-all): coincide con cualquier dirección; va de último para no tapar a las demás.
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView }, // comodín: siempre de último
]

const router = createRouter({                                   // el enrutador de la aplicación
  history: createWebHistory(import.meta.env.BASE_URL),          // direcciones limpias, sin #
  routes,                                                       // la tabla de arriba
})

export default router                                           // main.js lo conecta a la aplicación
