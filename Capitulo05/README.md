# Práctica 5.4: clientes REST y GraphQL con manejo de caché y errores

<!-- lang: es-CO -->
<!-- {% raw %} -->

| Campo | Valor |
|---|---|
| Duración | 46 minutos |
| Complejidad | Intermedia |
| Nivel de Bloom | Aplicar |

## De qué trata

Vas a construir **ProjectHub**, una pantalla de proyectos y tareas, que pide sus datos a una API (Application Programming Interface, la puerta por la que un programa pide datos a otro) de dos estilos: **REST** con Axios para la lista y para crear tareas, y **GraphQL** con Apollo Client para el detalle de cada proyecto. No hay servidor real: **MSW** (Mock Service Worker, trabajador de servicio simulado) responde dentro del navegador, con errores incluidos. Al final, cada fallo llega a la pantalla como un mismo `AppError` y Apollo guarda cada proyecto y cada tarea una sola vez.

**Así se ve al terminar** (texto de la pantalla con la sesión iniciada y el proyecto abierto):

```text
ProjectHub
[Cerrar sesión]
[Portal de clientes]  [Migración de facturación]

Portal de clientes
- Diseñar pantalla de acceso
- Recuperar contraseña
Nueva tarea [________] [Crear tarea]
Caché de Apollo: 5 entradas
Task:t-1 · Task:t-2 · Project:p-100 · Task:t-3 · Project:p-200
```

El orden de las claves de la caché puede variar; lo que importa es que hay 5 y ninguna se repite.

## Objetivos

Al terminar podrás:

- Crear un cliente REST con Axios que agrega el token en cada petición y traduce todo fallo a `AppError`.
- Consultar GraphQL con Apollo Client y comprobar que la segunda visita sale de la caché, sin red.
- Mostrar un error de validación (422) junto al campo y uno de sesión (401) como aviso general.

## Conceptos que usas

Todos están en las diapositivas: Pinia y `defineStore` (capítulo 4); instancia de Axios, interceptores, `localStorage` y variables `VITE_` (tema 5.1); consulta GraphQL con variables, `gql`, `ApolloClient`, `HttpLink` e `InMemoryCache` (tema 5.2); `AppError`, normalización y `fetchPolicy` (tema 5.3); MSW (diapositiva de introducción de esta práctica).

Tres piezas pequeñas que aparecen en el código: `__typename` es el campo con el que GraphQL dice de qué tipo es cada objeto, y Apollo lo une al `id` para formar la clave `Project:p-100`; `cache.extract()` devuelve en un objeto todo lo que guarda la caché de Apollo; `import.meta.env.DEV` es `true` solo con el servidor de desarrollo de Vite, y `false` en la compilación de producción.

> **Repaso del capítulo 4:** la tienda de esta práctica es una tienda de Pinia en forma de función, como `useUiStore`: dentro declaras `ref` y funciones, y al final devuelves lo que la pantalla puede usar. La regla del capítulo sigue: los componentes leen la tienda y la tienda llama a los servicios.

## Antes de empezar

- **Node.js 24 LTS** (probado con 24.22.0), el de la guía de instalación. Compruébalo con `node -v`.
- Google Chrome y Visual Studio Code.
- Conexión a internet para descargar los paquetes.

## Preparación (6 minutos)

1. Abre una terminal en la carpeta donde guardas tus prácticas y crea el proyecto con **create-vue**, la herramienta oficial de Vue (la de `npm create vue@latest` del capítulo 0), en una versión fija para que no haga preguntas. `--bare` deja un `App.vue` mínimo y `--pinia` deja Pinia instalada y conectada; `--yes` evita la pregunta `Ok to proceed?`. El comando es igual en Windows, macOS y Linux:

   ```bash
   npx --yes create-vue@3.16.4 lab05-projecthub --bare --pinia
   cd lab05-projecthub
   npm install
   ```

   El proyecto trae `index.html`, `vite.config.js` (con el alias `@` que apunta a `src`), `jsconfig.json`, `src/main.js` (ya conecta Pinia), `src/App.vue` (solo dice `You did it!`), `src/stores/counter.js` (una tienda de ejemplo), `public/`, `.vscode/` y `.gitignore`.

2. Instala las cuatro librerías de hoy en su versión exacta (`--save-exact`). Pinia no va en la lista: create-vue ya la instaló:

   ```bash
   npm install --save-exact axios@1.20.0 @apollo/client@3.13.9 graphql@16.11.0 msw@2.7.3
   ```

3. Copia el trabajador de MSW a la carpeta `public` (la que Vite entrega tal cual al navegador):

   ```bash
   npx msw init public --save
   ```

4. Crea el archivo `.env` en la raíz del proyecto, junto a `package.json`. El prefijo `VITE_` hace que el navegador pueda leer la variable; por eso aquí nunca va una contraseña:

   ```dotenv
   VITE_API_URL=/api
   VITE_GRAPHQL_URL=/graphql
   ```

5. Borra `src/stores/counter.js`, la tienda de ejemplo: nadie la usa y la tuya la creas en el paso 4. Abre la carpeta en Visual Studio Code (`code .`).

**Qué debes ver:** la terminal termina con `Worker script successfully copied!` y en `public/` aparece `mockServiceWorker.js`.

## Paso 1. Encender el servidor simulado (5 minutos)

**Qué vas a hacer y por qué:** MSW se mete entre la aplicación y la red y contesta como un servidor de verdad. Así practicas el 401 y el 422 sin instalar un servidor.

1. Crea `src/mocks/handlers.js`. Es el código de apoyo, **cópialo tal cual: no es el tema de hoy**:

   ```js
   // src/mocks/handlers.js: el servidor simulado. Cópialo tal cual: no es el tema de hoy.
   import { http, graphql, HttpResponse } from 'msw'   // http: rutas REST; graphql: consultas

   // Datos de ejemplo; __typename le dice a Apollo de qué tipo es cada objeto
   const projects = [
     { __typename: 'Project', id: 'p-100', name: 'Portal de clientes' },
     { __typename: 'Project', id: 'p-200', name: 'Migración de facturación' }
   ]
   let tasks = [
     { __typename: 'Task', id: 't-1', projectId: 'p-100', title: 'Diseñar pantalla de acceso' },
     { __typename: 'Task', id: 't-2', projectId: 'p-100', title: 'Recuperar contraseña' },
     { __typename: 'Task', id: 't-3', projectId: 'p-200', title: 'Mapear campos antiguos' }
   ]

   // ¿La petición trae la cabecera Authorization: Bearer ...?
   const hasToken = (request) => request.headers.get('Authorization')?.startsWith('Bearer ')
   // Respuesta 401: sin sesión válida
   const unauthorized = () =>
     HttpResponse.json({ message: 'La sesión no es válida o ha expirado.' }, { status: 401 })

   export const handlers = [
     // GET /api/projects: la lista, solo con token
     http.get('/api/projects', ({ request }) =>
       hasToken(request) ? HttpResponse.json({ data: projects }) : unauthorized()),

     // POST /api/tasks: crea una tarea; sin título responde 422
     http.post('/api/tasks', async ({ request }) => {
       if (!hasToken(request)) return unauthorized()
       const body = await request.json()
       if (!body.title?.trim()) {
         return HttpResponse.json(
           { message: 'No fue posible validar la tarea.', errors: { title: ['El título es obligatorio.'] } },
           { status: 422 }
         )
       }
       const task = { __typename: 'Task', id: `t-${Date.now()}`, projectId: body.projectId, title: body.title.trim() }
       tasks = [...tasks, task]   // copia nueva del arreglo, no lo muta
       return HttpResponse.json({ data: task }, { status: 201 })
     }),

     // Consulta GraphQL ProjectTasks: un proyecto con sus tareas
     graphql.query('ProjectTasks', ({ variables }) => {
       const project = projects.find((p) => p.id === variables.projectId)
       if (!project) return HttpResponse.json({ errors: [{ message: 'Proyecto no encontrado.' }] })
       const own = tasks.filter((t) => t.projectId === project.id)
       return HttpResponse.json({ data: { project: { ...project, tasks: own } } })
     })
   ]
   ```

2. Reemplaza todo `src/main.js`. MSW debe estar escuchando **antes** de montar Vue; si no, las primeras peticiones se le escapan:

   ```js
   // src/main.js: arranca MSW y después monta Vue
   import { createApp } from 'vue'          // crea la aplicación
   import { createPinia } from 'pinia'      // el almacén de estado del capítulo 4
   import App from './App.vue'              // el componente raíz

   async function start() {                 // async: dentro se puede esperar con await
     if (import.meta.env.DEV) {             // solo en desarrollo, nunca en producción
       const { setupWorker } = await import('msw/browser')     // trae MSW solo si hace falta
       const { handlers } = await import('./mocks/handlers')   // las respuestas simuladas
       // start: registra el trabajador; lo que no simula pasa a la red real
       await setupWorker(...handlers).start({ onUnhandledRequest: 'bypass' })
     }
     createApp(App).use(createPinia()).mount('#app')   // monta Vue cuando MSW ya escucha
   }

   start()                                  // ejecuta el arranque
   ```

3. Arranca el servidor de desarrollo en el puerto propio de esta práctica y abre en Chrome la dirección que muestra la terminal (`http://localhost:5175/`):

   ```bash
   npx vite --port 5175
   ```

**Primero, predice:** la página todavía dice `You did it!`. ¿Dónde verías que MSW arrancó, si no cambia nada en pantalla?

**Qué debes ver:** abre las herramientas del navegador (**F12**) y la pestaña **Console**: dice `[MSW] Mocking enabled.` El botón flotante del centro, abajo, es Vue DevTools, que create-vue agrega solo en desarrollo; no lo necesitas hoy.

## Paso 2. Un solo formato de error y el cliente REST (8 minutos)

**Qué vas a hacer y por qué:** `AppError` es el formato único de todo fallo; el cliente REST es el único archivo que conoce Axios. Si mañana cambia el servidor, se corrige solo este archivo.

1. Crea `src/services/appError.js`. La clase es la misma de la diapositiva; debajo van los dos traductores:

   ```js
   // src/services/appError.js: la forma única de los errores
   export class AppError extends Error {                // un Error, con más datos
     constructor({
       message = 'No fue posible completar la operación.', // texto por defecto
       type = 'unknown',                                // qué pasó: network, validation...
       status = null,                                   // código HTTP, si hubo respuesta
       details = null,                                  // errores por campo (en un 422)
       cause = null                                     // el error original, para depurar
     } = {}) {                                          // sin datos: todo por defecto
       super(message)                                   // Error guarda el mensaje
       this.name = 'AppError'                           // nombre visible en la consola
       this.type = type                                 // con esto decide la vista
       this.status = status                             // guarda el código
       this.details = details                           // guarda el detalle
       this.cause = cause                               // guarda el original
     }
   }

   // Cada código HTTP se traduce a una palabra estable
   const TYPES = { 401: 'authentication', 403: 'authorization', 404: 'not-found', 422: 'validation' }

   // normalizeRestError: convierte un fallo de Axios en AppError
   export function normalizeRestError(error) {
     if (error instanceof AppError) return error        // ya traducido: igual
     if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {  // se acabó el tiempo
       return new AppError({ type: 'timeout', message: 'El servidor tardó demasiado.', cause: error })
     }
     const status = error.response?.status              // ?. evita fallar si no hubo respuesta
     if (!status) {                                     // nadie respondió: es la red
       return new AppError({ type: 'network', message: 'No se pudo conectar con el servicio.', cause: error })
     }
     const data = error.response.data                   // lo que dijo el servidor
     return new AppError({
       message: data?.message,                          // su texto (o el de por defecto)
       type: TYPES[status] ?? 'service',                // ?? : si no está en la tabla, 'service'
       status,                                          // el código recibido
       details: data?.errors ?? null,                   // errores por campo, si hay
       cause: error                                     // el original
     })
   }

   // normalizeGraphqlError: convierte un fallo de Apollo en AppError
   export function normalizeGraphqlError(error) {
     if (error.networkError) {                          // no hubo respuesta del servidor
       return new AppError({ type: 'network', message: 'No se pudo conectar con GraphQL.', cause: error })
     }
     // El servidor respondió con errores: se toma el primero
     return new AppError({ type: 'graphql', message: error.graphQLErrors?.[0]?.message, cause: error })
   }
   ```

2. Crea `src/services/restClient.js`, con los dos interceptores del tema 5.1:

   ```js
   // src/services/restClient.js: el único lugar que habla REST
   import axios from 'axios'                            // la librería HTTP
   import { normalizeRestError } from './appError'      // el traductor de errores

   const restClient = axios.create({                    // una instancia propia, no el axios global
     baseURL: import.meta.env.VITE_API_URL,             // '/api', leído del archivo .env
     timeout: 8000                                      // 8 segundos sin respuesta = timeout
   })

   // Interceptor de petición: corre antes de que salga cada una
   restClient.interceptors.request.use((config) => {
     const token = localStorage.getItem('access_token') // el token guardado al iniciar sesión
     if (token) config.headers.Authorization = `Bearer ${token}`   // lo adjunta en la cabecera
     return config                                      // sin esto, la petición no sale
   })

   // Interceptor de respuesta: todo fallo sale como AppError
   restClient.interceptors.response.use(
     (response) => response,                            // bien: pasa sin tocarla
     (error) => Promise.reject(normalizeRestError(error))   // falla: la traduce
   )

   export async function getProjects() {               // GET /api/projects
     const response = await restClient.get('/projects')
     return response.data.data                          // el servidor envuelve la lista en data
   }

   export async function createTask(task) {            // POST /api/tasks
     const response = await restClient.post('/tasks', task)
     return response.data.data                          // la tarea creada
   }
   ```

3. Prueba el servicio sin pantalla. En **Console**, pega estas dos líneas y pulsa Enter (si Chrome no deja pegar, escribe `allow pasting` o `permitir pegar` y vuelve a pegar):

   ```js
   const api = await import('/src/services/restClient.js')   // carga el servicio que acabas de escribir
   await api.getProjects().catch((e) => ({ type: e.type, status: e.status, message: e.message }))   // sin sesión: muestra solo los datos del error
   ```

**Primero, predice:** todavía no hay token. ¿Qué `type` y qué `status` tendrá el error?

**Qué debes ver:** `{type: 'authentication', status: 401, message: 'La sesión no es válida o ha expirado.'}`: son los datos del `AppError` que devolvió el interceptor. Ahora ejecuta `localStorage.setItem('access_token', 'demo')` y repite la segunda línea: llega un arreglo con los 2 proyectos. Deja todo como estaba con `localStorage.removeItem('access_token')`.

> Lo normal es que la primera línea recargue la página: Vite prepara Axios la primera vez que alguien lo importa (en la terminal: `new dependencies optimized: axios` y `reloading`). Si la segunda línea responde `ReferenceError: api is not defined`, pega otra vez las dos líneas; desde ahí ya no se recarga.

## Paso 3. GraphQL con Apollo y su caché (6 minutos)

**Qué vas a hacer y por qué:** el detalle de un proyecto llega por GraphQL en un solo viaje. Con `cache-first`, Apollo responde desde su caché si ya tiene el dato y solo va a la red si le falta.

> Urql es otro cliente GraphQL para Vue, más liviano; hoy usamos Apollo por su caché normalizada. Si quieres compararlos, es un buen ejercicio para después del curso.

1. Crea `src/services/graphqlClient.js`:

   ```js
   // src/services/graphqlClient.js: el único lugar que habla GraphQL
   import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client/core'  // /core: sin React
   import { normalizeGraphqlError } from './appError'

   const graphqlClient = new ApolloClient({             // el cliente se crea una sola vez
     link: new HttpLink({ uri: import.meta.env.VITE_GRAPHQL_URL }),   // camino: '/graphql'
     cache: new InMemoryCache()                         // guarda cada objeto una vez, por tipo e id
   })

   // gql convierte el texto en una consulta; $projectId es su variable
   const PROJECT_TASKS = gql`
     query ProjectTasks($projectId: ID!) {
       project(id: $projectId) {
         id
         name
         tasks { id title }
       }
     }
   `

   export async function getProjectTasks(projectId, force = false) {
     try {
       const result = await graphqlClient.query({
         query: PROJECT_TASKS,                          // qué pedir
         variables: { projectId },                      // con qué valores
         fetchPolicy: force ? 'network-only' : 'cache-first'   // force: ignora la caché
       })
       return result.data.project                       // la respuesta tiene la forma pedida
     } catch (error) {
       throw normalizeGraphqlError(error)               // la vista solo ve AppError
     }
   }

   // Claves guardadas en la caché, como Project:p-100 (sin la raíz ROOT_QUERY)
   export function cacheKeys() {
     return Object.keys(graphqlClient.cache.extract()).filter((key) => key !== 'ROOT_QUERY')
   }
   ```

2. Pruébalo en **Console**, una línea a la vez:

   ```js
   const gq = await import('/src/services/graphqlClient.js')   // carga el servicio GraphQL
   await gq.getProjectTasks('p-100')                          // primera vez: va a la red
   await gq.getProjectTasks('p-100')                          // segunda vez: ¿red o caché?
   gq.cacheKeys()                                             // lo que guardó Apollo
   ```

**Primero, predice:** antes de la tercera línea, ¿cuántas peticiones `graphql` habrá en la pestaña **Network** (red), con el filtro **Fetch/XHR**, después de las dos llamadas: 1 o 2?

**Qué debes ver:** las dos llamadas devuelven `Portal de clientes` con sus 2 tareas, pero en **Network**, con el filtro **Fetch/XHR**, hay **una sola** petición `graphql`: la segunda salió de la caché. Sin ese filtro también verías el archivo `graphqlClient.js` que acabas de importar; ese no es una consulta. `cacheKeys()` muestra `['Task:t-1', 'Task:t-2', 'Project:p-100']`: Apollo guarda cada objeto una vez, por su tipo y su `id` (normalización). Igual que con Axios, lo normal es que la primera línea recargue la página porque Vite prepara Apollo (`gq is not defined`): repite las líneas.

## Paso 4. La tienda y la pantalla (12 minutos)

**Qué vas a hacer y por qué:** la pantalla no llama a Axios ni a Apollo; lee la tienda, y la tienda llama a los servicios. La tienda decide con `error.type`, nunca con el texto del mensaje.

1. Crea `src/stores/projects.js`. La función `addTask` la usará el formulario del paso 5:

   ```js
   // src/stores/projects.js: el estado de la pantalla; usa los servicios, nunca la red directa
   import { defineStore } from 'pinia'                  // capítulo 4: tiendas de Pinia
   import { ref } from 'vue'
   import { getProjects, createTask } from '../services/restClient'
   import { getProjectTasks, cacheKeys } from '../services/graphqlClient'

   export const useProjectsStore = defineStore('projects', () => {   // tienda en forma de función
     const projects = ref([])                           // lista que llega por REST
     const notice = ref('')                             // aviso general para la persona
     const loggedIn = ref(Boolean(localStorage.getItem('access_token')))   // ¿hay token?

     function report(error) {                           // decide con type, no con el texto
       if (error.type !== 'validation') notice.value = error.message   // el 422 va junto al campo
     }

     async function loadProjects() {
       notice.value = ''                                // empieza sin aviso
       try {
         projects.value = await getProjects()           // REST con el token del interceptor
       } catch (error) {
         projects.value = []                            // sin datos que mostrar
         report(error)
       }
     }

     function login() {                                 // sesión simulada: guarda un token
       localStorage.setItem('access_token', 'demo-123')
       loggedIn.value = true
       loadProjects()
     }

     function logout() {                                // borra el token
       localStorage.removeItem('access_token')
       loggedIn.value = false
     }

     const selected = ref(null)                         // proyecto abierto, llega por GraphQL
     const cacheEntries = ref([])                       // lo que guarda Apollo

     async function openProject(projectId, force = false) {
       try {
         selected.value = await getProjectTasks(projectId, force)
         cacheEntries.value = cacheKeys()               // refresca la vista de la caché
       } catch (error) {
         report(error)
       }
     }

     async function addTask(title) {
       try {
         await createTask({ projectId: selected.value.id, title })   // REST: POST /api/tasks
         await openProject(selected.value.id, true)     // la caché quedó vieja: pide a la red
       } catch (error) {
         report(error)
         throw error                                    // el formulario decide qué mostrar
       }
     }

     return { projects, notice, loggedIn, loadProjects, login, logout,
       selected, cacheEntries, openProject, addTask }
   })
   ```

2. Crea `src/components/ProjectDetail.vue`:

   ```vue
   <!-- src/components/ProjectDetail.vue: el proyecto abierto y la caché de Apollo -->
   <script setup>
   import { useProjectsStore } from '../stores/projects'

   const store = useProjectsStore()                     // la misma tienda que usa App.vue
   </script>

   <template>
     <!-- solo aparece cuando hay un proyecto abierto -->
     <section v-if="store.selected">
       <h2>{{ store.selected.name }}</h2>
       <ul>
         <li v-for="task in store.selected.tasks" :key="task.id">{{ task.title }}</li>
       </ul>
       <h3>Caché de Apollo: {{ store.cacheEntries.length }} entradas</h3>
       <!-- cada clave es tipo:id, y ninguna se repite -->
       <p><code>{{ store.cacheEntries.join(' · ') }}</code></p>
     </section>
   </template>
   ```

3. Reemplaza todo `src/App.vue`. Los estilos del final son de apoyo, cópialos tal cual:

   ```vue
   <!-- src/App.vue: la pantalla principal; no conoce direcciones ni cabeceras -->
   <script setup>
   import { onMounted } from 'vue'                      // corre algo al aparecer en pantalla
   import { useProjectsStore } from './stores/projects'
   import ProjectDetail from './components/ProjectDetail.vue'

   const store = useProjectsStore()                     // la tienda del capítulo 4
   onMounted(() => store.loadProjects())                // al abrir, pide la lista
   </script>

   <template>
     <main>
       <h1>ProjectHub</h1>
       <!-- v-if / v-else: un solo botón según haya sesión o no -->
       <button v-if="store.loggedIn" @click="store.logout">Cerrar sesión</button>
       <button v-else @click="store.login">Iniciar sesión</button>
       <!-- role="alert": el lector de pantalla anuncia el aviso -->
       <p v-if="store.notice" role="alert">{{ store.notice }}</p>
       <ul>
         <li v-for="project in store.projects" :key="project.id">
           <button @click="store.openProject(project.id)">{{ project.name }}</button>
         </li>
       </ul>
       <ProjectDetail />
     </main>
   </template>

   <style>
   /* Estilos mínimos. Cópialos tal cual: no son el tema de hoy. */
   main { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; }
   [role='alert'] { color: #b00020; }
   button { margin: 0.2rem; }
   </style>
   ```

4. Recarga con **F5**, para empezar con la caché vacía.

**Primero, predice:** al abrir no hay token. ¿Qué verás antes de pulsar algún botón?

**Qué debes ver:**

- En rojo, `La sesión no es válida o ha expirado.` Pulsa **Iniciar sesión**: el aviso se va y salen los 2 proyectos. En **Network**, la petición `projects` lleva en **Headers** `Authorization: Bearer demo-123`. La puso el interceptor, no la pantalla.
- En **Console** sale en rojo `Failed to load resource: ... 401 (Unauthorized)`: es Chrome anotando el 401 que acabas de provocar, no un fallo de tu código.
- Abre **Portal de clientes**, luego **Migración de facturación** y vuelve a **Portal de clientes**: en **Network** (**Fetch/XHR**) solo **2** peticiones `graphql` y el panel dice `Caché de Apollo: 5 entradas`, con `Project:p-100` una sola vez.

## Paso 5. Crear tareas: el 422 junto al campo y el 401 como aviso (7 minutos)

**Qué vas a hacer y por qué:** el mismo `AppError` llega con dos `type` distintos y la pantalla decide dónde mostrarlo. Al crear una tarea, la caché de Apollo queda vieja; por eso `addTask` vuelve a pedir el proyecto con `network-only`.

1. Crea `src/components/TaskForm.vue`:

   ```vue
   <!-- src/components/TaskForm.vue: crea una tarea y muestra el 422 junto al campo -->
   <script setup>
   import { ref } from 'vue'
   import { useProjectsStore } from '../stores/projects'

   const store = useProjectsStore()
   const title = ref('')                                // lo que escribe la persona
   const titleError = ref('')                           // mensaje debajo del campo

   async function submit() {
     titleError.value = ''                              // limpia el error anterior
     try {
       await store.addTask(title.value)                 // la tienda llama al servicio REST
       title.value = ''                                 // éxito: vacía el campo
     } catch (error) {
       // Decide con type: solo la validación se queda junto al campo
       if (error.type === 'validation') titleError.value = error.details?.title?.[0] ?? error.message
     }
   }
   </script>

   <template>
     <!-- .prevent: evita que el navegador recargue la página al enviar -->
     <form @submit.prevent="submit">
       <label for="task-title">Nueva tarea</label>
       <input id="task-title" v-model="title" :aria-invalid="Boolean(titleError)" />
       <button type="submit">Crear tarea</button>
       <p v-if="titleError" role="alert">{{ titleError }}</p>
     </form>
   </template>
   ```

2. En `src/components/ProjectDetail.vue`, agrega `import TaskForm from './TaskForm.vue'` debajo del `import` de la tienda, y `<TaskForm />` justo después de `</ul>`. Guarda y abre **Portal de clientes**.

**Primero, predice:** con el campo vacío pulsas **Crear tarea**. ¿El mensaje sale arriba, como aviso general, o debajo del campo?

**Qué debes ver:**

- Campo vacío: debajo del campo, `El título es obligatorio.`; en **Network**, `tasks` con estado **422**, y en **Console** la línea roja `Failed to load resource: ... 422`, provocada a propósito. La aplicación sigue respondiendo.
- Escribe `Probar en Chrome` y crea la tarea: aparece en la lista, `tasks` responde **201** y sale una petición `graphql` nueva, la del `network-only`. El panel de caché pasa a 6 entradas: la tarea nueva también se guarda una sola vez.
- Pulsa **Cerrar sesión** y crea otra tarea: arriba, `La sesión no es válida o ha expirado.`, y `tasks` con **401**. La lista y el proyecto siguen en pantalla porque `logout` solo borra el token; quien rechaza es el servidor. Pulsa **Iniciar sesión** antes de seguir.

> Si guardas `handlers.js` o `main.js`, Vite recarga la página y las tareas que creaste desaparecen: los datos simulados viven en memoria. El token sigue, porque está en `localStorage`.

<details markdown="1">
<summary>Código final de ProjectDetail.vue</summary>

```vue
<!-- src/components/ProjectDetail.vue: el proyecto abierto y la caché de Apollo -->
<script setup>
import { useProjectsStore } from '../stores/projects'
import TaskForm from './TaskForm.vue'

const store = useProjectsStore()                     // la misma tienda que usa App.vue
</script>

<template>
  <!-- solo aparece cuando hay un proyecto abierto -->
  <section v-if="store.selected">
    <h2>{{ store.selected.name }}</h2>
    <ul>
      <li v-for="task in store.selected.tasks" :key="task.id">{{ task.title }}</li>
    </ul>
    <TaskForm />
    <h3>Caché de Apollo: {{ store.cacheEntries.length }} entradas</h3>
    <!-- cada clave es tipo:id, y ninguna se repite -->
    <p><code>{{ store.cacheEntries.join(' · ') }}</code></p>
  </section>
</template>
```

</details>

## Paso 6. Comprobar la separación y limpiar (2 minutos)

1. Detén el servidor con `Ctrl+C` y busca direcciones, cabeceras o Axios en los componentes. Este comando cambia según el sistema:

   **Windows (PowerShell)**

   ```powershell
   Select-String -Path src\App.vue, src\components\*.vue -Pattern '/api', 'Authorization', 'axios'
   ```

   **macOS y Linux**

   ```bash
   grep -nE "/api|Authorization|axios" src/App.vue src/components/*.vue
   ```

**Qué debes ver:** ninguna línea. Las direcciones viven en `.env`, las cabeceras en `restClient.js` y la pantalla solo habla con la tienda.

2. Si quieres liberar espacio, borra la carpeta `node_modules`; `npm install` la recrea.

## Laboratorio resuelto

La carpeta [`ejercicio-resuelto/`](https://github.com/netec-mx/VUE_INT/tree/main/Capitulo05/ejercicio-resuelto) de este capítulo tiene el proyecto terminado, igual al que construyes con esta guía. Úsalo para comparar al final o si te atascas: lo que se aprende está en escribirlo tú.

```bash
cd ejercicio-resuelto
npm install              # instala las dependencias
npx vite --port 5175     # arranca la aplicación en http://localhost:5175
```

## Problemas frecuentes

| Lo que ves | Por qué pasa | Arreglo |
|---|---|---|
| En **Console**: `[MSW] Failed to register a Service Worker ... 404` | `mockServiceWorker.js` no está en `public/` | Desde la carpeta del proyecto: `npx msw init public --save` y recarga con `Ctrl+Shift+R` |
| La lista nunca llega y en **Network** `projects` va a `/projects` sin `/api` | Vite no leyó `.env`: lo creaste con el servidor encendido o con otro nombre | Revisa que se llame `.env`, junto a `package.json`, y reinicia `npx vite --port 5175` |
| En **Console**, una sola vez: `Failed to update a ServiceWorker ... mockServiceWorker.js: Not found` | Chrome revisó el trabajador de MSW justo mientras Vite recargaba la página | Recarga con `Ctrl+Shift+R`; MSW sigue respondiendo |
| En **Console**: `ReferenceError: api is not defined` (o `gq is not defined`) | La primera importación hizo que Vite preparara Axios o Apollo y recargara la página; lo que habías definido se perdió | Pega otra vez las líneas del paso |
| `Failed to fetch dynamically imported module` o `504 (Outdated Optimize Dep)` | Vite preparó una librería nueva (Axios o Apollo) mientras la página estaba abierta | Recarga la página |
| `store.openProject is not a function` o una pantalla que no cambia | Cambiaste la tienda con la página abierta y sigue viva la tienda anterior | Recarga con `F5` |
| Chrome no deja pegar en **Console** | Protección de Chrome contra código pegado | Escribe `allow pasting` (o `permitir pegar`) y pega otra vez |
| Error de Apollo al usar `fetchPolicy: 'cache-and-network'` | `client.query` responde una sola vez y no admite esa política; es de `useQuery` | Usa `cache-first` o `network-only`, como en esta guía |
| Vite dice `Port 5175 is in use, trying another one...` | Otra práctica ocupa ese puerto | Usa la dirección que muestra la terminal |
| `npm create vue@latest` pregunta TypeScript, JSX, Router y más, o el proyecto no arranca en tu Node | La versión más nueva de create-vue hace preguntas y trae Vite 7, que pide un Node más reciente que el de la guía | Usa la versión fija de la guía: `npx --yes create-vue@3.16.4 lab05-projecthub --bare --pinia` |
| `npm run dev -- --port 5175` arranca en el 5173 | En PowerShell se pierde el `--` y Vite no recibe el puerto | Usa `npx vite --port 5175` |

## Ejercicios de reserva

**Básico.** Agrega en `App.vue` un botón que abra el proyecto `p-999`, que no existe. ¿Qué aviso sale y qué `type` lo produjo?

<details markdown="1">
<summary>Solución</summary>

```vue
<button @click="store.openProject('p-999')">Proyecto inexistente</button>   <!-- id que el servidor no conoce -->
```

Sale `Proyecto no encontrado.`: el servidor GraphQL respondió con `errors` y `normalizeGraphqlError` lo tradujo a `type: 'graphql'`.

</details>

**Medio.** Haz que la lista tarde 2 segundos y que el cliente espere solo 1. ¿Qué aviso ves ahora?

<details markdown="1">
<summary>Solución</summary>

En `handlers.js`, importa `delay` y espera antes de responder; en `restClient.js`, cambia `timeout: 8000` por `timeout: 1000`:

```js
import { http, graphql, HttpResponse, delay } from 'msw'   // delay: pausa la respuesta simulada
http.get('/api/projects', async ({ request }) => {         // async para poder esperar
  await delay(2000)                                        // tarda 2 segundos
  return hasToken(request) ? HttpResponse.json({ data: projects }) : unauthorized()
}),
```

Sale `El servidor tardó demasiado.` (`type: 'timeout'`). Deja los valores como estaban al terminar.

</details>

**Avanzado.** Con un TTL (time to live, tiempo de vida) de 30 segundos, haz que `loadProjects` no vuelva a pedir la lista si la pidió hace menos de 30 segundos, salvo que reciba `force` en `true`.

<details markdown="1">
<summary>Solución</summary>

```js
let lastFetchedAt = 0                                     // cuándo llegó la lista por última vez
const TTL = 30_000                                        // 30 segundos en milisegundos

async function loadProjects(force = false) {
  if (!force && Date.now() - lastFetchedAt < TTL) return  // aún fresca: no pide
  notice.value = ''
  try {
    projects.value = await getProjects()
    lastFetchedAt = Date.now()                            // marca la hora de llegada
  } catch (error) {
    projects.value = []
    report(error)
  }
}
```

En `login()`, llama `loadProjects(true)`: al iniciar sesión siempre se pide de nuevo.

</details>

## Control de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 2.2 | 2026-10-17 | Andrés Eduardo García Márquez | El proyecto se crea con create-vue, como enseñan los manuales: `npx --yes create-vue@3.16.4 lab05-projecthub --bare --pinia`. Pinia sale de la lista de `npm install` porque la trae create-vue. Se describe qué trae el proyecto y se borra `src/stores/counter.js`; desaparece el borrado de `HelloWorld.vue`, `assets/` y `style.css`. Aviso del botón de Vue DevTools. `ejercicio-resuelto/` rehecho siguiendo la guía. Validada por CLI en Windows y Linux |
| 2.1 | 2026-10-16 | Andrés Eduardo García Márquez | Validada por CLI desde carpeta vacía en Windows y Linux. `npx --yes create-vite@6.4` y `npx vite --port 5175` (en PowerShell `npm` pierde el `--`). Axios 1.20.0 en lugar de 1.12.2 (`npm audit` marcaba una vulnerabilidad alta). Borrado de la plantilla movido al paso 4. Consola del paso 2 muestra `type`, `status` y `message`. Filtro **Fetch/XHR** para contar peticiones `graphql`. Orden real de `cacheKeys()`. Recarga de Vite anunciada como normal. Rótulos por sistema en el paso 6. Notas de `__typename`, `cache.extract()`, `import.meta.env.DEV`, Urql y del `logout`. Tiempos de los pasos 3, 4 y 6 ajustados (total 46). Tres filas nuevas en Problemas frecuentes |
| 2.0 | 2026-10-16 | Andrés Eduardo García Márquez | Guía rehecha desde carpeta vacía con `npm create vite@6.4`, sin clonar ni depender del laboratorio anterior. Servidor simulado relativo con `__typename` para que Apollo normalice. `cache-first` y `network-only` en lugar de `cache-and-network`. Un solo `AppError`. Panel de caché visible. Predicción y resultado por paso, ejercicios de reserva y carpeta `solucion/` |

<!-- {% endraw %} -->
