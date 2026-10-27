# Práctica 4.4: diseñar y aplicar una arquitectura de stores para una aplicación compleja

<!-- lang: es-CO -->
<!-- {% raw %} -->

| Campo | Valor |
|---|---|
| Duración | 46 minutos |
| Complejidad | Media |
| Nivel de Bloom | Crear |

## De qué trata

Vas a repartir el estado de una aplicación de proyectos y tareas, **ProjectHub**, en cinco tiendas de Pinia, una por tema: sesión, proyectos, tareas, interfaz y estado de la API (la interfaz de programación por la que la aplicación le pide datos al servidor). Al terminar, el tema, el filtro y una sesión mínima sobreviven a la recarga sin guardar el token, y cada carga y cada error quedan en un solo lugar.

**Así se ve al terminar:** un encabezado con tu nombre y el botón **Salir**; debajo, los botones **Cambiar tema** y **Simular error**, el filtro **Mostrar**, la línea `Semáforo de proyectos: success - Errores registrados: 0` y dos proyectos con sus tareas para marcar.

## Objetivos

Al terminar podrás:

- Diseñar tiendas Pinia independientes para sesión, proyectos, tareas, interfaz y estado de la API.
- Escribir tiendas de composición (Setup Stores) con datos, getters y actions asíncronas.
- Guardar cada proyecto y cada tarea una sola vez (`byId` y `allIds`).
- Escribir un plugin que guarda solo lo que cada tienda declara, nunca credenciales, y otro que audita las actions solo en desarrollo.

## Conceptos que usas

Todos se vieron en las diapositivas; entre paréntesis, el capítulo.

- `ref`, `computed`, `watch` y `onMounted` (1). `script setup` y composables que empiezan por `use` (2).
- `beforeEach`, `meta.requiresAuth`, `query.redirect` y la carga perezosa con `() => import(...)` (3).
- `defineStore` en sus dos estilos, `storeToRefs`, `$patch`, `$subscribe`, `$onAction`, `pinia.use`, `localStorage` e `import.meta.env.DEV` (4).

**Repaso del capítulo 3:** en sus diapositivas, la guardia tenía `const haySesion = false // fijo por ahora`. Hoy la cambias por la tienda de sesión real.

## Antes de empezar

- **Node.js 24 LTS** (el programa que ejecuta JavaScript fuera del navegador); la guía se probó con 24.22.0 en Windows y 24.18.0 en Linux. Compruébalo con `node -v`.
- Google Chrome y Visual Studio Code con la extensión **Vue (Official)**.
- No necesitas descargar nada del repositorio: todo el código está en esta guía. Las herramientas de Vue para ver cada tienda por dentro ya vienen en el proyecto que crea `create-vue`; no hace falta instalar extensiones en Chrome.

## Preparación (6 minutos)

1. Abre una terminal donde guardes tus prácticas y crea una carpeta vacía para esta. Los comandos son iguales en Windows, macOS y Linux:

   ```bash
   mkdir labs-vue-cap04
   cd labs-vue-cap04
   ```

2. Crea el proyecto con `create-vue`, la herramienta oficial de Vue (la misma de `npm create vue@latest`), ya con Vue Router y Pinia, e instala las dependencias. La versión queda fijada en 3.16.4 porque trae Vite 6, que corre con el Node.js de la guía de instalación; las opciones evitan las preguntas del asistente:

   ```bash
   npx --yes create-vue@3.16.4 projecthub --bare --router --pinia
   cd projecthub
   npm install
   ```

   `--bare` deja un `App.vue` mínimo, sin componentes de ejemplo; `--router` agrega Vue Router y `--pinia` agrega Pinia.

3. Abre la carpeta en el editor con `code .` y mira lo que creó `create-vue`:

   | Archivo | Qué es | Qué haces con él |
   |---|---|---|
   | `src/main.js` | Crea la aplicación e instala Pinia y el enrutador | Lo reemplazas en el paso 2 |
   | `src/App.vue` | Componente raíz con un título de prueba | Lo reemplazas en el paso 2 |
   | `src/router/index.js` | Enrutador sin rutas | Lo reemplazas en el paso 2 |
   | `src/stores/counter.js` | Tienda de ejemplo (un contador) | **Bórralo ahora**: no se usa |
   | `vite.config.js` | Configuración de Vite: el atajo `@` apunta a `src/` y activa Vue DevTools | No lo tocas |
   | `index.html` | Página que carga la aplicación | Le cambias el idioma y el título (punto 4) |

4. En `index.html` cambia `lang=""` por `lang="es"` (el lector de pantalla leerá en español) y `<title>Vite App</title>` por `<title>ProjectHub</title>`.

**Qué debes ver:** `added ... packages` sin errores; en `package.json`, `pinia` y `vue-router` dentro de `dependencies`, y en `src/` quedan `App.vue`, `main.js`, `router/index.js` y la carpeta `stores` vacía.

En esta guía, `@/` es el atajo a `src/`: `@/stores/auth.js` es `src/stores/auth.js` desde cualquier carpeta. Entre archivos de la misma carpeta se usa `./`.

## Paso 1. Diseñar las cinco tiendas en papel (1 minuto)

**Qué vas a hacer y por qué:** antes de escribir una tienda se decide qué dato vive en ella y si debe sobrevivir a la recarga. Es el ejercicio del tema 4.2 y evita que una tienda se vuelva el cajón donde cae lo que no encontró lugar.

**Primero, predice:** copia la tabla en una hoja y llena la última columna con **sí** o **no** y una razón de una línea.

| Tienda | Archivo | Datos | ¿Se guarda al recargar? |
|---|---|---|---|
| Sesión | `stores/auth.js` | `user` (nombre y roles), `token` | |
| Interfaz | `stores/ui.js` | `theme`, `filter`, `toast` (aviso) | |
| Estado de la API | `stores/apiStatus.js` | `pending`, `errors` | |
| Proyectos | `stores/projects.js` | `byId`, `allIds`, `status` | |
| Tareas | `stores/tasks.js` | `byId`, `allIds` | |

<details markdown="1">
<summary>Compara con la respuesta</summary>

Se guardan `user`, `theme` y `filter`: los eligió la persona. No se guardan `token` (una credencial; en producción va en una cookie HttpOnly), `toast`, `pending` y `errors` (describen un momento) ni proyectos y tareas (los trae la API). Las dependencias van en una sola dirección: `projects` y `tasks` usan `apiStatus`, y `apiStatus` y `tasks` usan `ui`. `ui` no usa ninguna.

</details>

## Paso 2. Pinia, la tienda de sesión y la guardia (9 minutos)

**Qué vas a hacer y por qué:** conectas Pinia a la aplicación y enlazas la guardia del capítulo 3 a una tienda de sesión. La tienda se escribe como función (tienda de composición): `ref` hace de dato, `computed` de getter y cada función de action.

1. Crea `src/api.js`. Cópialo tal cual, no es el tema de hoy:

   ```js
   // API simulada: cópiala tal cual, no es el tema de hoy. No hay servidor real detrás.
   const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) // espera ms milisegundos

   const PROJECTS = [
     { id: 'p1', name: 'Sitio web' },
     { id: 'p2', name: 'App móvil' },
   ]

   const TASKS = [
     { id: 't1', projectId: 'p1', title: 'Diseñar la portada', done: true },
     { id: 't2', projectId: 'p1', title: 'Publicar el sitio', done: false },
     { id: 't3', projectId: 'p2', title: 'Pantalla de inicio', done: false },
     { id: 't4', projectId: 'p2', title: 'Pruebas en Android', done: false },
   ]

   export const api = {
     async signIn(name) {
       await wait(300)
       if (!name.trim()) throw new Error('Escribe tu nombre para entrar')
       return { user: { name: name.trim(), roles: ['editor'] }, token: `demo-${Date.now()}` }
     },
     async getProjects(fail = false) {
       await wait(400)
       if (fail) throw new Error('el servidor respondió 500')
       return PROJECTS.map((project) => ({ ...project })) // copias: la recarga en caliente no duplica datos
     },
     async getTasks() {
       await wait(300)
       return TASKS.map((task) => ({ ...task }))
     },
   }
   ```

2. Reemplaza todo `src/main.js`. El de `create-vue` ya instala Pinia y el enrutador; este guarda Pinia en una variable, porque en los pasos 4 y 5 le registrarás plugins:

   ```js
   import { createApp } from 'vue'                      // crea la aplicación
   import { createPinia } from 'pinia'                  // crea Pinia, el gestor de tiendas
   import App from './App.vue'                          // componente principal
   import router from './router'                        // enrutador: Vite abre src/router/index.js

   const pinia = createPinia()                          // la instancia de Pinia, en una variable para hablarle

   createApp(App)                                       // crea la aplicación con App como raíz
     .use(pinia)                                        // primero Pinia: la guardia del enrutador usa una tienda
     .use(router)                                       // después el enrutador
     .mount('#app')                                     // la dibuja dentro de <div id="app">
   ```

3. Crea `src/stores/auth.js`. Fíjate en el tercer argumento de `defineStore`: la opción `persist` no hace nada hasta el paso 4.

   ```js
   import { defineStore } from 'pinia'          // crea tiendas
   import { computed, ref } from 'vue'          // piezas del capítulo 1
   import { api } from '@/api.js'               // API simulada (@ = src)

   // Tienda de composición: una función que arma la tienda con ref, computed y funciones
   export const useAuthStore = defineStore('auth', () => {
     const user = ref(null)                     // sesión mínima: { name, roles }; null = sin sesión
     const token = ref(null)                    // credencial: vive solo en memoria, nunca se guarda
     const isAuthenticated = computed(() => user.value !== null) // getter: ¿hay sesión?

     async function signIn(name) {              // action asíncrona: espera a la API
       const session = await api.signIn(name)   // si el nombre está vacío, lanza un error
       user.value = session.user                // guarda quién entró y sus roles
       token.value = session.token              // el token queda solo en memoria
     }

     function signOut() {                       // action: cierra la sesión
       user.value = null                        // sin usuario...
       token.value = null                       // ...y sin token
     }

     return { user, token, isAuthenticated, signIn, signOut } // lo que ven los componentes
   }, {
     // persist es una opción NUESTRA: Pinia la ignora; la leerá el plugin del paso 4
     persist: { key: 'projecthub:auth:v1', paths: ['user'] }  // solo user; token queda fuera
   })
   ```

4. Reemplaza todo `src/router/index.js` (repaso del capítulo 3: rutas, carga perezosa y guardia):

   ```js
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

   router.beforeEach((to) => {                                 // antes de cada navegación
     const auth = useAuthStore()                               // DENTRO de la guardia: Pinia ya está instalada
     if (to.meta.requiresAuth && !auth.isAuthenticated) {      // ¿pide sesión y no la hay?
       return { name: 'login', query: { redirect: to.fullPath } } // al formulario, guardando el destino
     }
     return true                                               // si no, adelante
   })

   export default router                                       // main.js lo instala
   ```

5. Crea `src/views/LoginView.vue`. El nombre escrito es estado **local**: solo lo usa este formulario, por eso no va a una tienda.

   ```vue
   <script setup>
   import { ref } from 'vue'                         // estado local del formulario
   import { useRoute, useRouter } from 'vue-router'  // la ruta actual y el enrutador
   import { useAuthStore } from '@/stores/auth.js'   // la tienda de sesión

   const auth = useAuthStore()                       // estado global: la sesión
   const route = useRoute()                          // para leer ?redirect=...
   const router = useRouter()                        // para navegar al entrar
   const name = ref('')                              // estado LOCAL: solo lo usa este formulario
   const error = ref('')                             // también local: el mensaje del formulario

   async function submit() {
     error.value = ''                                // borra el mensaje anterior
     try {
       await auth.signIn(name.value)                 // la tienda habla con la API
       router.push(route.query.redirect ?? '/proyectos') // vuelve adonde quería ir (capítulo 3)
     } catch (e) {
       error.value = e.message                       // muestra por qué no pudo entrar
     }
   }
   </script>

   <template>
     <form @submit.prevent="submit">
       <h2>Iniciar sesión</h2>
       <label>Nombre <input v-model="name" autocomplete="username" /></label>
       <button type="submit">Entrar</button>
       <p v-if="error" role="alert">{{ error }}</p>
     </form>
   </template>
   ```

6. Crea `src/views/ProjectsView.vue` con esta versión provisional; en el paso 3 la reemplazas completa:

   ```vue
   <!-- Versión provisional: en el paso 3 la reemplazas completa -->
   <template>
     <h2>Proyectos</h2>
   </template>
   ```

7. Reemplaza todo `src/App.vue`:

   ```vue
   <script setup>
   import { storeToRefs } from 'pinia'              // saca datos de una tienda sin perder la conexión
   import { useRouter } from 'vue-router'           // para navegar desde código
   import { useAuthStore } from '@/stores/auth.js'  // la tienda de sesión

   const auth = useAuthStore()                      // la misma tienda que consulta la guardia
   const { user } = storeToRefs(auth)               // lo que se lee, con storeToRefs
   const router = useRouter()                       // el enrutador

   function logout() {
     auth.signOut()                                 // lo que se llama, directo desde la tienda
     router.push({ name: 'login' })                 // de vuelta al formulario
   }
   </script>

   <template>
     <header>
       <h1>ProjectHub</h1>
       <p v-if="user">
         {{ user.name }} ({{ user.roles.join(', ') }})
         <button type="button" @click="logout">Salir</button>
       </p>
     </header>
     <main>
       <RouterView />
     </main>
   </template>

   <style>
   /* Estilos: cópialos tal cual, no son el tema de hoy */
   :root { font-family: system-ui, sans-serif; background: #ffffff; color: #1a1a1a; }
   :root[data-theme='dark'] { background: #1a1a1a; color: #f2f2f2; }
   body { margin: 0 auto; max-width: 720px; padding: 1rem; }
   [role='alert'] { border: 2px solid #b00020; padding: 0.5rem; }
   </style>
   ```

8. Arranca el servidor (este laboratorio usa el puerto 5174) y abre `http://localhost:5174/proyectos` en Chrome. `npx vite` ejecuta el Vite instalado en el proyecto, igual que `npm run dev`, y recibe el puerto sin el `--` que PowerShell se come:

   ```bash
   npx vite --port 5174
   ```

**Primero, predice:** sin sesión, ¿qué dirección verás al abrir `/proyectos`?

**Qué debes ver:** la guardia te lleva a `/login?redirect=/proyectos`. Pulsa **Entrar** con el nombre vacío: aparece `Escribe tu nombre para entrar`. Escribe `Ana` y pulsa **Entrar**: llegas a **Proyectos** y el encabezado dice `Ana (editor)`.

**Predice otra vez:** si recargas con `F5`, ¿sigues dentro? Hazlo. Vuelves al formulario: la tienda vive en memoria y la recarga la borra. El paso 4 lo resuelve.

## Paso 3. Tiendas por dominio, normalizadas, con la carga y los errores en un solo lugar (14 minutos)

**Qué vas a hacer y por qué:** creas las otras cuatro tiendas. Proyectos y tareas se guardan **normalizados**: cada elemento una sola vez en `byId` (un objeto cuyo índice es el id) y el orden en `allIds`. Toda llamada a la API pasa por `apiStatus.track`, que cuenta las peticiones en curso y anota los errores.

1. Crea `src/stores/ui.js`. El `watch` es un efecto secundario: aplica el tema a la página cada vez que cambia.

   ```js
   import { defineStore } from 'pinia'          // crea tiendas
   import { ref, watch } from 'vue'             // piezas del capítulo 1

   export const useUiStore = defineStore('ui', () => {
     const theme = ref('light')                 // preferencia: 'light' u 'dark'
     const filter = ref('todas')                // preferencia: 'todas', 'pendientes' o 'hechas'
     const toast = ref('')                      // aviso momentáneo: NO se guarda

     function toggleTheme() {                   // action: alterna claro y oscuro
       theme.value = theme.value === 'dark' ? 'light' : 'dark'
     }

     function notify(message) {                 // action: muestra (o borra, con '') un aviso
       toast.value = message
     }

     // efecto secundario: cada vez que cambia el tema, lo aplica a la página
     watch(theme, (value) => { document.documentElement.dataset.theme = value }, { immediate: true })

     return { theme, filter, toast, toggleTheme, notify }
   }, {
     persist: { key: 'projecthub:ui:v1', paths: ['theme', 'filter'] } // toast queda fuera a propósito
   })
   ```

2. Crea `src/stores/apiStatus.js`:

   ```js
   import { defineStore } from 'pinia'          // crea tiendas
   import { computed, ref } from 'vue'          // piezas del capítulo 1
   import { useUiStore } from './ui.js'         // dependencia en una sola dirección: apiStatus -> ui

   export const useApiStatusStore = defineStore('apiStatus', () => {
     const pending = ref(0)                     // cuántas peticiones van en curso
     const errors = ref([])                     // todos los errores de la API, en un solo lugar
     const isBusy = computed(() => pending.value > 0) // getter: ¿hay alguna petición en curso?

     async function track(label, request) {     // envuelve cualquier llamada a la API
       pending.value++                          // una petición más en curso
       try {
         return await request()                 // espera la respuesta y la devuelve tal cual
       } catch (error) {
         errors.value.push({ label, message: error.message }) // la anota en el registro central
         useUiStore().notify(`No se pudo ${label}: ${error.message}`) // y avisa a la persona
         throw error                            // quien llamó también se entera
       } finally {
         pending.value--                        // pase lo que pase, una menos en curso
       }
     }

     return { pending, errors, isBusy, track }
   })
   ```

3. Crea `src/stores/projects.js`. `Object.fromEntries` convierte una lista de pares `[id, proyecto]` en un objeto:

   ```js
   import { defineStore } from 'pinia'                  // crea tiendas
   import { computed, ref } from 'vue'                  // piezas del capítulo 1
   import { api } from '@/api.js'                       // API simulada (@ = src)
   import { useApiStatusStore } from './apiStatus.js'   // carga y errores en un solo lugar

   export const useProjectsStore = defineStore('projects', () => {
     const byId = ref({})                               // normalizado: cada proyecto UNA vez, por su id
     const allIds = ref([])                             // el orden de la lista, solo con los id
     const status = ref('idle')                         // semáforo: idle, loading, success o error
     const list = computed(() => allIds.value.map((id) => byId.value[id])) // getter: la lista en orden

     async function loadAll(fail = false) {             // fail = true simula un error del servidor
       status.value = 'loading'                         // semáforo: cargando
       try {
         const projects = await useApiStatusStore().track('cargar proyectos', () => api.getProjects(fail))
         byId.value = Object.fromEntries(projects.map((p) => [p.id, p])) // { p1: {...}, p2: {...} }
         allIds.value = projects.map((p) => p.id)       // ['p1', 'p2']
         status.value = 'success'                       // semáforo: listo
       } catch {
         status.value = 'error'                         // semáforo: falló (el aviso ya lo dio apiStatus)
       }
     }

     return { byId, allIds, status, list, loadAll }
   })
   ```

4. Crea `src/stores/tasks.js`. `forProject` es un getter que devuelve una función: el `computed` entrega una función que recibe el id del proyecto, así la plantilla puede llamar `tasks.forProject(project.id)` y el resultado se recalcula cuando cambian las tareas o el filtro:

   ```js
   import { defineStore } from 'pinia'                  // crea tiendas
   import { computed, ref } from 'vue'                  // piezas del capítulo 1
   import { api } from '@/api.js'                       // API simulada (@ = src)
   import { useApiStatusStore } from './apiStatus.js'   // carga y errores en un solo lugar
   import { useUiStore } from './ui.js'                 // el filtro vive en la tienda de interfaz

   export const useTasksStore = defineStore('tasks', () => {
     const byId = ref({})                               // cada tarea UNA vez, por su id
     const allIds = ref([])                             // el orden de las tareas
     const ui = useUiStore()                            // una tienda puede usar otra
     const pendingCount = computed(() => allIds.value.filter((id) => !byId.value[id].done).length)

     // getter que devuelve una función: las tareas de un proyecto, según el filtro elegido
     const forProject = computed(() => (projectId) => allIds.value
       .map((id) => byId.value[id])                     // de id a tarea
       .filter((task) => task.projectId === projectId)  // solo las de ese proyecto
       .filter((task) => ui.filter === 'todas' || task.done === (ui.filter === 'hechas')))

     async function loadAll() {
       const tasks = await useApiStatusStore().track('cargar tareas', () => api.getTasks())
       byId.value = Object.fromEntries(tasks.map((t) => [t.id, t])) // { t1: {...}, t2: {...} }
       allIds.value = tasks.map((t) => t.id)            // ['t1', 't2', 't3', 't4']
     }

     function toggleDone(id) {                          // una sola copia: el cambio se ve en todas partes
       byId.value[id].done = !byId.value[id].done
     }

     return { byId, allIds, pendingCount, forProject, loadAll, toggleDone }
   })
   ```

5. Reemplaza todo `src/views/ProjectsView.vue`:

   ```vue
   <script setup>
   import { onMounted } from 'vue'                            // ciclo de vida (capítulo 1)
   import { storeToRefs } from 'pinia'                        // lo que se lee, con storeToRefs
   import { useApiStatusStore } from '@/stores/apiStatus.js'  // carga y errores
   import { useProjectsStore } from '@/stores/projects.js'    // proyectos
   import { useTasksStore } from '@/stores/tasks.js'          // tareas
   import { useUiStore } from '@/stores/ui.js'                // tema, filtro y avisos

   const projects = useProjectsStore()                        // cada tienda, una vez
   const tasks = useTasksStore()
   const ui = useUiStore()
   const { list, status } = storeToRefs(projects)             // datos y getters: conectados
   const { filter, toast } = storeToRefs(ui)
   const { isBusy, errors } = storeToRefs(useApiStatusStore())

   onMounted(() => {                                          // al aparecer la vista...
     projects.loadAll()                                       // ...pide los proyectos
     tasks.loadAll()                                          // ...y las tareas
   })
   </script>

   <template>
     <section>
       <p>
         <button type="button" @click="ui.toggleTheme()">Cambiar tema</button>
         <label>
           Mostrar
           <select v-model="filter">
             <option value="todas">Todas</option>
             <option value="pendientes">Pendientes</option>
             <option value="hechas">Hechas</option>
           </select>
         </label>
         <button type="button" @click="projects.loadAll(true)">Simular error</button>
       </p>
       <p>
         Semáforo de proyectos: <strong>{{ status }}</strong>
         <span v-if="isBusy">(cargando...)</span>
         - Errores registrados: {{ errors.length }}
       </p>
       <p v-if="toast" role="alert">
         {{ toast }}
         <button type="button" @click="ui.notify('')">Cerrar aviso</button>
       </p>
       <h2>Proyectos ({{ tasks.pendingCount }} tareas pendientes)</h2>
       <article v-for="project in list" :key="project.id">
         <h3>{{ project.name }}</h3>
         <ul>
           <li v-for="task in tasks.forProject(project.id)" :key="task.id">
             <label>
               <input type="checkbox" :checked="task.done" @change="tasks.toggleDone(task.id)" />
               {{ task.title }}
             </label>
           </li>
         </ul>
       </article>
     </section>
   </template>
   ```

6. Guarda y recarga con `F5` (para que las tiendas nuevas nazcan limpias); entra otra vez como `Ana`.

**Qué debes ver:** `Semáforo de proyectos: success - Errores registrados: 0`, **Proyectos (3 tareas pendientes)** y dos proyectos con sus tareas.

**Primero, predice:** si marcas **Publicar el sitio**, ¿cambia el número del título? Sí: el título y la lista leen la **misma** copia de la tarea en `byId`. Ahora pulsa **Simular error** y predice si desaparecen los proyectos. No desaparecen: el semáforo pasa a `error`, el contador a `Errores registrados: 1` y aparece el aviso `No se pudo cargar proyectos: el servidor respondió 500`. Prueba también **Cambiar tema** y el filtro **Mostrar**.

Abre Vue DevTools con `Alt + Shift + D` en la página (o el botón flotante de abajo) y entra a **Pinia**: verás las cinco tiendas con sus datos. Viene con el proyecto: `create-vue` lo dejó en `vite.config.js`, y la terminal de Vite lo anuncia al arrancar.

## Paso 4. Persistencia selectiva con un plugin (6 minutos)

**Qué vas a hacer y por qué:** un plugin es una función que Pinia llama una vez por cada tienda que nace. Pinia le pasa la tienda (`store`) y, en `options`, las opciones que la tienda declaró; en una tienda de composición son las del tercer argumento de `defineStore`, donde pusiste `persist`. Este plugin lee esa opción: al nacer, le devuelve lo guardado (hidratar) y, con `$subscribe`, guarda solo las claves de `paths` en cada cambio.

**Primero, predice:** `auth` y `ui` declaran `persist` desde los pasos 2 y 3. ¿Por qué todavía no se guarda nada? Porque Pinia ignora esa opción: nadie la lee hasta que exista el plugin.

1. Crea `src/plugins/persist.js`:

   ```js
   // Plugin: Pinia lo llama una vez por cada tienda que nace, con la tienda y sus opciones
   export function persistPlugin({ store, options }) {
     const persist = options.persist                    // la política que declaró la tienda, si tiene
     if (!persist) return                               // sin política: no hace nada

     try {                                              // leer puede fallar
       const saved = localStorage.getItem(persist.key)  // el texto guardado con su nombre (key)
       if (saved) store.$patch(JSON.parse(saved))       // hidratar: lo devuelve a la tienda
     } catch {                                          // texto dañado...
       localStorage.removeItem(persist.key)             // ...se borra para no fallar en cada carga
     }

     store.$subscribe((mutation, state) => {            // Pinia avisa cada vez que cambian los datos
       const chosen = {}                                // aquí va solo lo permitido
       for (const key of persist.paths) {               // recorre la lista paths
         chosen[key] = state[key]                       // copia solo esa clave
       }
       try {
         localStorage.setItem(persist.key, JSON.stringify(chosen)) // lo guarda como texto JSON
       } catch {
         // almacenamiento lleno o bloqueado: la aplicación sigue, solo no recuerda el cambio
       }
     }, { detached: true })                             // sin detached, la suscripción muere al desmontarse el componente que creó la tienda (aquí, la vista de login o de proyectos)
   }
   ```

2. En `src/main.js`, agrega esta línea debajo de `import router from './router'`:

   ```js
   import { persistPlugin } from './plugins/persist.js' // paso 4: guarda lo que cada tienda declara
   ```

3. Y esta, debajo de `const pinia = createPinia()`:

   ```js
   pinia.use(persistPlugin)                             // paso 4: se registra antes de que nazca cualquier tienda
   ```

4. Recarga con `F5`, entra como `Ana`, elige el tema oscuro y el filtro **Pendientes**, y recarga otra vez.

**Qué debes ver:** sigues dentro como `Ana`, con el tema oscuro y el filtro **Pendientes**. Si había un aviso, desapareció: `toast` no se guarda. Abre las herramientas de Chrome (`F12`), pestaña **Consola**, y escribe:

```js
localStorage.getItem('projecthub:auth:v1')
```

Responde `'{"user":{"name":"Ana","roles":["editor"]}}'`: no hay token. `localStorage.getItem('projecthub:ui:v1')` responde `'{"theme":"dark","filter":"pendientes"}'`, sin `toast`.

## Paso 5. Auditoría de acciones solo en desarrollo (4 minutos)

**Qué vas a hacer y por qué:** `$onAction` avisa antes de cada action y permite saber cuándo termina (`after`) o si falla (`onError`). Con eso medimos sin tocar ninguna tienda. `import.meta.env.DEV` vale `true` mientras programas y `false` en la versión publicada.

1. Crea `src/plugins/audit.js`:

   ```js
   // Plugin de auditoría: anota en la consola cada action, cuánto tardó y si falló
   export function auditPlugin({ store }) {
     store.$onAction(({ name, after, onError }) => {    // avisa antes de cada action
       const id = `${store.$id}.${name}`                // ej.: projects.loadAll
       const start = performance.now()                  // arranca el cronómetro
       after(() => {                                    // si la action termina bien...
         const ms = performance.now() - start           // ...cuánto tardó
         console.info(id, ms.toFixed(1), 'ms')          // lo anota en la consola
       })
       onError((error) => {                             // si la action falla...
         console.error(id, error.message)               // ...anota el error, en rojo
       })
     })
   }
   ```

2. En `src/main.js`, agrega el import debajo del de `persistPlugin`:

   ```js
   import { auditPlugin } from './plugins/audit.js'     // paso 5: anota cada acción en la consola
   ```

3. Y esta línea debajo de `pinia.use(persistPlugin)`:

   ```js
   if (import.meta.env.DEV) pinia.use(auditPlugin)      // paso 5: solo mientras programas, nunca en producción
   ```

**Primero, predice:** al recargar `/proyectos`, ¿qué actions aparecerán en la consola?

**Qué debes ver** en la consola de Chrome, con tiempos parecidos, cuatro líneas: `apiStatus.track 305.7 ms` y `tasks.loadAll 311.8 ms` (las tareas), y `apiStatus.track 414.3 ms` y `projects.loadAll 419.2 ms` (los proyectos). Cada carga deja dos: la de `track` y la de la action que lo llamó. Antes salen líneas como `🍍 "projects" store installed 🆕`: las escribe Vue DevTools cuando conecta cada tienda, no tu plugin. Pulsa **Simular error** y salen tres más: `ui.notify 0.3 ms` (el aviso que dio `apiStatus`), en rojo `apiStatus.track el servidor respondió 500`, que es la que provocaste a propósito, y `projects.loadAll 411.9 ms` como mensaje normal, porque esa action atrapó el error y puso el semáforo en `error`.

## Paso 6. Comprobar los cinco resultados (3 minutos)

| Comprobación | Resultado esperado |
|---|---|
| **Pinia** en Vue DevTools (`Alt + Shift + D`), o los archivos de `src/stores` | Cinco tiendas: `auth`, `ui`, `apiStatus`, `projects` y `tasks` |
| Marcar una tarea | El título de pendientes cambia: una sola copia en `byId` |
| `F5` y la consola con `localStorage` | Tema, filtro y sesión siguen; no hay `token`, `toast` ni errores guardados |
| **Simular error** | `Errores registrados` sube y aparece el aviso |
| **Salir** y abrir `/proyectos` | La guardia te lleva de nuevo al formulario |

**Opcional (3 minutos): si vienes de Vuex.** El tema 4.1 en una tabla. La migración se hace por partes: un módulo a la vez, y cada dato con un solo dueño.

| Vuex | Pinia |
|---|---|
| Un solo almacén con módulos | Una tienda por dominio, como las cinco de hoy |
| `mutations` para cambiar el estado | No existen: las actions cambian los datos directamente |
| `commit` y `dispatch` con textos | Se llama la action como una función: `auth.signOut()` |
| `mapState` y `mapGetters` | `storeToRefs(tienda)` |

## Resultado esperado

- Cinco tiendas: sesión, proyectos, tareas, interfaz y API.
- Cada proyecto y tarea, guardado una vez (`byId`, `allIds`).
- Tema, filtros y sesión mínima sobreviven, sin tokens.
- Carga y errores, en un lugar.

<details markdown="1">
<summary>Código final de los archivos que cambiaron después de crearlos</summary>

`src/main.js`:

```js
import { createApp } from 'vue'                      // crea la aplicación
import { createPinia } from 'pinia'                  // crea Pinia, el gestor de tiendas
import App from './App.vue'                          // componente principal
import router from './router'                        // enrutador: Vite abre src/router/index.js
import { persistPlugin } from './plugins/persist.js' // paso 4: guarda lo que cada tienda declara
import { auditPlugin } from './plugins/audit.js'     // paso 5: anota cada acción en la consola

const pinia = createPinia()                          // la instancia de Pinia, en una variable para hablarle
pinia.use(persistPlugin)                             // paso 4: se registra antes de que nazca cualquier tienda
if (import.meta.env.DEV) pinia.use(auditPlugin)      // paso 5: solo mientras programas, nunca en producción

createApp(App)                                       // crea la aplicación con App como raíz
  .use(pinia)                                        // primero Pinia: la guardia del enrutador usa una tienda
  .use(router)                                       // después el enrutador
  .mount('#app')                                     // la dibuja dentro de <div id="app">
```

`src/views/ProjectsView.vue` queda como lo copiaste en el paso 3. Los demás archivos no cambian después de crearlos.

</details>

## Laboratorio resuelto

La carpeta [`ejercicio-resuelto/`](https://github.com/netec-mx/VUE_INT/tree/main/Capitulo04/ejercicio-resuelto) de este capítulo tiene el proyecto terminado, igual al que construyes con esta guía. Úsalo para comparar al final o si te atascas: lo que se aprende está en escribirlo tú.

La carpeta [`solucion-por-pasos/`](solucion-por-pasos/) tiene el proyecto como queda al terminar cada paso, con comentarios que explican cada concepto y la captura de lo que debes ver. Sirve para mostrar en clase un paso sin construir los anteriores.

```bash
cd ejercicio-resuelto
npm install              # instala las dependencias
npx vite --port 5174     # arranca la aplicación en http://localhost:5174
```

## Problemas frecuentes

| Lo que ves | Por qué pasa | Cómo se arregla |
|---|---|---|
| `getActivePinia() was called but there was no active Pinia` | El enrutador se instaló antes que Pinia, o `useAuthStore()` quedó fuera de `beforeEach` | En `main.js`, `.use(pinia)` antes de `.use(router)`; en `router/index.js`, la tienda se pide dentro de la guardia |
| `[Vue Router warn]: No match found for location with path "/proyectos"` | Arrancaste el servidor con el `src/router/index.js` de `create-vue`, que no tiene rutas | Reemplázalo (paso 2.4), guarda y recarga con `F5` |
| Tras recargar, el tema o la sesión se pierden | Falta `pinia.use(persistPlugin)` o la clave no está en `paths` | Revisa el paso 4 y el `persist` de la tienda |
| Guardas una tienda y no ves el cambio | La recarga en caliente de Vite conserva la tienda que ya nació | Recarga con `F5` |
| `npm create vue@latest` hace preguntas (`Project name`, `Add TypeScript?`) o, al arrancar, Vite pide un Node.js más nuevo | Sin versión fijada llega un `create-vue` que trae Vite 7 (exige Node.js 20.19 o 22.12 en adelante), y sin opciones el asistente pregunta | Usa el comando de la guía, `npx --yes create-vue@3.16.4 projecthub --bare --router --pinia`: no pregunta, trae Vite 6 y sirve igual en los tres sistemas, sin el `--` que PowerShell se come |
| La terminal dice `Local: http://localhost:5173/` en lugar de 5174 | Usaste `npm run dev -- --port 5174` en PowerShell: el `--` se pierde y Vite recibe `5174` como carpeta, no como puerto | Detén con `Ctrl + C` y arranca con `npx vite --port 5174` |
| `Port 5174 is in use` | Otro servidor quedó abierto | Ciérralo con `Ctrl + C` en su terminal |

## Limpieza

1. En la terminal del servidor, pulsa `Ctrl + C`.
2. Para empezar de cero otra vez, en la consola de Chrome: `localStorage.removeItem('projecthub:ui:v1')` y `localStorage.removeItem('projecthub:auth:v1')`.

## Ejercicios de reserva

**Básico.** Agrega a la tienda `ui` un dato `fontSize`, tamaño de letra, con valor `16`, y decide si va en `paths`.

<details markdown="1">
<summary>Solución</summary>

Sí va, porque lo eligió la persona. En `src/stores/ui.js` agrega `const fontSize = ref(16)` debajo de `toast`, añade `fontSize` al `return` y deja `paths: ['theme', 'filter', 'fontSize']`.

</details>

**Medio.** Haz que el plugin de persistencia descarte lo guardado si tiene más de 30 días.

<details markdown="1">
<summary>Solución</summary>

En `src/plugins/persist.js`, guarda la fecha junto a los datos y revísala al leer. El archivo completo queda así (cambian `MAX_AGE`, el bloque del `try` de lectura y el `setItem`):

```js
const MAX_AGE = 30 * 24 * 60 * 60 * 1000                   // 30 días en milisegundos

export function persistPlugin({ store, options }) {
  const persist = options.persist
  if (!persist) return

  try {
    const saved = localStorage.getItem(persist.key)
    const data = saved ? JSON.parse(saved) : null            // lo guardado, si hay
    if (data && Date.now() - data.savedAt < MAX_AGE) {       // solo si es reciente...
      store.$patch(data.state)                               // ...lo devuelve a la tienda
    } else if (data) {
      localStorage.removeItem(persist.key)                   // vencido: se borra
    }
  } catch {
    localStorage.removeItem(persist.key)
  }

  store.$subscribe((mutation, state) => {
    const chosen = {}
    for (const key of persist.paths) {
      chosen[key] = state[key]
    }
    try {
      localStorage.setItem(persist.key, JSON.stringify({ savedAt: Date.now(), state: chosen })) // los datos con su fecha
    } catch {
      // almacenamiento lleno o bloqueado
    }
  }, { detached: true })
}
```

Lo guardado con el formato anterior no tiene `savedAt`: la comparación da falso y se borra, así que la primera recarga empieza limpia.

</details>

**Avanzado.** Lo guardado es entrada externa: cualquiera lo edita en las herramientas del navegador. Agrega a `persist` una función `validate` que devuelva solo los campos con valores aceptables, y úsala antes del `$patch`.

<details markdown="1">
<summary>Solución</summary>

En `src/stores/ui.js`, dentro de `persist`:

```js
validate: (data) => ({
  theme: ['light', 'dark'].includes(data.theme) ? data.theme : 'light',                 // solo temas conocidos
  filter: ['todas', 'pendientes', 'hechas'].includes(data.filter) ? data.filter : 'todas', // solo filtros conocidos
}),
```

En `src/plugins/persist.js`, cambia la hidratación por:

```js
if (saved) {
  const data = JSON.parse(saved)                                // el texto, como objeto
  store.$patch(persist.validate ? persist.validate(data) : data) // valida si la tienda sabe cómo
}
```

</details>

## Recursos

- [Qué es Pinia y por qué la usa Vue](https://pinia.vuejs.org/introduction.html).
- [Tiendas, getters y actions](https://pinia.vuejs.org/core-concepts/).
- [Plugins: `$subscribe`, `$onAction` y opciones propias](https://pinia.vuejs.org/core-concepts/plugins.html).
- [Migrar de Vuex a Pinia](https://pinia.vuejs.org/cookbook/migration-vuex.html).
- [Cómo compartir estado en Vue](https://vuejs.org/guide/scaling-up/state-management.html).

## Control de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 2.0 | 2026-10-16 | Andrés Eduardo García Márquez | Guía reescrita para construir desde una carpeta vacía con Vite 6.4: todo el código en la guía, predicción y resultado visible por paso, repaso de la guardia del capítulo 3, persistencia y auditoría con plugins propios, y ejercicios de reserva con solución |
| 2.1 | 2026-10-16 | Andrés Eduardo García Márquez | Validada por CLI (interfaz de línea de comandos) en Windows y Linux: el proyecto se crea con `npx --yes create-vite@6.4.1` y el servidor con `npx vite --port 5174`, porque PowerShell se come el `--`; predicción completa de la consola en el paso 5; tiempos 1 y 14 minutos en los pasos 1 y 3; Node.js mínimo probado; explicación del getter que devuelve una función, de `options` en el plugin y de `detached`; ejercicio medio con el archivo completo; dos problemas frecuentes nuevos |
| 2.2 | 2026-10-17 | Andrés Eduardo García Márquez | El proyecto se crea con `create-vue` 3.16.4, la herramienta oficial de Vue que enseñan los manuales (`--bare --router --pinia`), en lugar de `create-vite` más la instalación manual de Pinia y Vue Router; tabla de lo que trae el proyecto y qué se reemplaza o se borra; el enrutador pasa a `src/router/index.js` y los imports usan el atajo `@/`; Vue DevTools viene integrado (`Alt + Shift + D`); predicción de la consola con los mensajes de las tiendas; problemas frecuentes de `create-vue`; `ejercicio-resuelto/` regenerado siguiendo la guía y validado por CLI en Windows y Linux |

<!-- {% endraw %} -->
