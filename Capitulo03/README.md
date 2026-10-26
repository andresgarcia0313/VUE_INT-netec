# Práctica 3.4: flujo de autenticación con rutas protegidas y carga dinámica

<!-- lang: es-CO -->
<!-- {% raw %} -->

| Campo | Valor |
|---|---|
| Duración | 46 minutos |
| Complejidad | Media |
| Nivel de Bloom | Aplicar |

## De qué trata

ProjectHub gana una sesión simulada, rutas por rol y vistas que se descargan solo cuando alguien las pide. Construyes desde una carpeta vacía el mapa de rutas de una SPA (aplicación de una sola página): un área de trabajo con rutas anidadas, una guardia que exige sesión y rol antes de entrar, carga perezosa de las vistas y una pantalla de rescate cuando falla la descarga de una de ellas.

**Objetivo:** configurar rutas públicas, protegidas, anidadas y de captura global con Vue Router 4.

Así se ve al final, con sesión de administradora:

```text
ProjectHub - Ada (admin) [Cerrar sesión]
Tablero | Proyectos | Tarea 202 | Administración
------------------------------------------------
Detalle de tarea
Tarea recibida desde la dirección: task-202
```

## Conceptos que usas

Todos se vieron en las diapositivas del capítulo o en capítulos anteriores. Vue Router es la única herramienta nueva.

| Concepto | Dónde lo viste |
|---|---|
| Composable con estado compartido fuera de la función (repaso) | Capítulo 2, 2.1 y 2.2 |
| `ref` y `computed` | Capítulo 1 |
| Tabla de rutas, rutas anidadas y `RouterView` dentro del padre | 3.1 |
| Navegar por nombre, parámetros (`:taskId`), `props: true` y ruta comodín | 3.1 |
| `meta`, guardia global `beforeEach` y `?redirect=` | 3.2 |
| `() => import()`, precarga y `router.onError` | 3.3 |
| `afterEach` y fallas de navegación (`failure`) | 3.2 y 3.3 |

## Antes de empezar

- **Node.js 24 LTS** (probado con 24.22.0), la versión que pide la SUG (Setup Guide, guía de instalación de Netec). Compruébalo con `node -v`.
- Google Chrome y Visual Studio Code con la extensión **Vue (Official)**.
- Conexión a internet para que `npm` descargue las librerías.

## Preparación (6 minutos)

1. Crea una carpeta para tus prácticas (por ejemplo `labs-vue`), abre una terminal dentro de ella y crea el proyecto con create-vue, la herramienta oficial de Vue (la misma de `npm create vue@latest`, con la versión fijada para que todos obtengan lo mismo). El comando es igual en Windows, macOS y Linux:

   ```bash
   npx --yes create-vue@3.16.4 projecthub-router --bare --router
   cd projecthub-router
   npm install
   code .
   ```

   `--router` agrega Vue Router y deja el enrutador conectado; `--bare` crea el proyecto sin páginas de ejemplo. `npm install` baja las librerías y `code .` abre la carpeta en VS Code.

   El proyecto ya trae lo que necesitas de base:

   | Archivo | Qué trae | Qué haces con él |
   |---|---|---|
   | `src/main.js` | Crea la aplicación, le conecta el enrutador con `app.use(router)` y la monta | Nada: queda igual |
   | `src/router/index.js` | Un enrutador con la tabla de rutas vacía (`routes: []`) | Lo reemplazas en el paso 1 |
   | `src/App.vue` | Un título "You did it!" | Lo reemplazas en el paso 1 |
   | `index.html`, `vite.config.js`, `package.json` | La página base, la configuración de Vite y los scripts `dev`, `build` y `preview` | Nada |

2. Arranca el servidor de desarrollo y deja esa terminal abierta:

   ```bash
   npm run dev
   ```

**Qué debes ver:** la terminal muestra `Local: http://localhost:5173/`. Ábrelo en Chrome: aparece el título "You did it!". En la consola de Chrome (`F12`) verás el aviso `[Vue Router warn]: No match found for location with path "/"`: es normal, la tabla de rutas todavía está vacía. Si la terminal muestra otro puerto, usa ese en todo el laboratorio.

## Paso 1. El mapa de rutas anidadas (13 minutos)

**Qué vas a hacer y por qué:** una tabla de rutas le dice al enrutador qué componente dibujar para cada dirección. `/app` será la ruta padre: dibuja el menú y, dentro de su propio `RouterView`, la vista hija que pida la dirección.

1. **Repaso del capítulo 2.** Crea `src/sesion.js`. Es un composable como los del capítulo 2, con el estado fuera de la función para que toda la aplicación comparta una sola sesión. En este paso todavía nadie la usa para proteger nada:

   ```js
   import { ref, computed } from 'vue'                          // estado reactivo y valores calculados

   const cuentas = {                                            // cuentas de prueba: correo -> datos del usuario
     'user@projecthub.dev': { nombre: 'Úrsula', rol: 'user' },
     'admin@projecthub.dev': { nombre: 'Ada', rol: 'admin' },
   }
   const usuario = ref(null)                                    // fuera de la función: una sola sesión para toda la app
   const conectado = computed(() => usuario.value !== null)     // true cuando alguien inició sesión

   async function entrar(correo) {                              // simula la llamada al servidor de autenticación
     await new Promise((listo) => setTimeout(listo, 300))       // espera 300 ms, como haría la red
     if (!cuentas[correo]) throw new Error('Ese correo no está registrado.') // la vista muestra este mensaje
     usuario.value = cuentas[correo]                            // guarda quién entró
   }

   function salir() {                                           // cierra la sesión
     usuario.value = null                                       // sin usuario, la guardia vuelve a pedir ingreso
   }

   export function useSesion() {                                // el composable entrega el estado y las acciones
     return { usuario, conectado, entrar, salir }
   }
   ```

2. Crea la carpeta `src/views` y, dentro, `ProjectHubLayout.vue`, el marco del área de trabajo:

   ```vue
   <script setup>
   import { useRouter } from 'vue-router'          // para navegar desde el código
   import { useSesion } from '../sesion'           // el composable de sesión

   const router = useRouter()                      // el enrutador de la aplicación
   const { usuario, salir } = useSesion()          // quién está dentro y cómo salir

   function cerrarSesion() {                       // acción del botón Cerrar sesión
     salir()                                       // borra el usuario
     router.push({ name: 'login' })                // navega por nombre, no por dirección
   }
   </script>

   <template>
     <header>
       <strong>ProjectHub</strong>
       <!-- Solo se muestra cuando alguien inició sesión -->
       <span v-if="usuario"> - {{ usuario.nombre }} ({{ usuario.rol }})
         <button type="button" @click="cerrarSesion">Cerrar sesión</button>
       </span>
     </header>
     <nav aria-label="Navegación principal">
       <!-- Cada enlace apunta a una ruta por su nombre -->
       <RouterLink :to="{ name: 'dashboard' }">Tablero</RouterLink> |
       <RouterLink :to="{ name: 'projects' }">Proyectos</RouterLink> |
       <RouterLink :to="{ name: 'task-detail', params: { taskId: 'task-202' } }">Tarea 202</RouterLink>
       <!-- Ocultar el enlace es comodidad; la que protege /admin es la guardia -->
       <span v-if="usuario?.rol === 'admin'"> | <RouterLink :to="{ name: 'admin' }">Administración</RouterLink></span>
     </nav>
     <main>
       <!-- RouterView anidado: aquí se dibujan las rutas hijas de /app -->
       <RouterView />
     </main>
   </template>
   ```

3. En `src/views`, crea estas cuatro vistas. **Cópialas tal cual: son de apoyo, no son el tema de hoy.** Solo fíjate en que `TaskDetailView` recibe `taskId` como prop.

   `DashboardView.vue`:

   ```vue
   <template>
     <h2>Tablero</h2>
     <p>Resumen de actividad: 2 proyectos y 5 tareas abiertas.</p>
   </template>
   ```

   `ProjectsView.vue`:

   ```vue
   <template>
     <h2>Proyectos</h2>
     <ul>
       <li>Modernización de ProjectHub</li>
       <li>Automatización de calidad</li>
     </ul>
   </template>
   ```

   `TaskDetailView.vue`:

   ```vue
   <script setup>
   defineProps({ taskId: { type: String, required: true } }) // llega desde :taskId gracias a props: true
   </script>

   <template>
     <h2>Detalle de tarea</h2>
     <p>Tarea recibida desde la dirección: <strong>{{ taskId }}</strong></p>
   </template>
   ```

   `NotFoundView.vue`:

   ```vue
   <template>
     <main>
       <h1>Página no encontrada</h1>
       <p>Esa dirección no existe en ProjectHub.</p>
       <RouterLink :to="{ name: 'dashboard' }">Ir al tablero</RouterLink>
     </main>
   </template>
   ```

4. Reemplaza todo `src/router/index.js` por la tabla de rutas. Como el archivo vive en `src/router`, las rutas a las vistas empiezan con `../`:

   ```js
   import { createRouter, createWebHistory } from 'vue-router'    // funciones para crear el enrutador
   import ProjectHubLayout from '../views/ProjectHubLayout.vue'    // marco con el menú del área de trabajo
   import NotFoundView from '../views/NotFoundView.vue'            // página para direcciones que no existen
   import DashboardView from '../views/DashboardView.vue'          // vista del tablero
   import ProjectsView from '../views/ProjectsView.vue'            // vista de proyectos
   import TaskDetailView from '../views/TaskDetailView.vue'        // vista de detalle de una tarea

   const routes = [                                                // la tabla: dirección -> componente
     { path: '/', redirect: { name: 'dashboard' } },               // la raíz lleva al tablero, por nombre
     {
       path: '/app',                                               // ruta padre del área de trabajo
       component: ProjectHubLayout,                                // su RouterView dibuja a los hijos
       children: [                                                 // hijas: /app/dashboard, /app/projects...
         { path: 'dashboard', name: 'dashboard', component: DashboardView },
         { path: 'projects', name: 'projects', component: ProjectsView },
         { path: 'tasks/:taskId', name: 'task-detail', component: TaskDetailView, props: true }, // :taskId llega como prop
       ],
     },
     { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView }, // comodín: siempre de último
   ]

   const router = createRouter({                                   // el enrutador de la aplicación
     history: createWebHistory(import.meta.env.BASE_URL),          // direcciones limpias, sin #
     routes,                                                       // la tabla de arriba
   })

   export default router                                           // main.js lo conecta a la aplicación
   ```

5. Reemplaza todo `src/App.vue`. `src/main.js` no se toca: create-vue ya lo dejó con `app.use(router)`.

   ```vue
   <template>
     <!-- RouterView raíz: aquí el enrutador dibuja la pantalla de la ruta actual -->
     <RouterView />
   </template>
   ```

**Primero, predice:** al abrir `http://localhost:5173/`, ¿en qué dirección terminas y qué partes ves?

**Qué debes ver:** la dirección cambia a `/app/dashboard` y se ven el menú y "Tablero". Pulsa **Tarea 202**: la dirección es `/app/tasks/task-202` y la vista muestra `task-202`. Escribe en la barra `/app/tasks/abc`: muestra `abc`. Escribe `/no-existe`: "Página no encontrada".

## Paso 2. Sesión, meta y guardia (11 minutos)

**Qué vas a hacer y por qué:** hoy cualquiera entra a `/app`. Cada ruta va a declarar en `meta` lo que exige, y una sola guardia `beforeEach` lo aplicará antes de dibujar nada.

1. Crea en `src/views` la pantalla de ingreso, `LoginView.vue`:

   ```vue
   <script setup>
   import { ref } from 'vue'                            // datos reactivos del formulario
   import { useRoute, useRouter } from 'vue-router'     // la ruta actual y el enrutador
   import { useSesion } from '../sesion'                // el composable de sesión

   const route = useRoute()                             // para leer ?redirect= de la dirección
   const router = useRouter()                           // para navegar al terminar
   const { entrar } = useSesion()                       // acción de iniciar sesión
   const correo = ref('user@projecthub.dev')            // valor inicial para probar rápido
   const error = ref('')                                // mensaje si el ingreso falla

   async function ingresar() {                          // se ejecuta al enviar el formulario
     error.value = ''                                   // limpia el error anterior
     try {
       await entrar(correo.value)                       // espera la respuesta simulada
       await router.replace(route.query.redirect || { name: 'dashboard' }) // vuelve a donde iba; replace no deja el ingreso en el historial
     } catch (e) {
       error.value = e.message                          // muestra por qué falló
     }
   }
   </script>

   <template>
     <main>
       <h1>Ingresar a ProjectHub</h1>
       <!-- .prevent evita que el navegador recargue la página al enviar -->
       <form @submit.prevent="ingresar">
         <label for="correo">Correo</label>
         <input id="correo" v-model.trim="correo" type="email" required />
         <button type="submit">Entrar</button>
         <!-- role="alert" hace que el lector de pantalla lea el error -->
         <p v-if="error" role="alert">{{ error }}</p>
       </form>
       <p>Cuentas de prueba: user@projecthub.dev y admin@projecthub.dev</p>
     </main>
   </template>
   ```

2. Crea en `src/views` estas dos vistas. **Cópialas tal cual, son de apoyo.**

   `ForbiddenView.vue`:

   ```vue
   <template>
     <main>
       <h1>Acceso prohibido</h1>
       <p>Tu rol no tiene permiso para ver esa página.</p>
       <RouterLink :to="{ name: 'dashboard' }">Volver al tablero</RouterLink>
     </main>
   </template>
   ```

   `AdminView.vue`:

   ```vue
   <template>
     <main>
       <h1>Administración</h1>
       <p>Esta vista viaja en su propio archivo: solo la descarga quien entra aquí.</p>
       <RouterLink :to="{ name: 'dashboard' }">Volver al tablero</RouterLink>
     </main>
   </template>
   ```

3. En `src/router/index.js` haz seis cambios pequeños; lo demás queda igual.
   - Debajo de la primera línea, `import { createRouter, createWebHistory } from 'vue-router'`, agrega:

     ```js
     import { useSesion } from '../sesion'                          // la guardia consulta la sesión
     import LoginView from '../views/LoginView.vue'                  // pantalla pública de ingreso
     import ForbiddenView from '../views/ForbiddenView.vue'          // aviso de acceso prohibido
     ```

   - Debajo de `import TaskDetailView ...` agrega:

     ```js
     import AdminView from '../views/AdminView.vue'                  // vista de administración
     ```

   - Debajo de la ruta `{ path: '/', redirect: ... }` agrega las dos rutas públicas:

     ```js
     { path: '/login', name: 'login', component: LoginView },      // pública
     { path: '/forbidden', name: 'forbidden', component: ForbiddenView }, // pública
     ```

   - Debajo de `component: ProjectHubLayout, ...` agrega el requisito de la ruta padre:

     ```js
     meta: { requiresAuth: true },                               // requisito: los hijos lo heredan
     ```

   - Encima de la ruta comodín (`'/:pathMatch(.*)*'`) agrega la ruta de administración:

     ```js
     { path: '/admin', name: 'admin', component: AdminView, meta: { requiresAuth: true, roles: ['admin'] } }, // solo admin
     ```

   - Justo antes de `export default router` agrega la guardia:

     ```js
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
     ```

**Primero, predice:** sin sesión, escribes en la barra `localhost:5173/app/projects`. ¿Qué dirección ves después?

**Qué debes ver** (cada vez que escribes en la barra, la página se recarga y la sesión, que vive en memoria, se pierde; por eso te pide ingresar otra vez):

1. `/app/projects` sin sesión te lleva a `/login?redirect=/app/projects`. Pulsa **Entrar** con `user@projecthub.dev`: vuelves a `/app/projects` y el encabezado dice "Úrsula (user)", sin enlace de Administración.
2. Escribe `/admin` y entra otra vez como `user@projecthub.dev`: terminas en `/forbidden`, "Acceso prohibido".
3. Escribe `/admin` y entra ahora con `admin@projecthub.dev`: ves "Administración".
4. Escribe un correo que no existe: aparece "Ese correo no está registrado."

## Paso 3. Carga perezosa y precarga (7 minutos)

**Qué vas a hacer y por qué:** hoy todas las vistas viajan en un solo archivo JavaScript, aunque la persona nunca abra Administración. Con `() => import()` cada vista protegida queda en su propio archivo y se descarga al visitarla.

1. En la terminal del servidor pulsa `Ctrl + C` y compila la versión de producción:

   ```bash
   npm run build
   ```

   **Predice:** ¿cuántos archivos `.js` aparecen en `dist/assets`?

   **Qué debes ver:** uno solo, `index-<código>.js`.

2. En `src/router/index.js`, reemplaza las cuatro líneas `import DashboardView ...`, `import ProjectsView ...`, `import TaskDetailView ...` e `import AdminView ...` por estas. Las rutas no cambian: siguen usando los mismos nombres.

   ```js
   const DashboardView = () => import('../views/DashboardView.vue')  // con la flecha, se descarga al visitarla
   const ProjectsView = () => import('../views/ProjectsView.vue')    // archivo aparte, bajo demanda
   const TaskDetailView = () => import('../views/TaskDetailView.vue') // archivo aparte, bajo demanda
   const AdminView = () => import('../views/AdminView.vue')          // solo lo descarga quien entra a /admin
   ```

3. **Precarga.** Quien está en el ingreso casi siempre va al tablero, así que se puede bajar antes. En `src/router/index.js`, justo antes de `export default router`, agrega:

   ```js
   router.afterEach((to) => {                                      // corre al terminar cada navegación
     if (to.name === 'login') DashboardView()                      // precarga: desde el ingreso casi todos van al tablero
   })
   ```

4. Compila otra vez con `npm run build`.

**Qué debes ver:** cinco archivos `.js`. Así salió en la prueba (los códigos después del guion cambian en cada equipo):

```text
dist/assets/DashboardView-BtyFsgDf.js    0.29 kB │ gzip:  0.24 kB
dist/assets/ProjectsView-B5DIYmh6.js     0.32 kB │ gzip:  0.25 kB
dist/assets/TaskDetailView-ByJuZZIm.js   0.37 kB │ gzip:  0.29 kB
dist/assets/AdminView-6XalYcyP.js        0.47 kB │ gzip:  0.35 kB
dist/assets/index-CGyShL0F.js           98.71 kB │ gzip: 38.44 kB
```

Arranca de nuevo con `npm run dev`, abre `http://localhost:5173/login`, pulsa `F12`, pestaña **Network** (Red), filtro **JS**, y recarga. `DashboardView.vue` ya aparece en la lista sin haber entrado: es la precarga. Entra y pulsa **Proyectos**: `ProjectsView.vue` aparece en ese momento, no antes.

## Paso 4. Errores de navegación y fragmento perdido (7 minutos)

**Qué vas a hacer y por qué:** cada `import()` del paso 3 genera un fragmento (en inglés, *chunk*): un archivo `.js` aparte con una vista. Si publicas una versión nueva mientras alguien tiene la aplicación abierta, su navegador pedirá un fragmento que ya no existe: un fragmento perdido. `router.onError` atrapa ese fallo y muestra una pantalla de rescate en lugar de dejar la pantalla quieta.

1. Crea `src/views/ChunkRecoveryView.vue`:

   ```vue
   <script setup>
   import { useRoute } from 'vue-router'                // para leer ?target= de la dirección

   const route = useRoute()                             // la ruta actual

   function recargar() {                                // acción del botón Recargar
     const destino = String(route.query.target || '/')  // la página que no se pudo abrir
     const url = new URL(destino, window.location.origin)  // dirección completa, como la entiende el navegador
     const interno = url.origin === window.location.origin // solo direcciones de esta aplicación
     window.location.assign(interno ? url.pathname + url.search + url.hash : '/') // recarga completa: trae la versión publicada
   }
   </script>

   <template>
     <main>
       <h1>No se pudo cargar esta parte de la aplicación</h1>
       <p>Puede que se haya publicado una versión nueva. Recarga para traerla.</p>
       <button type="button" @click="recargar">Recargar</button>
     </main>
   </template>
   ```

2. En `src/router/index.js` haz tres cambios:
   - Debajo de `import NotFoundView ...` agrega:

     ```js
     import ChunkRecoveryView from '../views/ChunkRecoveryView.vue'  // aviso cuando falla la descarga de una vista
     ```

   - Debajo de la ruta `/forbidden` agrega:

     ```js
     { path: '/chunk-recovery', name: 'chunk-recovery', component: ChunkRecoveryView }, // pública
     ```

   - Justo antes de `export default router` agrega:

     ```js
     router.afterEach((to, from, failure) => {                       // segundo oyente: navegaciones que no se completaron
       if (failure) console.info('[ProjectHub] Navegación no completada:', failure.message) // aviso, no error
     })

     router.onError((error, to) => {                                 // errores al navegar, como una descarga fallida
       const perdido = /dynamically imported module|Importing a module script failed/i.test(error.message) // ¿falló la descarga?
       if (perdido) router.replace({ name: 'chunk-recovery', query: { target: to.fullPath } }) // muestra el aviso
     })
     ```

3. Con `npm run dev` corriendo, entra a la aplicación, abre la consola (`F12`, pestaña **Console**) y pulsa **Proyectos** dos veces. **Qué debes ver:** `[ProjectHub] Navegación no completada: Avoided redundant navigation...`. Es un aviso informativo: ir a donde ya estás no es un error.

4. Simula una publicación nueva. Detén el servidor con `Ctrl + C`, compila y borra el archivo de Administración:

   ```bash
   npm run build
   ```

   Borra el fragmento de Administración. Windows (PowerShell):

   ```powershell
   Remove-Item dist/assets/AdminView-*.js
   ```

   macOS y Linux:

   ```bash
   rm dist/assets/AdminView-*.js
   ```

   Luego sirve la versión compilada:

   ```bash
   npm run preview
   ```

**Primero, predice:** como admin, ¿qué pasa al abrir una vista cuyo archivo ya no está?

**Qué debes ver:** abre `http://localhost:4173/admin` y entra con `admin@projecthub.dev`. Terminas en `/chunk-recovery?target=/admin` con "No se pudo cargar esta parte de la aplicación". En la consola, en rojo, `Failed to load resource: the server responded with a status of 404 (Not Found)` para `AdminView-<código>.js`: es el fallo que provocaste a propósito. Detén el servidor con `Ctrl + C`.

## Paso 5. Comprueba el resultado (2 minutos)

Marca cada resultado de la diapositiva "Resultados esperados":

| Resultado | Lo viste en |
|---|---|
| Sin sesión, `/app/...` va a `/login` y regresa al entrar | Paso 2, punto 1 |
| En `/admin`, el rol `user` ve `/forbidden`; `admin` entra | Paso 2, puntos 2 y 3 |
| Las vistas protegidas se descargan al visitarlas | Paso 3, `npm run build` y pestaña Network |
| Ruta inválida: `NotFoundView`. Fragmento perdido: `ChunkRecoveryView` | Pasos 1 y 4 |

<details markdown="1">
<summary>Código final de <code>src/router/index.js</code> (el único archivo que cambió después de crearlo)</summary>

```js
import { createRouter, createWebHistory } from 'vue-router'    // funciones para crear el enrutador
import { useSesion } from '../sesion'                          // la guardia consulta la sesión
import LoginView from '../views/LoginView.vue'                  // pantalla pública de ingreso
import ForbiddenView from '../views/ForbiddenView.vue'          // aviso de acceso prohibido
import ProjectHubLayout from '../views/ProjectHubLayout.vue'    // marco con el menú del área de trabajo
import NotFoundView from '../views/NotFoundView.vue'            // página para direcciones que no existen
import ChunkRecoveryView from '../views/ChunkRecoveryView.vue'  // aviso cuando falla la descarga de una vista
const DashboardView = () => import('../views/DashboardView.vue')  // con la flecha, se descarga al visitarla
const ProjectsView = () => import('../views/ProjectsView.vue')    // archivo aparte, bajo demanda
const TaskDetailView = () => import('../views/TaskDetailView.vue') // archivo aparte, bajo demanda
const AdminView = () => import('../views/AdminView.vue')          // solo lo descarga quien entra a /admin

const routes = [                                                // la tabla: dirección -> componente
  { path: '/', redirect: { name: 'dashboard' } },               // la raíz lleva al tablero, por nombre
  { path: '/login', name: 'login', component: LoginView },      // pública
  { path: '/forbidden', name: 'forbidden', component: ForbiddenView }, // pública
  { path: '/chunk-recovery', name: 'chunk-recovery', component: ChunkRecoveryView }, // pública
  {
    path: '/app',                                               // ruta padre del área de trabajo
    component: ProjectHubLayout,                                // su RouterView dibuja a los hijos
    meta: { requiresAuth: true },                               // requisito: los hijos lo heredan
    children: [                                                 // hijas: /app/dashboard, /app/projects...
      { path: 'dashboard', name: 'dashboard', component: DashboardView },
      { path: 'projects', name: 'projects', component: ProjectsView },
      { path: 'tasks/:taskId', name: 'task-detail', component: TaskDetailView, props: true }, // :taskId llega como prop
    ],
  },
  { path: '/admin', name: 'admin', component: AdminView, meta: { requiresAuth: true, roles: ['admin'] } }, // solo admin
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView }, // comodín: siempre de último
]

const router = createRouter({                                   // el enrutador de la aplicación
  history: createWebHistory(import.meta.env.BASE_URL),          // direcciones limpias, sin #
  routes,                                                       // la tabla de arriba
})

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

router.afterEach((to) => {                                      // corre al terminar cada navegación
  if (to.name === 'login') DashboardView()                      // precarga: desde el ingreso casi todos van al tablero
})

router.afterEach((to, from, failure) => {                       // segundo oyente: navegaciones que no se completaron
  if (failure) console.info('[ProjectHub] Navegación no completada:', failure.message) // aviso, no error
})

router.onError((error, to) => {                                 // errores al navegar, como una descarga fallida
  const perdido = /dynamically imported module|Importing a module script failed/i.test(error.message) // ¿falló la descarga?
  if (perdido) router.replace({ name: 'chunk-recovery', query: { target: to.fullPath } }) // muestra el aviso
})

export default router                                           // main.js lo conecta a la aplicación
```

</details>

## Laboratorio resuelto

La carpeta [`ejercicio-resuelto/`](https://github.com/netec-mx/VUE_INT/tree/main/Capitulo03/ejercicio-resuelto) de este capítulo tiene el proyecto terminado, igual al que construyes con esta guía. Úsalo para comparar al final o si te atascas: lo que se aprende está en escribirlo tú.

```bash
cd ejercicio-resuelto
npm install              # instala las dependencias
npx vite --port 5173     # arranca la aplicación en http://localhost:5173
```

## Problemas frecuentes

| Lo que ves | Por qué pasa | Cómo se arregla |
|---|---|---|
| `npx : ... running scripts is disabled on this system` en PowerShell | Windows bloquea los scripts de npm | Ejecuta `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` y repite, o usa la terminal `cmd` |
| `Failed to resolve import "vue-router"` | Creaste el proyecto sin `--router` | Vuelve a crearlo con el comando de la preparación, que incluye `--router` |
| La dirección es `/app/dashboard` pero no se ve "Tablero" | Falta el `<RouterView />` dentro de `ProjectHubLayout.vue` | Revisa el paso 1.2: el padre necesita su propio `RouterView` |
| `Uncaught Error: No match for {"name":"admin"...}` | Un enlace usa un nombre de ruta que no existe en la tabla | Revisa que el `name` del enlace y el de la ruta se escriban igual |
| Te pide ingresar otra vez tras escribir en la barra o guardar `sesion.js` | La sesión vive en memoria y la página se recargó | Es normal en este laboratorio; en el capítulo 4 se guarda con un plugin de persistencia de Pinia (4.3) |
| La primera vez que abres la aplicación, la página se recarga sola y la terminal dice `new dependencies optimized: ...` | Vite prepara las librerías la primera vez que alguien las importa | Es normal y pasa una sola vez; espera a que cargue y sigue |
| Al pulsar **Entrar** tarda unos segundos la primera vez | En desarrollo, Vite compila cada vista la primera vez que se pide | Espera; las siguientes veces es inmediato |
| `Port 4173 is in use, trying another one...` al usar `npm run preview` | Otra versión compilada quedó servida | Usa la dirección que muestra la terminal o cierra la otra con `Ctrl + C` |
| Abajo, en el centro de la página, aparece una pastilla con el logo de Vue | Es Vue DevTools, que create-vue agrega con `vite-plugin-vue-devtools` en `vite.config.js` | Es normal: solo existe con `npm run dev` y te sirve para ver rutas y componentes; no viaja en `npm run build` |
| `Port 5173 is in use, trying another one...` | Otro servidor quedó abierto | Usa la dirección que muestra la terminal o cierra el otro con `Ctrl + C` |
| Tras el paso 3, `npm run build` sigue con un solo `.js` | Quedó alguna `import ... from` de una vista protegida | Revisa que las cuatro líneas usen `() => import(...)` |

## Limpieza

Pulsa `Ctrl + C` en la terminal de `npm run dev` o de `npm run preview`. Puedes borrar la carpeta `dist`; `npm run build` la vuelve a crear.

## Ejercicios de reserva

**Básico.** Haz que `/app/tasks/abc` caiga en "Página no encontrada" y que solo se acepten identificadores como `task-202`.

<details markdown="1"><summary>Solución</summary>

En la ruta hija, cambia el `path` por `'tasks/:taskId(task-\\d+)'`: la expresión entre paréntesis exige `task-` seguido de dígitos. `/app/tasks/abc` ya no coincide y cae en el comodín.

</details>

**Medio.** Precarga Administración cuando la persona pasa el puntero sobre su enlace, y comprueba en Network que pasarlo diez veces produce una sola descarga.

<details markdown="1"><summary>Solución</summary>

En `src/views/ProjectHubLayout.vue`, dentro de `<script setup>`, agrega:

```js
const precargarAdmin = () => import('./AdminView.vue') // descarga el fragmento de Administración
```

Y en el enlace de Administración agrega el evento: `<RouterLink :to="{ name: 'admin' }" @mouseenter="precargarAdmin">`. El navegador guarda el módulo la primera vez; las siguientes llamadas reutilizan esa descarga.

</details>

**Avanzado.** Ante un fragmento perdido, recarga sola una única vez; si vuelve a fallar, muestra la pantalla de rescate.

<details markdown="1"><summary>Solución</summary>

En `router.onError`, antes del `router.replace`:

```js
if (perdido && !sessionStorage.getItem('recargado')) { // primer fallo: nadie ha recargado aún
  sessionStorage.setItem('recargado', '1')             // marca el intento para no recargar en bucle
  window.location.assign(to.fullPath)                  // recarga completa hacia la página pedida
  return                                               // no muestra el aviso todavía
}
```

En `src/views/ChunkRecoveryView.vue` borra la marca al montar, para que el próximo despliegue vuelva a intentarlo. Agrega en `<script setup>`:

```js
import { onMounted } from 'vue'                                  // gancho de ciclo de vida
onMounted(() => sessionStorage.removeItem('recargado'))          // el aviso ya se mostró: quita la marca
```

Al probarlo con el paso 4: el primer fallo recarga y te pide ingresar otra vez (la sesión vive en memoria); al entrar de nuevo falla otra vez y ahora sí ves el aviso.

</details>

## Recursos

- [Rutas anidadas](https://router.vuejs.org/guide/essentials/nested-routes): cómo declarar rutas hijas dentro de otra ruta.
- [Pasar parámetros como props](https://router.vuejs.org/guide/essentials/passing-props): `props: true` y sus variantes.
- [Guardias de navegación](https://router.vuejs.org/guide/advanced/navigation-guards): su orden y lo que pueden devolver.
- [Campos meta](https://router.vuejs.org/guide/advanced/meta): declarar los requisitos de cada ruta.
- [Carga perezosa de rutas](https://router.vuejs.org/guide/advanced/lazy-loading): descargar cada vista solo cuando alguien la pide.

<!-- {% endraw %} -->
