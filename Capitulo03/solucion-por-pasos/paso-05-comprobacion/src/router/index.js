// router/index.js: la tabla de rutas y la configuración del enrutador (Vue Router 4).
// Cada ruta une una dirección (path) con un componente; name permite navegar sin escribir la dirección.
import { createRouter, createWebHistory } from 'vue-router'    // funciones para crear el enrutador
import { useSesion } from '../sesion'                          // la guardia consulta la sesión
import LoginView from '../views/LoginView.vue'                  // pantalla pública de ingreso
import ForbiddenView from '../views/ForbiddenView.vue'          // aviso de acceso prohibido
import ProjectHubLayout from '../views/ProjectHubLayout.vue'    // marco con el menú del área de trabajo
import NotFoundView from '../views/NotFoundView.vue'            // página para direcciones que no existen
import ChunkRecoveryView from '../views/ChunkRecoveryView.vue'  // aviso cuando falla la descarga de una vista
// Carga perezosa (lazy loading): () => import() es una función que Vue Router llama solo al visitar la ruta.
// Vite parte cada una en su propio archivo .js (un fragmento o chunk) que se descarga bajo demanda.
const DashboardView = () => import('../views/DashboardView.vue')  // con la flecha, se descarga al visitarla
const ProjectsView = () => import('../views/ProjectsView.vue')    // archivo aparte, bajo demanda
const TaskDetailView = () => import('../views/TaskDetailView.vue') // archivo aparte, bajo demanda
const AdminView = () => import('../views/AdminView.vue')          // solo lo descarga quien entra a /admin

const routes = [                                                // la tabla: dirección -> componente
  // redirect: la raíz no dibuja nada, reenvía a otra ruta (aquí, por su name).
  { path: '/', redirect: { name: 'dashboard' } },               // la raíz lleva al tablero, por nombre
  // Rutas públicas: no tienen meta.requiresAuth, la guardia las deja pasar.
  { path: '/login', name: 'login', component: LoginView },      // pública
  { path: '/forbidden', name: 'forbidden', component: ForbiddenView }, // pública
  { path: '/chunk-recovery', name: 'chunk-recovery', component: ChunkRecoveryView }, // pública
  // Ruta anidada: el padre /app dibuja ProjectHubLayout y, en su RouterView, la hija que coincida.
  {
    path: '/app',                                               // ruta padre del área de trabajo
    component: ProjectHubLayout,                                // su RouterView dibuja a los hijos
    // meta: datos libres de la ruta. requiresAuth en el padre aplica a todas sus hijas (to.meta los fusiona).
    meta: { requiresAuth: true },                               // requisito: los hijos lo heredan
    children: [                                                 // hijas: /app/dashboard, /app/projects...
      { path: 'dashboard', name: 'dashboard', component: DashboardView },
      { path: 'projects', name: 'projects', component: ProjectsView },
      // :taskId es un parámetro dinámico; props: true lo entrega a la vista como prop.
      { path: 'tasks/:taskId', name: 'task-detail', component: TaskDetailView, props: true }, // :taskId llega como prop
    ],
  },
  // roles: requisito extra; solo pasa quien tenga uno de esos roles.
  { path: '/admin', name: 'admin', component: AdminView, meta: { requiresAuth: true, roles: ['admin'] } }, // solo admin
  // Comodín (catch-all): coincide con cualquier dirección; va de último para no tapar a las demás.
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView }, // comodín: siempre de último
]

const router = createRouter({                                   // el enrutador de la aplicación
  history: createWebHistory(import.meta.env.BASE_URL),          // direcciones limpias, sin #
  routes,                                                       // la tabla de arriba
})

// Guardia global beforeEach: corre ANTES de cada navegación. Lo que devuelve decide:
// nada (undefined) = sigue; un objeto de ruta = redirige allá; false = cancela.
router.beforeEach((to) => {                                     // la guardia: corre antes de CADA navegación
  const { conectado, usuario } = useSesion()                    // estado de la sesión en este momento
  if (to.meta.requiresAuth && !conectado.value) {               // pide sesión y no hay
    return { name: 'login', query: { redirect: to.fullPath } }  // al ingreso, recordando a dónde iba
  }
  if (to.meta.roles && !to.meta.roles.includes(usuario.value.rol)) { // pide un rol que no tiene
    return { name: 'forbidden' }                                // lo manda al aviso de prohibido
  }
  if (to.name === 'login' && conectado.value) return { name: 'dashboard' } // ya entró: no repite el ingreso
})                                                              // sin return, la navegación sigue

// afterEach: corre DESPUÉS de cada navegación (no puede cambiarla). Aquí se usa para precargar:
// llamar DashboardView() inicia la descarga del fragmento antes de que la persona lo pida.
router.afterEach((to) => {                                      // corre al terminar cada navegación
  if (to.name === 'login') DashboardView()                      // precarga: desde el ingreso casi todos van al tablero
})

// El tercer argumento de afterEach (failure) indica una navegación que no se completó:
// cancelada, abortada por una guardia o redundante (ir a donde ya estás). No es un error grave.
router.afterEach((to, from, failure) => {                       // segundo oyente: navegaciones que no se completaron
  if (failure) console.info('[ProjectHub] Navegación no completada:', failure.message) // aviso, no error
})

// onError: atrapa errores lanzados durante la navegación, por ejemplo cuando un import() falla
// porque el fragmento ya no existe en el servidor (fragmento perdido tras publicar otra versión).
router.onError((error, to) => {                                 // errores al navegar, como una descarga fallida
  const perdido = /dynamically imported module|Importing a module script failed/i.test(error.message) // ¿falló la descarga?
  if (perdido) router.replace({ name: 'chunk-recovery', query: { target: to.fullPath } }) // muestra el aviso
})

export default router                                           // main.js lo conecta a la aplicación
