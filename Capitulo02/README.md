# Práctica 2.4: refactorizar componentes a Composition API y crear composables

<!-- lang: es-CO -->
<!-- {% raw %} -->

| Campo | Valor |
|---|---|
| Duración | 30 minutos |
| Complejidad | Media |
| Nivel de Bloom | Crear |

## De qué trata

ProjectHub es una lista de tareas con buscador, filtro, vista compacta que se recuerda y carga simulada desde un servidor. Empiezas con la versión clásica en Options API (interfaz de opciones), donde cada tarea del código queda repartida entre `data`, `computed`, `watch` y `mounted`. La refactorizas (la reorganizas por dentro sin cambiar lo que hace) a Composition API (interfaz de composición): cuatro composables, un contexto con `provide` y una clave `Symbol`, y un componente renderless que entrega la lista por un slot.

**Resultado final:** la columna "Después: Composition API" busca, filtra, marca una tarea como seleccionada, recarga y recuerda la vista compacta al recargar la página, y `npm run build` termina sin errores.

## Objetivos

- Extraer cada tarea del componente (carga, buscador, selección, preferencia) a su propio composable.
- Compartir datos con `provide` e `inject` usando una clave `Symbol` y un error claro si falta el proveedor.
- Construir un componente renderless que entrega datos y acciones por un slot con datos.

## Conceptos que usas

Todos se vieron en las diapositivas del capítulo 2, salvo el que se indica:

- Options API (`data`, `computed`, `watch`, `mounted`) frente a `<script setup>`.
- `ref`, `computed`, `watch` y el hook (gancho) `onMounted`.
- Composable: función `useAlgo()` que crea su propio estado en cada llamada.
- `provide`, `inject`, `readonly` y claves con `Symbol`.
- Renderless: componente que no dibuja nada y entrega datos por `<slot>`; se recibe con `v-slot`.
- **Repaso del capítulo 1:** `computed` guarda un resultado y solo lo recalcula si cambia lo que usa. En el laboratorio 1 compartiste el catálogo con `provide('catalogo')`, una clave de texto; hoy la clave será un `Symbol`, que no puede chocar con otra.

## Antes de empezar

- **Node.js 24 LTS** (el programa que ejecuta JavaScript fuera del navegador; la versión estable actual, probada con 24.22.0). Compruébalo con `node -v`: debe empezar por `v24.`.
- Google Chrome y Visual Studio Code. Si VS Code ofrece la extensión **Vue (Official)**, acéptala.
- No necesitas el laboratorio 1 ni descargar nada: el proyecto se crea desde cero.

## Preparación (4 minutos)

1. Abre una terminal en la carpeta donde guardas tus prácticas y crea el proyecto con create-vue, la herramienta oficial de Vue (la misma de `npm create vue@latest` del capítulo 0), en una versión fija que funciona con Node 20 y 22. El comando es igual en Windows (PowerShell), macOS y Linux:

   ```bash
   npx --yes create-vue@3.16.4 lab02-composables --default --bare
   cd lab02-composables
   npm install
   ```

   `--yes` acepta descargar el creador sin preguntar. `--default` responde "No" a todas las opciones (TypeScript, Router, Pinia, pruebas), porque este laboratorio no las necesita, y `--bare` deja un proyecto mínimo, sin componentes de ejemplo. Escribe las opciones sin `--` delante del nombre: PowerShell se lo come.

2. Abre la carpeta `lab02-composables` en VS Code y mira qué trae: `index.html` (la página con `<div id="app">`), `vite.config.js` (Vite 6 con el atajo `@` hacia `src` y las Vue DevTools, el panel de depuración en el navegador), `jsconfig.json`, `public/favicon.ico`, `.vscode/`, `.gitignore`, `README.md`, y en `src` solo dos archivos. No borras ninguno. `src/main.js` ya viene listo y no lo cambias:

   ```js
   import { createApp } from 'vue'
   import App from './App.vue'

   createApp(App).mount('#app')
   ```

   Crea la aplicación con el componente raíz `App.vue` y la dibuja en `<div id="app">` de `index.html`. `src/App.vue` solo dice "You did it!"; lo reemplazas en el paso 1.

3. Arranca el servidor de desarrollo en el puerto 5172 y deja esa terminal abierta. `npx vite` ejecuta el Vite instalado en el proyecto; el comando es igual en PowerShell, macOS y Linux:

   ```bash
   npx vite --port 5172
   ```

**Qué debes ver:** en la terminal, `Local: http://localhost:5172/`. Ábrelo en Chrome: aparece el título "You did it!" y, abajo, el botón flotante de las Vue DevTools.

## Paso 1. El punto de partida en Options API (5 minutos)

**Qué vas a hacer y por qué:** escribir la versión clásica para ver el problema que resuelve la Composition API: cada tarea del componente queda partida en varias secciones.

1. Crea `src/datos.js`. Cópialo tal cual, no es el tema de hoy:

   ```js
   // Datos de ejemplo de ProjectHub: cópialo tal cual, no es el tema de hoy
   const tareas = [
     { id: 1, titulo: 'Diseñar la pantalla de inicio', hecha: true },
     { id: 2, titulo: 'Conectar la API de proyectos', hecha: false },
     { id: 3, titulo: 'Escribir pruebas del buscador', hecha: false },
     { id: 4, titulo: 'Revisar accesibilidad del menú', hecha: true },
     { id: 5, titulo: 'Publicar la versión 1.0', hecha: false }
   ]

   // Simula pedir las tareas a un servidor: responde después de 800 milisegundos
   export function pedirTareas() {
     return new Promise((resolver) =>
       setTimeout(() => resolver(tareas.map((t) => ({ ...t }))), 800))  // entrega copias: el original no cambia
   }
   ```

2. Crea `src/TareasOpciones.vue`. Lee los comentarios: cada línea dice a qué tarea pertenece (carga, buscador o preferencia):

   ```vue
   <!-- Punto de partida en Options API: cada tarea del componente queda repartida por tipo de código -->
   <script>
   import { pedirTareas } from './datos.js'                // la carga simulada

   export default {
     data() {                                              // 1. DATOS de todas las tareas, juntos
       return {
         tareas: [],                                       // carga: la lista que llega
         cargando: true,                                   // carga: bandera de espera
         texto: '',                                        // buscador: lo que se escribe
         compacta: localStorage.getItem('compacta') === 'true' // preferencia: lee lo guardado antes
       }
     },
     computed: {                                           // 2. CÁLCULOS
       visibles() {                                        // buscador: filtra por texto
         const buscado = this.texto.toLowerCase()          // this: así se llega a los datos en Options API
         return this.tareas.filter((t) => t.titulo.toLowerCase().includes(buscado)) // deja las que coinciden
       }
     },
     watch: {                                              // 3. EFECTOS
       compacta(nuevo) {                                   // preferencia: se ejecuta cuando cambia
         localStorage.setItem('compacta', String(nuevo))   // preferencia: la guarda en el navegador
       }
     },
     async mounted() {                                     // 4. HOOKS: cuando el componente aparece
       this.tareas = await pedirTareas()                   // carga: pide las tareas y espera
       this.cargando = false                               // carga: termina la espera
     }
   }
   </script>

   <template>
     <section :class="{ compacta }">
       <h2>Antes: Options API</h2>
       <input v-model="texto" aria-label="Buscar tarea" placeholder="Buscar..." />
       <label><input type="checkbox" v-model="compacta" /> Vista compacta</label>
       <p v-if="cargando">Cargando...</p>
       <ul v-else>
         <li v-for="t in visibles" :key="t.id">{{ t.hecha ? '✔' : '○' }} {{ t.titulo }}</li>
       </ul>
     </section>
   </template>
   ```

3. Reemplaza todo `src/App.vue` por este:

   ```vue
   <script setup>
   import TareasOpciones from './TareasOpciones.vue'      // la versión de partida, en Options API
   </script>

   <template>
     <main class="columnas">
       <TareasOpciones />
     </main>
   </template>

   <!-- Estilos: cópialos tal cual, no son el tema de hoy -->
   <style>
   .columnas { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; font-family: system-ui, sans-serif; }
   section { border: 1px solid #888; border-radius: 8px; padding: 1rem; }
   section ul { list-style: none; padding: 0; }
   section li { padding: 0.5rem 0; }
   .compacta li { padding: 0; }
   </style>
   ```

**Primero, predice:** marca **Vista compacta** y recarga la página con `F5`. ¿Sigue marcada?

**Qué debes ver:** "Cargando..." durante casi un segundo y luego 5 tareas. Tras recargar, la casilla sigue marcada y la lista sigue apretada. Ahora cuenta: la preferencia vive en dos secciones (`data` y `watch`) y la carga en otras dos (`data` y `mounted`). Para entender una tarea hay que leer el archivo entero.

## Paso 2. Primeros composables: carga y buscador (7 minutos)

**Qué vas a hacer y por qué:** mover la carga y el buscador a dos funciones `use...`, cada una con su estado, sus cálculos y sus efectos juntos. Así cada tarea se lee en un solo archivo y se reutiliza en otro componente.

1. Crea la carpeta `src/composables` y dentro `useAsyncState.js`. Es el `Cargador` de las diapositivas, convertido en composable:

   ```js
   import { onMounted, ref } from 'vue'                    // un hook y la caja vigilada

   export function useAsyncState(cargar, inicial) {        // recibe cómo cargar y el valor de arranque
     const datos = ref(inicial)                            // lo que llegue del servidor
     const cargando = ref(false)                           // bandera de espera
     const error = ref('')                                 // mensaje si algo falla
     async function recargar() {                           // pide los datos otra vez
       cargando.value = true                               // empieza la espera
       error.value = ''                                    // borra el error anterior
       try { datos.value = await cargar() }                // intenta cargar y guarda lo que llegó
       catch { error.value = 'No se pudieron cargar las tareas' } // si falla, deja el aviso
       finally { cargando.value = false }                  // pase lo que pase, termina la espera
     }
     onMounted(recargar)                                   // hook: carga cuando el componente aparece
     return { datos, cargando, error, recargar }           // lo que entrega a quien lo llame
   }
   ```

2. Crea `src/composables/useProjectFilters.js`. `visibles` es un `computed`, como el filtro del laboratorio 1:

   ```js
   import { computed, ref } from 'vue'                     // dato calculado y caja vigilada

   export function useProjectFilters(tareas) {             // recibe la lista vigilada (un ref)
     const texto = ref('')                                 // lo que se escribe en el buscador
     const soloPendientes = ref(false)                     // true: oculta las tareas hechas
     const visibles = computed(() => {                     // se recalcula solo si cambia algo que usa
       const buscado = texto.value.toLowerCase()           // minúsculas para comparar sin importar mayúsculas
       return tareas.value
         .filter((t) => t.titulo.toLowerCase().includes(buscado)) // deja las que contienen el texto
         .filter((t) => !soloPendientes.value || !t.hecha)        // si el filtro está activo, quita las hechas
         .sort((a, b) => a.titulo.localeCompare(b.titulo))        // ordena por título, de la A a la Z
     })
     const pendientes = computed(() => tareas.value.filter((t) => !t.hecha).length) // cuántas faltan
     return { texto, soloPendientes, visibles, pendientes }  // estado y cálculos del buscador
   }
   ```

3. Crea `src/ProjectHubView.vue`, la versión nueva. Cada composable se llama una vez y se toma solo lo que se usa:

   ```vue
   <script setup>
   import { pedirTareas } from './datos.js'                // la carga simulada
   import { useAsyncState } from './composables/useAsyncState.js'             // carga
   import { useProjectFilters } from './composables/useProjectFilters.js'     // buscador

   const { datos: tareas, cargando, error, recargar } = useAsyncState(pedirTareas, []) // datos: tareas la renombra
   const { texto, soloPendientes, visibles, pendientes } = useProjectFilters(tareas)    // buscador
   </script>

   <template>
     <section>
       <h2>Después: Composition API</h2>
       <input v-model="texto" aria-label="Buscar tarea" placeholder="Buscar..." />
       <label><input type="checkbox" v-model="soloPendientes" /> Solo pendientes ({{ pendientes }})</label>
       <p v-if="cargando">Cargando...</p>
       <p v-else-if="error" role="alert">{{ error }}</p>
       <ul v-else>
         <li v-for="t in visibles" :key="t.id">{{ t.hecha ? '✔' : '○' }} {{ t.titulo }}</li>
       </ul>
       <button type="button" @click="recargar">Recargar</button>
     </section>
   </template>
   ```

4. En `src/App.vue`, debajo de la línea `import TareasOpciones ...`, agrega:

   ```js
   import ProjectHubView from './ProjectHubView.vue'      // la versión con composables
   ```

   Y debajo de `<TareasOpciones />`, agrega `<ProjectHubView />`.

**Primero, predice:** escribe "pr" en el buscador de la columna **Después**. ¿Se filtra también la columna **Antes**?

**Qué debes ver:** dos columnas. En **Después** quedan "Conectar la API de proyectos" y "Escribir pruebas del buscador", ordenadas de la A a la Z; **Antes** no cambia, porque cada componente tiene su propio estado. **Solo pendientes (3)** oculta las hechas, y **Recargar** muestra "Cargando..." otra vez.

**Opcional (1 minuto): ver la rama de error.** En `src/ProjectHubView.vue`, cambia `useAsyncState(pedirTareas, [])` por `useAsyncState(() => Promise.reject(new Error('sin red')), [])` y guarda. La columna **Después** muestra "No se pudieron cargar las tareas", porque `useAsyncState` atrapó el fallo en su `catch`. Vuelve a dejar `useAsyncState(pedirTareas, [])` y guarda.

## Paso 3. Composables de selección y de preferencia (5 minutos)

**Qué vas a hacer y por qué:** la selección recuerda qué tarea elegiste, y la preferencia guarda la vista compacta en el navegador con un `watch`, que es un efecto: algo que pasa afuera cuando un dato cambia.

1. Crea `src/composables/useTaskSelection.js`:

   ```js
   import { computed, ref } from 'vue'                     // dato calculado y caja vigilada

   export function useTaskSelection(tareas) {              // recibe la lista vigilada
     const seleccionadaId = ref(null)                      // id de la tarea elegida; null es ninguna
     const seleccionada = computed(() =>                   // la tarea completa, calculada desde el id
       tareas.value.find((t) => t.id === seleccionadaId.value) ?? null) // ?? da null si no la encuentra
     function seleccionar(id) {                            // única puerta para cambiar la selección
       seleccionadaId.value = id                           // guarda el id elegido
     }
     return { seleccionada, seleccionar }                  // entrega la tarea y la acción
   }
   ```

2. Crea `src/composables/useLocalPreferences.js`:

   ```js
   import { ref, watch } from 'vue'                        // caja vigilada y observador

   export function useLocalPreferences(clave, inicial = false) { // clave con la que se guarda en el navegador
     const guardado = localStorage.getItem(clave)          // lo que quedó de la visita anterior, o null
     const valor = ref(guardado === null ? inicial : guardado === 'true') // el texto 'true' pasa a booleano
     watch(valor, (nuevo) => localStorage.setItem(clave, String(nuevo)))  // efecto: guarda cada cambio
     return valor                                          // entrega la caja: se usa con v-model
   }
   ```

3. En `src/ProjectHubView.vue`, debajo del `import` de `useProjectFilters`, agrega:

   ```js
   import { useTaskSelection } from './composables/useTaskSelection.js'       // selección
   import { useLocalPreferences } from './composables/useLocalPreferences.js' // preferencia
   ```

   Y debajo de la línea `const { texto, ... } = useProjectFilters(tareas)`, agrega:

   ```js
   const { seleccionada, seleccionar } = useTaskSelection(tareas)                       // selección
   const compacta = useLocalPreferences('vista-compacta')                               // preferencia guardada
   ```

4. En el mismo archivo, reemplaza todo el bloque `<template>` por este. Cambian la etiqueta `<section>`, la casilla nueva, cada tarea ahora es un botón y aparece la línea "Seleccionada":

   ```vue
   <template>
     <section :class="{ compacta }">
       <h2>Después: Composition API</h2>
       <input v-model="texto" aria-label="Buscar tarea" placeholder="Buscar..." />
       <label><input type="checkbox" v-model="soloPendientes" /> Solo pendientes ({{ pendientes }})</label>
       <label><input type="checkbox" v-model="compacta" /> Vista compacta</label>
       <p v-if="cargando">Cargando...</p>
       <p v-else-if="error" role="alert">{{ error }}</p>
       <ul v-else>
         <li v-for="t in visibles" :key="t.id">
           <button type="button" @click="seleccionar(t.id)">{{ t.hecha ? '✔' : '○' }} {{ t.titulo }}</button>
         </li>
       </ul>
       <p>Seleccionada: {{ seleccionada?.titulo ?? 'ninguna' }}</p>
       <button type="button" @click="recargar">Recargar</button>
     </section>
   </template>
   ```

**Primero, predice:** elige una tarea, marca **Vista compacta** en **Después** y recarga con `F5`. ¿Qué se conserva y qué se pierde?

**Qué debes ver:** la vista compacta se conserva; la selección vuelve a "ninguna", porque solo la preferencia se guardó en el navegador. Cada columna usa su propia clave (`compacta` y `vista-compacta`), así que cada una recuerda lo suyo.

## Paso 4. Contexto con provide y un renderless (6 minutos)

**Qué vas a hacer y por qué:** un componente hijo no debería recibir por props todo lo que necesita a través de cada nivel. `ProjectHubView` ofrece sus datos con `provide` y una clave `Symbol`; el renderless los pide con un composable y se los entrega por el slot a quien decide cómo dibujarlos.

1. Crea `src/keys.js`. Es el mismo patrón de `useSesion` de las diapositivas:

   ```js
   import { inject } from 'vue'                            // función para recibir lo que ofrece un componente de arriba

   export const projectHubKey = Symbol('projectHub')       // clave única: ninguna otra puede chocar con ella

   export function useProjectHubContext() {                // así piden el contexto los componentes de abajo
     const contexto = inject(projectHubKey)                // busca hacia arriba quién lo ofreció con provide
     if (!contexto) {                                      // si nadie lo ofreció...
       throw new Error('useProjectHubContext debe utilizarse dentro de ProjectHubView') // ...error con nombre
     }
     return contexto                                       // datos y acciones de ProjectHub
   }
   ```

2. Crea `src/TaskCollectionProvider.vue`, el renderless:

   ```vue
   <!-- Renderless: no dibuja nada propio; entrega la lista y sus acciones por el slot -->
   <script setup>
   import { useProjectHubContext } from './keys.js'        // composable que lee el contexto
   const { visibles, cargando, error, seleccionar } = useProjectHubContext() // toma solo lo que va a entregar
   </script>

   <template>
     <slot :lista="visibles" :cargando :error :seleccionar /> <!-- :cargando es la forma corta de :cargando="cargando" -->
   </template>
   ```

3. Reemplaza todo `src/ProjectHubView.vue` por este. Cambian tres cosas: dos `import` nuevos (`provide` y `readonly` de `vue`; la clave y el renderless), el bloque `provide(...)` antes de `</script>`, y en la plantilla la lista, que ya no lee `visibles` directamente: la recibe del renderless con el nombre `lista`:

   ```vue
   <script setup>
   import { provide, readonly } from 'vue'                 // ofrecer datos y protegerlos de escritura
   import { pedirTareas } from './datos.js'                // la carga simulada
   import { useAsyncState } from './composables/useAsyncState.js'             // carga
   import { useProjectFilters } from './composables/useProjectFilters.js'     // buscador
   import { useTaskSelection } from './composables/useTaskSelection.js'       // selección
   import { useLocalPreferences } from './composables/useLocalPreferences.js' // preferencia
   import { projectHubKey } from './keys.js'               // la clave única del contexto
   import TaskCollectionProvider from './TaskCollectionProvider.vue'         // el renderless

   const { datos: tareas, cargando, error, recargar } = useAsyncState(pedirTareas, []) // datos: tareas la renombra
   const { texto, soloPendientes, visibles, pendientes } = useProjectFilters(tareas)    // buscador
   const { seleccionada, seleccionar } = useTaskSelection(tareas)                       // selección
   const compacta = useLocalPreferences('vista-compacta')                               // preferencia guardada

   provide(projectHubKey, {                                // ofrece a todos los componentes de abajo...
     visibles,                                             // ...la lista filtrada (un computed ya es de solo lectura)
     cargando: readonly(cargando),                         // ...la bandera, solo para leer
     error: readonly(error),                               // ...el mensaje, solo para leer
     seleccionar                                           // ...y la acción para elegir una tarea
   })
   </script>

   <template>
     <section :class="{ compacta }">
       <h2>Después: Composition API</h2>
       <input v-model="texto" aria-label="Buscar tarea" placeholder="Buscar..." />
       <label><input type="checkbox" v-model="soloPendientes" /> Solo pendientes ({{ pendientes }})</label>
       <label><input type="checkbox" v-model="compacta" /> Vista compacta</label>
       <!-- El renderless entrega los datos; este componente decide cómo se ven -->
       <TaskCollectionProvider v-slot="{ lista, cargando, error, seleccionar }">
         <p v-if="cargando">Cargando...</p>
         <p v-else-if="error" role="alert">{{ error }}</p>
         <ul v-else>
           <li v-for="t in lista" :key="t.id">
             <button type="button" @click="seleccionar(t.id)">{{ t.hecha ? '✔' : '○' }} {{ t.titulo }}</button>
           </li>
         </ul>
       </TaskCollectionProvider>
       <p>Seleccionada: {{ seleccionada?.titulo ?? 'ninguna' }}</p>
       <button type="button" @click="recargar">Recargar</button>
     </section>
   </template>
   ```

   Dentro del `v-slot`, `cargando`, `error` y `seleccionar` son los que entrega el slot y tienen prioridad sobre las variables del mismo nombre del `<script setup>`. Aquí valen lo mismo, porque salen del mismo contexto.

**Qué debes ver:** la columna **Después** funciona igual que en el paso 3. Ese es el punto de una refactorización: por fuera nada cambia; por dentro, `ProjectHubView` ya no sabe de dónde salen los datos de la lista ni cómo se cargan.

## Paso 5. Comprobar el contexto y retirar la versión anterior (3 minutos)

1. **Opcional, si te alcanza el tiempo (1 minuto). Predice:** si un componente pide el contexto fuera de `ProjectHubView`, ¿qué pasa? Pruébalo: en `src/App.vue`, agrega `import TaskCollectionProvider from './TaskCollectionProvider.vue'` y, debajo de `<ProjectHubView />`, agrega `<TaskCollectionProvider />`. Guarda.

   **Qué debes ver:** la consola de Chrome (`F12`) muestra dos avisos amarillos, `[Vue warn]: injection "Symbol(projectHub)" not found` (Vue no encontró quién ofreciera esa clave) y `[Vue warn]: Unhandled error during execution of setup function`, y luego en rojo `Uncaught Error: useProjectHubContext debe utilizarse dentro de ProjectHubView`. La página queda en blanco, porque el error detiene el montaje de toda la aplicación. El error dice qué falta y dónde. Quita las dos líneas que agregaste, guarda y recarga con `F5`.

2. Retira la versión anterior. Reemplaza todo `src/App.vue` por este y borra el archivo `src/TareasOpciones.vue`:

   ```vue
   <script setup>
   import ProjectHubView from './ProjectHubView.vue'      // la versión con composables
   </script>

   <template>
     <main class="columnas">
       <ProjectHubView />
     </main>
   </template>

   <!-- Estilos: cópialos tal cual, no son el tema de hoy -->
   <style>
   .columnas { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; font-family: system-ui, sans-serif; }
   section { border: 1px solid #888; border-radius: 8px; padding: 1rem; }
   section ul { list-style: none; padding: 0; }
   section li { padding: 0.5rem 0; }
   .compacta li { padding: 0; }
   </style>
   ```

3. En otra terminal, dentro de `lab02-composables`, prepara la versión final:

   ```bash
   npm run build
   ```

**Qué debes ver:** la aplicación muestra solo la columna **Después**, y la terminal termina con `✓ built in` y sin errores.

## Resultado esperado

- Cuatro composables en `src/composables`: filtros, selección, preferencias y carga. `useProjectHubContext`, en `src/keys.js`, también es un composable: vive junto a la clave que usa.
- Contexto ofrecido con `provide` y la clave `Symbol` de `src/keys.js`, con error claro fuera del proveedor.
- Un renderless, `TaskCollectionProvider`, que entrega la lista de tareas por un slot.
- `npm run build` termina sin errores.

Cada archivo final aparece completo en su paso: los composables en los pasos 2 y 3, `keys.js` y `TaskCollectionProvider.vue` en el paso 4, `ProjectHubView.vue` en el paso 4, y `App.vue` en el paso 5.

## Laboratorio resuelto

La carpeta [`ejercicio-resuelto/`](https://github.com/netec-mx/VUE_INT/tree/main/Capitulo02/ejercicio-resuelto) de este capítulo tiene el proyecto terminado, igual al que construyes con esta guía. Úsalo para comparar al final o si te atascas: lo que se aprende está en escribirlo tú.

```bash
cd ejercicio-resuelto
npm install              # instala las dependencias
npx vite --port 5172     # arranca la aplicación en http://localhost:5172
```

## Problemas frecuentes

| Lo que ves | Por qué pasa | Cómo se arregla |
|---|---|---|
| El creador pregunta `Add TypeScript?` o falla con `ERR_TTY_INIT_FAILED` | Faltó `--default`: con solo `--bare`, create-vue hace sus preguntas | Pulsa `Ctrl + C`, borra la carpeta si se creó y usa `npx --yes create-vue@3.16.4 lab02-composables --default --bare` |
| Avisos `EBADENGINE` o `Vite requires Node.js version ...` | Se usó `create-vue@latest`: las versiones nuevas traen Vite 7 y piden un Node más reciente que el del aula | Crea el proyecto otra vez con la versión fija `create-vue@3.16.4` |
| La terminal muestra `Local: http://localhost:5173/` y no 5172 | Se usó `npm run dev -- --port 5172` en PowerShell, que se come el `--` | Detén el servidor con `Ctrl + C` y usa `npx vite --port 5172` |
| `Port 5172 is in use, trying another one...` | Otro servidor quedó abierto en ese puerto | Usa la dirección que muestra la terminal, o cierra el otro servidor con `Ctrl + C` |
| `Failed to resolve import "./composables/..."` | El archivo no está en `src/composables` o el nombre no coincide | Revisa la carpeta y el nombre exacto, con mayúsculas |
| `Error: useProjectHubContext debe utilizarse dentro de ProjectHubView` | Un componente pide el contexto fuera de su proveedor | Ponlo dentro de la plantilla de `ProjectHubView` |
| La vista compacta no se recuerda al recargar | Falta el `watch` en `useLocalPreferences` o la casilla no usa `v-model="compacta"` | Revisa el paso 3 |
| Al guardar un archivo, la lista vuelve a "Cargando..." y se pierde la selección | La recarga en caliente de Vite vuelve a crear el componente | Es normal; `datos.js` entrega copias, así que los datos no se duplican |

## Limpieza

En la terminal del servidor, pulsa `Ctrl + C` para detenerlo.

## Ejercicios de reserva

**Básico (renderless).** Debajo de la lista, usa otra vez `TaskCollectionProvider` para mostrar solo "N tareas visibles".

<details markdown="1"><summary>Solución</summary>

Dentro de `<section>` en `src/ProjectHubView.vue`:

```vue
<TaskCollectionProvider v-slot="{ lista }">     <!-- pide solo la lista -->
  <p>{{ lista.length }} tareas visibles</p>     <!-- su propio diseño -->
</TaskCollectionProvider>
```

</details>

**Medio (plugin).** Crea un plugin `formatoFecha` que ofrezca a toda la aplicación una función para escribir fechas en español de Colombia, instálalo con `app.use` y muestra "Hoy: ..." en `ProjectHubView`.

<details markdown="1"><summary>Solución</summary>

`src/formatoFecha.js`:

```js
export const fechaKey = Symbol('fecha')                 // clave única del plugin
export const formatoFecha = {                           // un plugin es un objeto con install()
  install(app) {                                        // Vue lo llama una vez, con app.use
    const formato = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }) // "16 de octubre de 2026"
    app.provide(fechaKey, (fecha) => formato.format(fecha)) // ofrece la función a toda la aplicación
  }
}
```

En `src/main.js`: `import { formatoFecha } from './formatoFecha.js'` y `createApp(App).use(formatoFecha).mount('#app')`. En `ProjectHubView.vue`: agrega `inject` al `import` de `vue`, `import { fechaKey } from './formatoFecha.js'`, `const formatear = inject(fechaKey)` y en la plantilla `<p>Hoy: {{ formatear(new Date()) }}</p>`.

</details>

**Avanzado (HOC, componente de orden superior).** Crea `conPermiso(Componente, permitido)`, que devuelve un componente que muestra el original solo si `permitido` es `true`, y úsalo en `App.vue` con `ProjectHubView`.

<details markdown="1"><summary>Solución</summary>

`src/conPermiso.js`:

```js
import { defineComponent, h } from 'vue'                // crear un componente en JavaScript y describir qué dibujar
export function conPermiso(Componente, permitido) {     // recibe un componente y una condición
  return defineComponent({                              // devuelve un componente nuevo
    setup(_, { attrs, slots }) {                        // lo que le pasen al envoltorio
      return () => permitido                            // función que dibuja
        ? h(Componente, attrs, slots)                   // sí: el original, intacto
        : h('p', 'Sin permiso para ver ProjectHub')     // no: un aviso
    }
  })
}
```

En `App.vue`: `import { conPermiso } from './conPermiso.js'`, `const ProjectHubSeguro = conPermiso(ProjectHubView, false)` y `<ProjectHubSeguro />` en lugar de `<ProjectHubView />`. Con `false` ves el aviso; con `true`, la lista.

</details>

## Recursos

- [Crear un proyecto de Vue con create-vue](https://vuejs.org/guide/quick-start#creating-a-vue-application)
- [Por qué existe la Composition API](https://vuejs.org/guide/extras/composition-api-faq)
- [Composables: cómo escribirlos y nombrarlos](https://vuejs.org/guide/reusability/composables)
- [provide e inject](https://vuejs.org/guide/components/provide-inject)
- [Slots con datos, la base de los renderless](https://vuejs.org/guide/components/slots#scoped-slots)
- [Plugins](https://vuejs.org/guide/reusability/plugins)

## Control de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 2.0 | 2026-10-16 | Andrés Eduardo García Márquez | Guía reescrita: el proyecto se crea desde una carpeta vacía con Vite 6.4 y todo el código está en la guía; parte de una versión en Options API; predicción y resultado visible en cada paso; ejercicios de reserva con solución; `npm run build` como prueba final |
| 2.1 | 2026-10-16 | Andrés Eduardo García Márquez | Validada por CLI en Windows 11 (PowerShell) y Linux: el proyecto se crea con `npx --yes create-vite@6.4` y el servidor arranca con `npx vite --port 5172`, porque PowerShell se come el `--` de `npm create ... -- --template` y de `npm run dev -- --port`; Node 20 o 22; aviso de borrar `HelloWorld.vue` al final del paso 1; paso opcional de la rama de error; paso 4 con el archivo completo; aclaración del slot; paso 5.1 opcional con los avisos reales de la consola; problemas frecuentes con las dos fallas reales |
| 2.2 | 2026-10-17 | Andrés Eduardo García Márquez | El proyecto se crea con create-vue, la herramienta oficial que enseñan los manuales: `npx --yes create-vue@3.16.4 lab02-composables --default --bare` (sin `--default` hace preguntas); la guía dice qué trae el proyecto, que `src/main.js` no cambia y que no se borra nada; `ejercicio-resuelto/` rehecho siguiendo la guía; validada paso a paso en Windows 11 y con la pasada final en Linux |

<!-- {% endraw %} -->
