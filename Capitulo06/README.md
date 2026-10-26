# Práctica 6.4: aplicar optimizaciones y medir mejoras en una SPA real

<!-- lang: es-CO -->
<!-- {% raw %} -->

| Campo | Valor |
|---|---|
| Duración | 46 minutos |
| Complejidad | Media |
| Nivel de Bloom | Aplicar y analizar |

## De qué trata

Vas a construir **Catálogo Pro**, una SPA (aplicación de una sola página) con 2.000 productos, a medirla, a optimizarla y a volver a medirla. No se trata de que "se sienta" más rápida: al final tendrás un informe con el antes y el después. El número que más se nota: la página pasa de dibujar **2.000 filas** a dibujar **18**, aunque los 2.000 productos sigan en memoria.

## Objetivos

Al terminar podrás:

- Registrar una línea base con el peso del paquete, Lighthouse y la pestaña Rendimiento (Performance) de Chrome.
- Sacar del paquete inicial las vistas que no se ven al entrar, con rutas diferidas y `manualChunks`.
- Reducir el trabajo de dibujo con un filtro memoizado (`computed`), una lista virtual y `v-memo`.
- Comparar y documentar el antes y el después en las mismas condiciones.

## Conceptos que usas

Todos se vieron antes en el curso. Solo la forma de medir y las tres técnicas del capítulo 6 son nuevas hoy.

| Concepto | Dónde se vio |
|---|---|
| `ref`, `shallowRef`, `computed`, props y eventos | Capítulos 1 y 2 |
| Vue Router, `RouterLink`, `RouterView` y rutas con `import()` | Capítulo 3 |
| Pedir datos con `async`/`await` y un estado "cargando" | Capítulo 5 (repaso de hoy) |
| Lighthouse, pestaña Rendimiento, `performance.mark()` y `measure()` | Tema 6.1 |
| Fragmentos con `import()`, `manualChunks` y el visualizador del paquete | Tema 6.2 |
| `computed` como memoización, lista virtual, `v-memo` y `v-once` | Tema 6.3 |

## Antes de empezar

- **Node.js 24 LTS** (probado con 24.22.0), con npm 11. Compruébalo con `node -v`.
- Google Chrome y Visual Studio Code (con la extensión **Vue (Official)** si la ofrece).
- Conexión a internet para instalar los paquetes. Nada más: todo el código está en esta guía.

## Preparación (5 minutos)

1. Abre una terminal en una carpeta tuya de prácticas (por ejemplo, `labs-vue` en tus documentos) y crea el proyecto con **create-vue**, la herramienta oficial de Vue que viste en el capítulo 0. El comando es el mismo en Windows (PowerShell), macOS y Linux; `--yes` evita la pregunta `Ok to proceed?`:

   ```bash
   npx --yes create-vue@3.16.4 catalogo-pro --bare --router
   cd catalogo-pro
   npm install
   npm install -D rollup-plugin-visualizer@5.14.0
   ```

   - `--router` agrega Vue Router (capítulo 3) ya conectado a la aplicación; `--bare` deja el proyecto sin páginas de ejemplo. Con las dos opciones create-vue no hace preguntas.
   - La versión va fija: 3.16.4 crea el proyecto con Vite 6, que funciona en Node 20, 22 y 24. Las versiones más nuevas piden Node 22.18 o superior.
   - `rollup-plugin-visualizer` dibuja el mapa del paquete (tema 6.2). Es lo único que se instala aparte.

2. Abre la carpeta en VS Code (`code .`) y mira lo que trae el proyecto. No hay que borrar nada:

   | Archivo | Qué hace | Qué haces con él |
   |---|---|---|
   | `src/main.js` | Crea la aplicación y activa el enrutador con `app.use(router)` | Nada: se queda tal cual |
   | `src/router/index.js` | Enrutador con la lista de rutas vacía | Lo reemplazas en el paso 1 |
   | `src/App.vue` | Componente raíz con un título `You did it!` | Lo reemplazas en el paso 1 |
   | `vite.config.js` | Plugin de Vue, panel Vue DevTools en desarrollo y el atajo `@` para `src` | Lo reemplazas en el paso 3 |
   | `public/favicon.ico` | Logotipo de Vue | Lo usas en el paso opcional |

3. En `index.html`, cambia `lang=""` por `lang="es"` y el título `Vite App` por `Catálogo Pro`.

**Qué debes ver:** la terminal termina sin errores (`added ... packages`). Puede salir un aviso amarillo `npm warn`: no impide seguir.

## Paso 1. Construir la SPA de partida (9 minutos)

**Qué vas a hacer y por qué:** armar la aplicación tal como suele llegar a un proyecto real: funciona, pero dibuja todo y carga todo de entrada. Es la "línea base" que vas a medir.

1. Crea `src/datos/productos.js`. Es la "API" de los datos; cópialo tal cual, no es el tema de hoy:

   ```js
   // Datos de ejemplo: cópialo tal cual, no es el tema de hoy
   const TIPOS = ['Audio', 'Cómputo', 'Hogar', 'Oficina']         // cuatro tipos de producto que se repiten
   const productos = Array.from({ length: 2000 }, (_, i) => ({    // crea 2.000 productos
     id: i + 1,                                                   // identificador único: 1, 2, 3...
     nombre: `Producto ${i + 1}`,                                 // nombre visible
     tipo: TIPOS[i % 4],                                          // % es el residuo: reparte en los 4 tipos
     precio: 10 + ((i * 37) % 490),                               // precio entre 10 y 499 dólares
     stock: 5 + ((i * 13) % 45)                                   // unidades disponibles
   }))

   // Repaso del capítulo 5: simula una API REST que responde en 300 ms
   export function pedirProductos() {
     return new Promise((resolver) =>                             // promesa: el resultado llega después
       setTimeout(() => resolver([...productos]), 300))           // [...] entrega una copia, no la lista original
   }
   ```

2. `src/main.js` no se toca: create-vue ya lo dejó con `app.use(router)`, que activa el enrutador.

3. Reemplaza todo `src/router/index.js` por este. Por ahora importa las tres vistas de entrada (así suele llegar un proyecto real):

   ```js
   import { createRouter, createWebHistory } from 'vue-router'    // funciones del enrutador
   import CatalogoView from '../views/CatalogoView.vue'            // la vista de entrada sí va en el paquete inicial
   import ReportesView from '../views/ReportesView.vue'            // hoy viaja en el paquete inicial
   import AdminView from '../views/AdminView.vue'                  // también

   export default createRouter({
     history: createWebHistory(import.meta.env.BASE_URL),          // direcciones limpias, sin #; BASE_URL vale '/'
     routes: [
       { path: '/', component: CatalogoView },                     // se necesita al abrir la página
       { path: '/reportes', component: ReportesView },
       { path: '/admin', component: AdminView }
     ]
   })
   ```

4. Reemplaza todo `src/App.vue` por este:

   ```html
   <template>
     <header>
       <strong>Catálogo Pro</strong>
       <!-- aria-label nombra el menú para los lectores de pantalla -->
       <nav aria-label="Principal">
         <RouterLink to="/">Catálogo</RouterLink>
         <RouterLink to="/reportes">Reportes</RouterLink>
         <RouterLink to="/admin">Administración</RouterLink>
       </nav>
     </header>
     <!-- RouterView dibuja la vista de la ruta actual -->
     <main><RouterView /></main>
   </template>

   <style>
   body { margin: 0; font-family: system-ui, sans-serif; color: #1a1a1a; background: #fff; }
   header { display: flex; gap: 1.5rem; align-items: center; padding: 0.75rem 1rem; background: #1e3a5f; color: #fff; }
   nav { display: flex; gap: 1rem; }
   nav a { color: #fff; }
   main { padding: 1rem; }
   </style>
   ```

5. Crea la carpeta `src/views` y en ella las dos vistas secundarias. Cópialas tal cual, no son el tema de hoy: solo existen para que haya rutas que no se ven al entrar. `src/views/AdminView.vue`:

   ```html
   <template>
     <h1>Administración</h1>
     <p>Zona del equipo interno. Casi nadie la visita: no debe pesar en la carga inicial.</p>
   </template>
   ```

   `src/views/ReportesView.vue`:

   ```html
   <template>
     <h1>Reportes</h1>
     <p>Informes de ventas del mes. Pocas personas entran aquí: tampoco debe pesar en la carga inicial.</p>
   </template>
   ```

6. Crea `src/components/FilaProducto.vue`, el componente de una fila:

   ```html
   <script setup>
   const { fila } = defineProps({ fila: Object })   // producto que recibe; desestructurar es reactivo desde Vue 3.5
   const emit = defineEmits(['vender'])              // aviso que la fila le manda a quien la usa
   </script>

   <template>
     <article class="fila">
       <small>Ref. {{ fila.id }}</small>
       <strong>{{ fila.nombre }}</strong>
       <span>{{ fila.tipo }}</span>
       <span>{{ fila.precio }} USD</span>
       <span>Stock: {{ fila.stock }}</span>
       <button type="button" :aria-label="'Vender 1 de ' + fila.nombre" @click="emit('vender', fila.id)">Vender 1</button>
     </article>
   </template>

   <style scoped>
   .fila { display: grid; grid-template-columns: 5rem 1fr 5rem 5rem 5rem 6rem; gap: 0.5rem; align-items: center;
     height: 56px; box-sizing: border-box; padding: 0 0.5rem; border-bottom: 1px solid #ddd; }
   </style>
   ```

   En los capítulos 1, 2 y 4 viste que desestructurar un objeto reactivo corta la conexión. `defineProps` es la excepción: desde Vue 3.5, en `<script setup>`, el compilador convierte cada `fila` en `props.fila`, así que la fila se sigue actualizando. Fuera de `defineProps` (con `reactive()` o un almacén de Pinia) la regla de antes sigue vigente.

7. Crea `src/views/CatalogoView.vue`. Fíjate en `filtrar()`: es una función llamada desde la plantilla, y lleva un cronómetro (`performance.mark`) y un contador (`console.count`):

   ```html
   <script setup>
   import { ref, shallowRef, onMounted } from 'vue'                     // funciones de Vue
   import { pedirProductos } from '../datos/productos.js'               // la "API" de los datos
   import FilaProducto from '../components/FilaProducto.vue'            // componente de una fila

   const productos = shallowRef([])                                     // lista grande: shallowRef (capítulo 1)
   const cargando = ref(true)                                           // estado de la petición (capítulo 5)
   const busqueda = ref('')                                             // texto del buscador
   const nodos = ref(0)                                                 // elementos que tiene la página
   const filas = ref(0)                                                 // filas de producto dibujadas

   onMounted(async () => {                                              // al mostrarse la vista...
     productos.value = await pedirProductos()                           // ...espera la respuesta de la "API"
     cargando.value = false                                             // y apaga el aviso de carga
   })

   function filtrar() {                                                 // se ejecuta en CADA dibujo de la vista
     console.count('Cálculos del filtro')                               // suma 1 en la consola cada vez que se calcula
     performance.mark('filtro-inicio')                                  // marca: arranca el cronómetro
     const t = busqueda.value.trim().toLowerCase()                      // limpia el texto una sola vez
     const resultado = productos.value.filter((p) => p.nombre.toLowerCase().includes(t)) // deja los que coinciden
     performance.mark('filtro-fin')                                     // marca: para el cronómetro
     const m = performance.measure('filtro', 'filtro-inicio', 'filtro-fin') // mide el tramo entre las dos marcas
     console.log(`Filtro: ${m.duration.toFixed(2)} ms`)                 // muestra la duración con 2 decimales
     return resultado                                                   // la lista filtrada
   }

   function vender(id) {                                                // resta 1 al stock de un producto
     productos.value = productos.value.map((p) =>                       // shallowRef: se entrega una lista nueva...
       (p.id === id ? { ...p, stock: p.stock - 1 } : p))                // ...con un objeto nuevo solo para ese producto
   }

   function contarNodos() {                                             // cuenta lo que hay en la página
     nodos.value = document.querySelectorAll('*').length                // '*' significa todos los elementos
     filas.value = document.querySelectorAll('.fila').length            // solo las filas de producto
   }
   </script>

   <template>
     <h1>Catálogo</h1>
     <label>Buscar producto <input v-model="busqueda" type="search" /></label>
     <button type="button" @click="contarNodos">Contar nodos</button>
     <!-- aria-live: el lector de pantalla anuncia el número cuando cambia -->
     <p aria-live="polite">Nodos en la página: {{ nodos }} - Filas dibujadas: {{ filas }}</p>
     <p v-if="cargando">Cargando productos...</p>
     <section v-else aria-label="Productos">
       <FilaProducto v-for="p in filtrar()" :key="p.id" :fila="p" @vender="vender" />
     </section>
   </template>
   ```

8. Arranca el servidor de desarrollo con `npm run dev`, abre la dirección que muestra la terminal (`http://localhost:5173`) y abre la consola de Chrome con `F12`.

**Primero, predice:** la lista ya está dibujada y la consola dice `Cálculos del filtro: 1`. Si pulsas **Contar nodos**, que no toca el filtro, ¿el filtro se vuelve a calcular?

9. Pulsa **Contar nodos**.

**Qué debes ver:** "Nodos en la página: **más de 14.000** - Filas dibujadas: **2000**", y en la consola `Cálculos del filtro: 2` con una línea `Filtro: ... ms`. Sí se recalculó: una función en la plantilla se ejecuta en **cada** dibujo de la vista. Los enlaces Reportes y Administración también funcionan.

## Paso 2. Medir la línea base (7 minutos)

**Qué vas a hacer y por qué:** sin el número de antes no puedes demostrar la mejora. Se mide la compilación de producción, no el servidor de desarrollo.

1. En la terminal, detén el servidor con `Ctrl + C` y compila:

   ```bash
   npm run build
   ```

   **Qué debes ver:** en `dist/assets` aparece **un solo** archivo `index-....js` de unos 96 kB (unos 38 kB en la columna `gzip`, que es lo que viaja por la red), más un `index-....css` pequeño con los estilos. Todo el JavaScript llega junto. Así salió en la prueba (las letras del nombre cambian en cada compilación):

   ```text
   dist/index.html                  0.44 kB │ gzip:  0.29 kB
   dist/assets/index-2SW5xH-G.css   0.43 kB │ gzip:  0.27 kB
   dist/assets/index-B1z2xwd-.js   96.47 kB │ gzip: 37.71 kB
   ✓ built in 5.82s
   ```

2. Sirve la compilación con `npm run preview`. Queda corriendo en esa terminal hasta que la detengas. Abre una **ventana de incógnito** de Chrome (`Ctrl + Mayús + N`; así las extensiones no alteran la medida) en `http://localhost:4173`.

3. Lighthouse: `F12`, pestaña **Lighthouse**, modo **Navegación** (Navigation), dispositivo **Escritorio** (Desktop), solo la categoría **Rendimiento** (Performance), y pulsa **Analizar carga de página**. Anota la puntuación, LCP (cuándo aparece lo principal) y TBT (cuánto tiempo estuvo bloqueado el navegador). Revisa los diagnósticos: aparece **Evita un tamaño excesivo del DOM** (Avoid an excessive DOM size) con unos 14.000 elementos; el DOM es el árbol de elementos de la página. En un equipo rápido la puntuación puede salir en 100: en ese caso compara TBT y el tamaño del DOM.

4. Rendimiento: pestaña **Performance**, pulsa grabar (`Ctrl + E`), escribe `19` en el buscador y detén la grabación. En la pista **Timings** busca las barras `filtro`: son tus `performance.measure`. Al lado verás el trabajo de redibujar 2.000 filas.

5. Crea la carpeta `docs` y dentro `docs/performance-report.md` con esta plantilla. Llena la columna **Antes**:

   ```md
   # Informe de rendimiento - Catálogo Pro

   Condiciones: mismo equipo, Chrome en ventana de incógnito, Lighthouse en modo Navegación y Escritorio, compilación servida con `npm run preview`.

   | Medida | Antes | Después |
   |---|---|---|
   | Archivos JavaScript en `dist/assets` | | |
   | JavaScript que descarga el catálogo (kB gzip) | | |
   | Puntuación de rendimiento de Lighthouse | | |
   | LCP (s) | | |
   | TBT (ms) | | |
   | Nodos en la página del catálogo | | |
   | Filas dibujadas | | |
   | Cálculos del filtro al pulsar Contar nodos | | |

   ## Cambios aplicados

   ## Conclusión
   ```

## Paso 3. Ver el mapa del paquete (2 minutos)

**Qué vas a hacer y por qué:** no se divide bien lo que no se ha pesado. El visualizador dibuja el paquete como rectángulos: el área de cada uno es su peso.

Si `npm run preview` sigue abierto desde el paso 2, detenlo con `Ctrl + C` en su terminal.

1. Reemplaza todo `vite.config.js` por este. Conserva lo que trajo create-vue y agrega el visualizador. El mapa solo se genera cuando lo pides, para no alargar cada compilación:

   ```js
   import { fileURLToPath, URL } from 'node:url'                // convierte una dirección de archivo en ruta del disco
   import { defineConfig } from 'vite'                          // ayuda para escribir la configuración
   import vue from '@vitejs/plugin-vue'                         // enseña a Vite a leer archivos .vue
   import vueDevTools from 'vite-plugin-vue-devtools'           // panel Vue DevTools (lo trajo create-vue)
   import { visualizer } from 'rollup-plugin-visualizer'        // dibuja el mapa del paquete

   export default defineConfig(({ mode }) => ({                 // mode vale 'analisis' con npm run build:analisis
     plugins: [
       vue(),                                                   // plugin de Vue
       vueDevTools(),                                           // solo actúa con npm run dev: no entra en dist
       mode === 'analisis' && visualizer({                      // el mapa solo se genera si se pide
         filename: 'estadisticas.html',                         // archivo del mapa, en la carpeta del proyecto
         gzipSize: true                                         // muestra también el peso comprimido
       })
     ],
     resolve: {
       alias: {
         '@': fileURLToPath(new URL('./src', import.meta.url))  // '@' en un import significa la carpeta src
       }
     },
   }))
   ```

2. En `package.json`, debajo de la línea `"build": "vite build",` agrega:

   ```json
   "build:analisis": "vite build --mode analisis",
   ```

3. Ejecuta `npm run build:analisis` y abre en Chrome el archivo `estadisticas.html` que aparece en la carpeta del proyecto (arrástralo a una pestaña).

**Qué debes ver:** un rectángulo grande con `vue` y `vue-router` dentro de `node_modules`, y uno pequeño con tus archivos de `src`. Vue pesa más que todo tu código junto.

## Paso 4. Rutas diferidas y manualChunks (6 minutos)

**Qué vas a hacer y por qué:** quien abre el catálogo no necesita Reportes ni Administración. Con `import()` esas vistas viajan en fragmentos aparte que se descargan al visitarlas. Y con `manualChunks` Vue viaja en su propio archivo: cambia poco, así que se queda en la caché del navegador entre una publicación y otra.

1. En `src/router/index.js`, borra las dos líneas `import ReportesView ...` e `import AdminView ...`, y reemplaza las dos rutas por estas:

   ```js
       { path: '/reportes', component: () => import('../views/ReportesView.vue') }, // se descarga al visitar la ruta
       { path: '/admin', component: () => import('../views/AdminView.vue') }        // igual: fragmento aparte
   ```

2. En `vite.config.js`, agrega esta línea encima de `export default`:

   ```js
   const VUE = /node_modules[\\/](vue|@vue|vue-router)[\\/]/    // patrón: carpetas de Vue y de su enrutador
   ```

   `[\\/]` acepta cualquiera de las dos barras: `\` en las rutas de Windows y `/` en las de macOS y Linux. Así el patrón funciona en los tres sistemas.

3. En el mismo archivo, entre el `},` que cierra `resolve` y el `}))` final, agrega el bloque `build`:

   ```js
     build: {
       rollupOptions: {
         output: {
           manualChunks(id) {                                   // Vite la llama con la ruta de cada módulo
             if (!id.includes('node_modules')) return           // código propio: Vite decide solo
             if (VUE.test(id)) return 'vue'                     // Vue y el enrutador viajan juntos en vue-*.js
             return 'vendor'                                    // cualquier otra librería externa
           }
         }
       }
     }
   ```

**Predice:** ¿cuántos archivos `.js` crees que va a crear la compilación ahora?

4. Ejecuta `npm run build`.

**Qué debes ver:** cuatro archivos: `vue-....js` (el grueso, unos 93 kB), `index-....js` (tu código, unos 5 kB), `ReportesView-....js` y `AdminView-....js` (menos de 1 kB cada uno). Además sale `index-....css` con los estilos. Con `npm run preview`, en la pestaña **Network** (Red) de Chrome, `ReportesView-....js` se descarga solo cuando entras a Reportes. Al terminar de mirar, detén `npm run preview` con `Ctrl + C`.

## Paso 5. Memoizar el filtro con computed (4 minutos)

**Qué vas a hacer y por qué:** en el paso 1 viste que el filtro se recalcula aunque nada suyo cambie. Un `computed` guarda el resultado (memoización) y solo recalcula cuando cambian `busqueda` o `productos`.

**Dónde:** `src/views/CatalogoView.vue`. Si `npm run preview` sigue abierto, detenlo con `Ctrl + C`, y arranca otra vez `npm run dev`.

1. En el `import` de `vue`, agrega `computed`:

   ```js
   import { ref, shallowRef, computed, onMounted } from 'vue'           // funciones de Vue
   ```

2. Cambia la primera y la última línea de la función. El cuerpo no cambia:

   ```js
   const filtrados = computed(() => {                                   // guarda el resultado; recalcula si cambian sus datos
     // ... el cuerpo sigue igual ...
   })
   ```

   La primera línea antes era `function filtrar() {` y la última `}`.

3. En la plantilla, cambia `v-for="p in filtrar()"` por `v-for="p in filtrados"`. Sin paréntesis: un `computed` se lee como un dato.

**Predice y comprueba:** recarga la página (`F5`) y pulsa **Contar nodos** tres veces.

**Qué debes ver:** la consola se queda en `Cálculos del filtro: 1`. Si escribes en el buscador, suma uno por tecla: ese cálculo sí hace falta. Las filas dibujadas siguen en 2000; eso se arregla ahora.

## Paso 6. Dibujar solo lo que se ve: lista virtual (6 minutos)

**Qué vas a hacer y por qué:** la caja de la lista mide 560 píxeles y cada fila 56: solo se ven 10. La lista virtual dibuja esas 10 más 4 de reserva arriba y 4 abajo, y las mueve al desplazarte. Lo que cuesta no es calcular, es dibujar.

1. Crea `src/components/ListaVirtual.vue`:

   ```html
   <script setup>
   import { computed, ref } from 'vue'                                  // funciones de Vue
   import FilaProducto from './FilaProducto.vue'                        // cada fila sigue siendo su componente

   const { productos } = defineProps({ productos: Array })             // lista completa, ya filtrada (reactiva: Vue 3.5)
   const emit = defineEmits(['vender'])                                 // reenvía el aviso de cada fila
   const ALTO = 56                                                      // alto de una fila en px: igual al CSS de la fila
   const VENTANA = 560                                                  // alto de la caja visible: caben 10 filas
   const RESERVA = 4                                                    // filas extra arriba y abajo para no ver huecos
   const CUANTAS = VENTANA / ALTO + RESERVA * 2                         // 10 + 8 = 18 filas dibujadas
   const scrollTop = ref(0)                                             // cuántos px ha bajado la persona

   const inicio = computed(() =>                                        // primera fila que se dibuja
     Math.max(0, Math.floor(scrollTop.value / ALTO) - RESERVA))         // floor redondea abajo; max evita negativos
   const visibles = computed(() =>                                      // solo este trozo llega a la página
     productos.slice(inicio.value, inicio.value + CUANTAS))             // slice corta sin tocar la lista original
   const alto = computed(() => productos.length * ALTO + 'px')          // alto de TODAS las filas, para la barra
   const mover = computed(() => `translateY(${inicio.value * ALTO}px)`) // baja las filas a su lugar

   function alDesplazar(e) {                                            // corre en cada movimiento de la barra
     scrollTop.value = e.target.scrollTop                               // guarda cuánto se bajó
   }
   </script>

   <template>
     <!-- tabindex="0": la caja recibe el foco y se desplaza con las flechas del teclado -->
     <div class="ventana" tabindex="0" @scroll="alDesplazar">
       <!-- el relleno da a la barra el tamaño de la lista entera -->
       <div class="relleno" :style="{ height: alto }">
         <div class="filas" :style="{ transform: mover }">
           <!-- una fila por producto visible; key por id -->
           <FilaProducto
             v-for="p in visibles"
             :key="p.id"
             :fila="p"
             @vender="emit('vender', $event)"
           />
         </div>
       </div>
     </div>
   </template>

   <style scoped>
   .ventana { height: 560px; overflow-y: auto; border: 1px solid #ccc; }
   .relleno { position: relative; }
   .filas { position: absolute; top: 0; left: 0; right: 0; }
   </style>
   ```

2. En `CatalogoView.vue`, cambia la línea `import FilaProducto ...` por esta:

   ```js
   import ListaVirtual from '../components/ListaVirtual.vue'            // dibuja solo las filas que se ven
   ```

3. En la plantilla, reemplaza todo el bloque `<section ...> ... </section>` por esta línea:

   ```html
   <ListaVirtual v-else :productos="filtrados" @vender="vender" />
   ```

**Predice:** ¿cuántas filas dibujadas crees que vas a contar ahora?

4. Desplázate un poco por la lista y pulsa **Contar nodos**.

**Qué debes ver:** "Filas dibujadas: **18**" y menos de 200 nodos. La barra de desplazamiento sigue teniendo el tamaño de 2.000 productos, y con `Tab` y las flechas del teclado también puedes recorrerla.

## Paso 7. Pistas de dibujo: v-memo y v-once (2 minutos)

**Qué vas a hacer y por qué:** `v-memo` le promete a Vue que una fila solo cambia si cambian ciertos datos; si no cambian, Vue se la salta. `v-once` dibuja algo una vez y nunca más. Son promesas: si mientes, la pantalla queda vieja.

1. En `ListaVirtual.vue`, reemplaza el comentario y el bloque `<FilaProducto ... />` por estos. Fíjate: el comentario promete precio y stock, pero a propósito la lista de `v-memo` solo trae el precio:

   ```html
           <!-- v-memo: Vue salta la fila si precio y stock no cambiaron -->
           <FilaProducto
             v-for="p in visibles"
             :key="p.id"
             v-memo="[p.precio]"
             :fila="p"
             @vender="emit('vender', $event)"
           />
   ```

**Predice:** si pulsas **Vender 1** en la primera fila, ¿bajará el stock en pantalla?

2. Pulsa **Vender 1** en la primera fila y mira su stock.

   **Qué debes ver:** el stock no baja. El dato sí cambió, pero el stock no está en la lista de `v-memo`, así que Vue se salta la fila. Ese es el riesgo. Corrige la línea:

   ```html
   v-memo="[p.precio, p.stock]"
   ```

3. En `FilaProducto.vue`, reemplaza la línea `<small>Ref. {{ fila.id }}</small>` por estas dos:

   ```html
       <!-- v-once: la referencia se dibuja una sola vez, porque el id nunca cambia -->
       <small v-once>Ref. {{ fila.id }}</small>
   ```

**Qué debes ver:** al pulsar **Vender 1**, el stock baja en uno y la referencia sigue igual.

## Paso 8. Medir otra vez y cerrar el informe (5 minutos)

1. Detén el servidor (`Ctrl + C`), ejecuta `npm run build` y `npm run preview`, y repite en incógnito Lighthouse y **Contar nodos**, en las mismas condiciones del paso 2.
2. Llena la columna **Después** de `docs/performance-report.md`, anota los cambios del paso 4 al 7 y escribe una conclusión de dos líneas.

**Qué debes ver:** menos JavaScript propio en la carga inicial (unos 6 kB en lugar de 96 kB en un solo archivo), unos 150 nodos en lugar de más de 14.000, 18 filas en lugar de 2.000, TBT más bajo (en la prueba, de 50 ms a 0 ms) y el aviso de DOM excesivo fuera de Lighthouse. Los números exactos dependen de tu equipo; lo que importa es la comparación justa.

## Paso opcional. Imágenes con tamaño declarado (3 minutos)

En `App.vue`, antes de `<strong>Catálogo Pro</strong>`, agrega el logotipo de Vue que trajo create-vue en `public/`:

```html
<img src="/favicon.ico" alt="" width="28" height="28" />   <!-- width y height reservan el espacio: la página no salta -->
```

`alt=""` indica que es decorativa. No lleva `loading="lazy"`: está arriba y se ve al entrar. `lazy` es para imágenes que quedan debajo del borde de la pantalla; en la imagen principal retrasaría el LCP.

## Resultado esperado

- Línea base guardada: paquete, LCP, TBT y Lighthouse.
- Reportes y Administración en fragmentos aparte; Vue en `vue-....js`.
- Catálogo con 18 filas dibujadas de 2.000 productos.
- Filtro memoizado con `computed` y filas con `v-memo` y `v-once`.
- `docs/performance-report.md` con el antes y el después.

## Laboratorio resuelto

La carpeta [`ejercicio-resuelto/`](ejercicio-resuelto/) de este capítulo tiene el proyecto terminado, igual al que construyes con esta guía. Úsalo para comparar al final o si te atascas: lo que se aprende está en escribirlo tú.

```bash
cd ejercicio-resuelto
npm install              # instala las dependencias
npx vite --port 5176     # arranca la aplicación en http://localhost:5176
```

## Problemas frecuentes

| Lo que ves | Por qué pasa | Cómo se arregla |
|---|---|---|
| `npm error Missing script: "build:analisis"` | Falta el script en `package.json` | Haz el paso 3.2 y revisa la coma al final de la línea |
| Lighthouse: `ERR_CONNECTION_REFUSED` o no carga la página | `npm run preview` no está corriendo | Arráncalo y usa el puerto que muestra (4173) |
| `Port 5173 is in use, trying another one...` o `Port 4173 is in use` | Otro servidor (`dev` o `preview`) quedó abierto | Usa la dirección que muestra la terminal, o cierra el otro con `Ctrl + C` |
| create-vue pregunta `Project name`, `Add TypeScript?` y más, o se queda esperando | Faltan las opciones o se escribieron detrás de un `--`, que PowerShell se come | Usa el comando de la preparación tal cual: `npx --yes create-vue@3.16.4 catalogo-pro --bare --router` |
| `npm warn EBADENGINE` y luego Vite no arranca | Se usó `create-vue@latest`: las versiones nuevas traen Vite 7, que pide Node 20.19 o 22.12 en adelante | Borra la carpeta y créala con `create-vue@3.16.4`, o actualiza Node |
| Pulsas **Contar nodos** o **Vender 1** y no cambia nada, justo después de guardar cambios con la pestaña cerrada | En la prueba en Windows pasó solo en la primera carga de la página tras cambiar archivos sin la pestaña abierta | Recarga con `F5`. Con la pestaña abierta mientras editas no pasa |
| Lighthouse da 100 antes y después | El equipo es rápido y la página es pequeña | Compara TBT, el tamaño del DOM y los nodos: ahí está la diferencia |
| La lista virtual muestra huecos o filas encimadas | `ALTO` no coincide con `height: 56px` de `.fila` | Deja los dos en 56 |
| El stock no baja al pulsar Vender 1 | `v-memo` no incluye `p.stock` | Es la predicción del paso 7: agrega `p.stock` |
| Al guardar un archivo, la consola repite cálculos y la lista vuelve a su estado inicial | Vite recarga el componente en caliente | Es normal en desarrollo; por eso los datos se copian con `[...productos]` |

## Limpieza

En cada terminal con un servidor (`dev` o `preview`), pulsa `Ctrl + C`.

## Ejercicios de reserva

**Básico.** ¿Cada cuánto se redibuja la lista virtual? En `ListaVirtual.vue`, agrega `onUpdated` al `import` de `vue` (el gancho del ciclo de vida que corre después de cada redibujo) y, debajo de `const RESERVA = 4`, la línea `onUpdated(() => console.count('Redibujos de la lista'))`. Desplázate despacio por la lista: ¿cada cuántos píxeles suma uno?

<details markdown="1">
<summary>Solución</summary>

En los primeros 280 píxeles no suma nada: por la reserva de 4 filas, `inicio` se queda en 0. Desde ahí suma uno cada 56 píxeles, cuando una fila entra o sale de la caja. Un desplazamiento menor cambia `scrollTop`, pero `inicio`, `visibles` y `mover` dan el mismo resultado, y Vue no redibuja.

</details>

**Medio.** Agrega al catálogo un selector de tipo (Audio, Cómputo, Hogar, Oficina) que filtre en el **mismo** `computed`, en un solo recorrido.

<details markdown="1">
<summary>Solución</summary>

```js
const tipo = ref('')                                                 // '' significa todos los tipos
// dentro de filtrados, en lugar de la línea del filter:
const resultado = productos.value.filter((p) =>
  p.nombre.toLowerCase().includes(t) && (!tipo.value || p.tipo === tipo.value))
```

```html
<label>Tipo
  <select v-model="tipo">
    <option value="">Todos</option>
    <option>Audio</option><option>Cómputo</option><option>Hogar</option><option>Oficina</option>
  </select>
</label>
```

</details>

**Avanzado.** Precarga el fragmento de Reportes cuando el cursor pasa por su enlace o el teclado le da el foco, y compruébalo en Network con `npm run preview`.

<details markdown="1">
<summary>Solución</summary>

En `App.vue`:

```html
<script setup>
function precargar() { import('./views/ReportesView.vue') }          // pide el fragmento antes del clic
</script>
```

```html
<RouterLink to="/reportes" @mouseenter="precargar" @focus="precargar">Reportes</RouterLink>
```

`ReportesView-....js` aparece en Network al pasar el cursor, no al hacer clic. El navegador lo guarda y no lo vuelve a pedir.

</details>

## Código final de los archivos que cambiaron

<details markdown="1">
<summary>src/router/index.js</summary>

```js
import { createRouter, createWebHistory } from 'vue-router'    // funciones del enrutador
import CatalogoView from '../views/CatalogoView.vue'            // la vista de entrada sí va en el paquete inicial

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),          // direcciones limpias, sin #; BASE_URL vale '/'
  routes: [
    { path: '/', component: CatalogoView },                     // se necesita al abrir la página
    { path: '/reportes', component: () => import('../views/ReportesView.vue') }, // se descarga al visitar la ruta
    { path: '/admin', component: () => import('../views/AdminView.vue') }        // igual: fragmento aparte
  ]
})
```

</details>

<details markdown="1">
<summary>vite.config.js</summary>

```js
import { fileURLToPath, URL } from 'node:url'                // convierte una dirección de archivo en ruta del disco
import { defineConfig } from 'vite'                          // ayuda para escribir la configuración
import vue from '@vitejs/plugin-vue'                         // enseña a Vite a leer archivos .vue
import vueDevTools from 'vite-plugin-vue-devtools'           // panel Vue DevTools (lo trajo create-vue)
import { visualizer } from 'rollup-plugin-visualizer'        // dibuja el mapa del paquete

const VUE = /node_modules[\\/](vue|@vue|vue-router)[\\/]/    // patrón: carpetas de Vue y de su enrutador

export default defineConfig(({ mode }) => ({                 // mode vale 'analisis' con npm run build:analisis
  plugins: [
    vue(),                                                   // plugin de Vue
    vueDevTools(),                                           // solo actúa con npm run dev: no entra en dist
    mode === 'analisis' && visualizer({                      // el mapa solo se genera si se pide
      filename: 'estadisticas.html',                         // archivo del mapa, en la carpeta del proyecto
      gzipSize: true                                         // muestra también el peso comprimido
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))  // '@' en un import significa la carpeta src
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {                                   // Vite la llama con la ruta de cada módulo
          if (!id.includes('node_modules')) return           // código propio: Vite decide solo
          if (VUE.test(id)) return 'vue'                     // Vue y el enrutador viajan juntos en vue-*.js
          return 'vendor'                                    // cualquier otra librería externa
        }
      }
    }
  }
}))
```

</details>

<details markdown="1">
<summary>src/views/CatalogoView.vue</summary>

```html
<script setup>
import { ref, shallowRef, computed, onMounted } from 'vue'           // funciones de Vue
import { pedirProductos } from '../datos/productos.js'               // la "API" de los datos
import ListaVirtual from '../components/ListaVirtual.vue'            // dibuja solo las filas que se ven

const productos = shallowRef([])                                     // lista grande: shallowRef (capítulo 1)
const cargando = ref(true)                                           // estado de la petición (capítulo 5)
const busqueda = ref('')                                             // texto del buscador
const nodos = ref(0)                                                 // elementos que tiene la página
const filas = ref(0)                                                 // filas de producto dibujadas

onMounted(async () => {                                              // al mostrarse la vista...
  productos.value = await pedirProductos()                           // ...espera la respuesta de la "API"
  cargando.value = false                                             // y apaga el aviso de carga
})

const filtrados = computed(() => {                                   // guarda el resultado; recalcula si cambian sus datos
  console.count('Cálculos del filtro')                               // suma 1 en la consola cada vez que se calcula
  performance.mark('filtro-inicio')                                  // marca: arranca el cronómetro
  const t = busqueda.value.trim().toLowerCase()                      // limpia el texto una sola vez
  const resultado = productos.value.filter((p) => p.nombre.toLowerCase().includes(t)) // deja los que coinciden
  performance.mark('filtro-fin')                                     // marca: para el cronómetro
  const m = performance.measure('filtro', 'filtro-inicio', 'filtro-fin') // mide el tramo entre las dos marcas
  console.log(`Filtro: ${m.duration.toFixed(2)} ms`)                 // muestra la duración con 2 decimales
  return resultado                                                   // la lista filtrada
})

function vender(id) {                                                // resta 1 al stock de un producto
  productos.value = productos.value.map((p) =>                       // shallowRef: se entrega una lista nueva...
    (p.id === id ? { ...p, stock: p.stock - 1 } : p))                // ...con un objeto nuevo solo para ese producto
}

function contarNodos() {                                             // cuenta lo que hay en la página
  nodos.value = document.querySelectorAll('*').length                // '*' significa todos los elementos
  filas.value = document.querySelectorAll('.fila').length            // solo las filas de producto
}
</script>

<template>
  <h1>Catálogo</h1>
  <label>Buscar producto <input v-model="busqueda" type="search" /></label>
  <button type="button" @click="contarNodos">Contar nodos</button>
  <!-- aria-live: el lector de pantalla anuncia el número cuando cambia -->
  <p aria-live="polite">Nodos en la página: {{ nodos }} - Filas dibujadas: {{ filas }}</p>
  <p v-if="cargando">Cargando productos...</p>
  <ListaVirtual v-else :productos="filtrados" @vender="vender" />
</template>
```

</details>

<details markdown="1">
<summary>src/components/ListaVirtual.vue</summary>

```html
<script setup>
import { computed, ref } from 'vue'                                  // funciones de Vue
import FilaProducto from './FilaProducto.vue'                        // cada fila sigue siendo su componente

const { productos } = defineProps({ productos: Array })             // lista completa, ya filtrada (reactiva: Vue 3.5)
const emit = defineEmits(['vender'])                                 // reenvía el aviso de cada fila
const ALTO = 56                                                      // alto de una fila en px: igual al CSS de la fila
const VENTANA = 560                                                  // alto de la caja visible: caben 10 filas
const RESERVA = 4                                                    // filas extra arriba y abajo para no ver huecos
const CUANTAS = VENTANA / ALTO + RESERVA * 2                         // 10 + 8 = 18 filas dibujadas
const scrollTop = ref(0)                                             // cuántos px ha bajado la persona

const inicio = computed(() =>                                        // primera fila que se dibuja
  Math.max(0, Math.floor(scrollTop.value / ALTO) - RESERVA))         // floor redondea abajo; max evita negativos
const visibles = computed(() =>                                      // solo este trozo llega a la página
  productos.slice(inicio.value, inicio.value + CUANTAS))             // slice corta sin tocar la lista original
const alto = computed(() => productos.length * ALTO + 'px')          // alto de TODAS las filas, para la barra
const mover = computed(() => `translateY(${inicio.value * ALTO}px)`) // baja las filas a su lugar

function alDesplazar(e) {                                            // corre en cada movimiento de la barra
  scrollTop.value = e.target.scrollTop                               // guarda cuánto se bajó
}
</script>

<template>
  <!-- tabindex="0": la caja recibe el foco y se desplaza con las flechas del teclado -->
  <div class="ventana" tabindex="0" @scroll="alDesplazar">
    <!-- el relleno da a la barra el tamaño de la lista entera -->
    <div class="relleno" :style="{ height: alto }">
      <div class="filas" :style="{ transform: mover }">
        <!-- v-memo: Vue salta la fila si precio y stock no cambiaron -->
        <FilaProducto
          v-for="p in visibles"
          :key="p.id"
          v-memo="[p.precio, p.stock]"
          :fila="p"
          @vender="emit('vender', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ventana { height: 560px; overflow-y: auto; border: 1px solid #ccc; }
.relleno { position: relative; }
.filas { position: absolute; top: 0; left: 0; right: 0; }
</style>
```

</details>

<details markdown="1">
<summary>src/components/FilaProducto.vue</summary>

```html
<script setup>
const { fila } = defineProps({ fila: Object })   // producto que recibe; desestructurar es reactivo desde Vue 3.5
const emit = defineEmits(['vender'])              // aviso que la fila le manda a quien la usa
</script>

<template>
  <article class="fila">
    <!-- v-once: la referencia se dibuja una sola vez, porque el id nunca cambia -->
    <small v-once>Ref. {{ fila.id }}</small>
    <strong>{{ fila.nombre }}</strong>
    <span>{{ fila.tipo }}</span>
    <span>{{ fila.precio }} USD</span>
    <span>Stock: {{ fila.stock }}</span>
    <button type="button" :aria-label="'Vender 1 de ' + fila.nombre" @click="emit('vender', fila.id)">Vender 1</button>
  </article>
</template>

<style scoped>
.fila { display: grid; grid-template-columns: 5rem 1fr 5rem 5rem 5rem 6rem; gap: 0.5rem; align-items: center;
  height: 56px; box-sizing: border-box; padding: 0 0.5rem; border-bottom: 1px solid #ddd; }
</style>
```

</details>

## Recursos

- [Rendimiento en Vue](https://vuejs.org/guide/best-practices/performance): técnicas oficiales, incluidas la lista virtual y `v-memo`.
- [v-memo](https://vuejs.org/api/built-in-directives#v-memo): la directiva y su riesgo.
- [Carga diferida de rutas](https://router.vuejs.org/guide/advanced/lazy-loading): `import()` en Vue Router.
- [Opciones de compilación de Vite](https://v6.vite.dev/config/build-options): `rollupOptions` y `manualChunks`.
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview): qué mide cada número.

## Control de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 2.0 | 2026-10-16 | Andrés Eduardo García Márquez | Guía reescrita: se construye desde una carpeta vacía con todo el código en la guía, sin repositorio inicial; 8 pasos de 46 minutos con predicción y resultado visible en cada uno |
| 2.1 | 2026-10-16 | Andrés Eduardo García Márquez | Validada por línea de comandos en Windows 11 y Linux: `npx --yes create-vite@6.4`; Node 20 o 22; vista Reportes recortada (131 líneas para copiar en el paso 1); explicación de `defineProps` desestructurado en Vue 3.5 y de `[\\/]`; `Ctrl + C` al cambiar de servidor; predicción de `v-memo` antes del resultado; tamaños reales del paquete y de Lighthouse; ejercicio básico con `onUpdated` (`onRenderTriggered` no informa el dato cuando el cambio llega por un `computed`); tiempos 5-9-7-2-6-4-6-2-5 |
| 2.2 | 2026-10-17 | Andrés Eduardo García Márquez | El proyecto se crea con create-vue, la herramienta oficial de Vue que enseñan los manuales: `npx --yes create-vue@3.16.4 catalogo-pro --bare --router` (Vue Router ya conectado; sale el `npm install vue-router` manual y el borrado de archivos de la plantilla); tabla de lo que trae el proyecto; `src/router/index.js` en lugar de `src/router.js`; `vite.config.js` conserva Vue DevTools y el atajo `@`; logotipo `public/favicon.ico` en el paso opcional; tamaños del paquete medidos de nuevo (96 kB antes; 93 kB de Vue y 6 kB propios después); dos filas nuevas en Problemas frecuentes. Validada por línea de comandos en Windows 11 y Linux |

<!-- {% endraw %} -->
