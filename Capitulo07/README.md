# Práctica 7.4: crear una estrategia de pruebas para una aplicación Vue

<!-- lang: es-CO -->
<!-- {% raw %} -->

| Campo | Valor |
|---|---|
| Duración | 46 minutos |
| Complejidad | Media |
| Nivel de Bloom | Crear |

## De qué trata

Vas a probar **Catálogo Pro**, un catálogo pequeño con buscador y favoritos, en los tres niveles de la pirámide: unitarias con Vitest, de componentes con Vue Test Utils y de extremo a extremo (E2E, *end to end*) con Cypress. Antes de escribir una sola prueba vas a dejar por escrito qué se prueba, en qué nivel y qué **no** se prueba. Construyes todo desde una carpeta vacía con **create-vue**, la herramienta oficial de Vue, que ya deja Vitest y Cypress instalados y configurados: no se clona ni se descarga material del curso; solo se instalan paquetes npm.

**Objetivo:** documentar una estrategia de pruebas basada en riesgos, niveles de prueba y criterios de exclusión, y comprobarla con pruebas automáticas.

**Resultado final, en la terminal:**

```text
npm run test:run       ->  Test Files  3 passed (3)   Tests 10 passed (10)
npm run test:coverage  ->  tabla de cobertura sin "ERROR: Coverage ... does not meet"
npm run test:e2e       ->  All specs passed!   3 pruebas aprobadas en Chrome
```

## Objetivos

Al terminar podrás:

- Escribir `docs/test-strategy.md` con pirámide, riesgos priorizados y pruebas excluidas.
- Completar la configuración de Vitest que trae create-vue con una preparación común y cobertura V8.
- Probar una función pura con tres casos: normal, borde y error.
- Probar un componente por lo que muestra y lo que avisa, con un doble del servicio de datos.
- Automatizar tres recorridos en Chrome con Cypress, datos fijos y sin esperas por tiempo.

## Conceptos que usas

| Concepto | Dónde lo viste |
|---|---|
| `ref`, `computed`, `inject`, `onMounted`, props y `emit` | Capítulos 1 a 3 |
| `fetch` con `async`/`await` y manejo de errores | Capítulo 5 |
| `computed` como memoización: guarda el resultado y lo reutiliza | Capítulo 6 (repaso de hoy) |
| Preparar, ejecutar y verificar; `describe`, `it`, `expect`, jsdom; dobles con `vi.fn()`, `mockResolvedValue` (promesa que se cumple), `mockRejectedValue` (promesa que falla) y `toHaveBeenCalledOnce` (se llamó una sola vez) | Tema 7.1 |
| `mount`, `get`, `trigger`, `setValue`, `emitted`, `flushPromises`, `global.provide`; `enableAutoUnmount`, que desmonta solo los componentes al final de cada prueba | Tema 7.2 |
| `cy.intercept`, fixtures, `data-cy`, `cy.wait('@alias')`, pirámide de pruebas | Tema 7.3 |

**Repaso del capítulo 6:** en el paso 5 el catálogo filtra con un `computed`. Es la misma memoización que usaste para no recalcular de más; hoy además sacas la lógica a una función pura para poder probarla sola.

## Antes de empezar

- **Node.js 24 LTS** (`node -v`; probado con 24.22.0 y 24.18.0) y npm (`npm -v`).
- **Google Chrome**, porque Cypress lo usará en el paso 7.
- Visual Studio Code con la extensión **Vue (Official)**.
- Unos 700 MB libres: Cypress descarga su programa la primera vez.

## Preparación (5 minutos)

1. Abre una terminal en la carpeta donde guardas tus prácticas y crea el proyecto con create-vue, versión fijada. Las opciones responden de antemano las preguntas del asistente: `--vitest` agrega las pruebas unitarias y de componentes, `--cypress` las E2E y `--bare` deja una aplicación mínima, sin páginas de ejemplo. Van sin el `--` que PowerShell se come, así que el comando es igual en Windows, macOS y Linux:

   ```bash
   npx --yes create-vue@3.16.4 lab07-pruebas --bare --vitest --cypress
   cd lab07-pruebas
   npm install
   ```

   `npm install` termina con `prepare` → `cypress install`: create-vue dejó ese script para que Cypress descargue su programa la primera vez: unos 600 MB, de uno a tres minutos con buena red y bastante más en un equipo lento. **Mientras termina, haz el paso 1**, que no usa la terminal. Si Cypress ya estaba, responde `Cypress 14.5.4 is installed`.

2. Agrega la medición de cobertura. Debe tener la misma versión que Vitest, así que fijas las dos (`-D`: solo para desarrollo; `-E`: versión exacta):

   ```bash
   npm install -D -E vitest@3.2.7 @vitest/coverage-v8@3.2.7
   ```

3. Abre la carpeta en VS Code (`code .`) y mira lo que trajo create-vue:

   | Archivo o carpeta | Qué es | Qué haces con él |
   |---|---|---|
   | `vite.config.js` | Vite con el plugin de Vue, las Vue DevTools y el alias `@` para `src` | Nada |
   | `vitest.config.js` | Vitest con jsdom, que reutiliza `vite.config.js` | Lo reemplazas en el paso 2 |
   | `src/__tests__/App.spec.js` | Prueba de ejemplo: busca "You did it!" en `App.vue` | Lo reemplazas en el paso 5 |
   | `src/main.js` y `src/App.vue` | Arranque y componente raíz mínimos | Los reemplazas en el paso 5 |
   | `cypress.config.js` | Cypress apuntando a `vite preview` en el puerto 4173 | Lo reemplazas en el paso 7 |
   | `cypress/e2e/example.cy.js` | E2E de ejemplo: también busca "You did it!" | Lo borras en el paso 7 |
   | `cypress/support/`, `cypress/fixtures/example.json`, `jsconfig.json`, `public/`, `.vscode/`, `README.md` | Preparación de Cypress, datos de ejemplo, ayuda para VS Code y documentación | Nada |

4. En `package.json`, reemplaza el bloque `"scripts"` completo por este. Conservas los nombres de create-vue (`test:unit`, `test:e2e`, `prepare`) y cambias el puerto y el navegador:

   ```json
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview --host 127.0.0.1 --port 4177 --strictPort",
     "test:unit": "vitest",
     "test:run": "vitest run",
     "test:coverage": "vitest run --coverage",
     "prepare": "cypress install",
     "cy:run": "cypress run --e2e --browser chrome",
     "test:e2e": "npm run build && start-server-and-test preview http://127.0.0.1:4177 cy:run"
   },
   ```

   | Script | Para qué |
   |---|---|
   | `test:unit` | Vitest en modo vigilancia: repite las pruebas cada vez que guardas |
   | `test:run` / `test:coverage` | Una sola pasada; la segunda mide la cobertura |
   | `preview` | Sirve la aplicación compilada en el puerto 4177, propio de este laboratorio para no chocar con otro `preview` abierto |
   | `prepare` | npm lo corre solo al final de cada `npm install`: descarga Cypress si falta |
   | `cy:run` | Cypress sin ventana, en Chrome; va en su propio script para no anidar comillas, que cada sistema trata distinto |
   | `test:e2e` | Compila y usa `start-server-and-test`: arranca `preview`, espera a que responda la URL, corre `cy:run` y apaga el servidor |

**Qué debes ver:** la instalación termina con `added ... packages` y sin `ERR!`.

## Paso 1. Escribir la estrategia antes que las pruebas (3 minutos)

**Qué vas a hacer y por qué:** una estrategia decide tres cosas: qué riesgos importan, en qué piso de la pirámide se prueba cada uno y qué no se prueba. Escribirlo primero evita probar "todo" y no cubrir lo importante.

**Dónde:** crea la carpeta `docs` en la raíz del proyecto, al lado de `package.json`, y dentro el archivo `docs/test-strategy.md`.

```md
# Estrategia de pruebas de Catálogo Pro

## Pirámide de pruebas

| Nivel | Proporción | Qué cubre | Herramienta |
|---|---:|---|---|
| Unitarias | 60 % | Funciones puras, como filtrarProductos | Vitest |
| Componentes | 30 % | Lo que un componente muestra y avisa | Vue Test Utils y jsdom |
| E2E | 10 % | Recorridos que no pueden fallar | Cypress en Chrome |

## Riesgos priorizados

| Riesgo | Impacto | Dónde se prueba |
|---|---|---|
| El filtro muestra productos equivocados | Alto | Unitaria y E2E |
| La estrella no marca o no desmarca el favorito | Alto | Componente y E2E |
| El servidor falla y la pantalla queda en blanco | Alto | Componente y E2E |

## Pruebas excluidas

- Comparar píxeles: se rompe con cada cambio de estilo.
- Medir rendimiento dentro de jsdom: jsdom no dibuja de verdad.
- Cada combinación de filtros en E2E: es lento y ya lo cubren las unitarias.
- El servidor real: las E2E responden con datos fijos.

## Criterios de calidad

- npm run test:run y npm run test:e2e en verde antes de entregar un cambio.
- Cobertura mínima: 80 % de líneas, funciones y sentencias; 75 % de ramas.
- Ninguna E2E espera un número fijo de milisegundos.
- Todo error corregido llega con una prueba que lo habría detectado.
```

**Hazlo tuyo (opcional, si te sobra tiempo al final):** agrega una fila a "Riesgos priorizados" y una línea a "Pruebas excluidas" pensando en un proyecto de tu trabajo.

**Qué debes ver:** el archivo con cuatro secciones: pirámide, riesgos, excluidas y criterios. Los pasos siguientes cumplen cada fila.

## Paso 2. Configurar Vitest y probar una función pura (7 minutos)

**Qué vas a hacer y por qué:** la lógica del filtro va en una función pura, sin Vue ni red. Es la base de la pirámide: la prueba más rápida y la que más se escribe.

1. Reemplaza todo `vitest.config.js`. Las líneas de create-vue quedan igual; las marcadas `NUEVO` agregan la preparación común y la cobertura:

   ```js
   import { fileURLToPath } from 'node:url'
   import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
   import viteConfig from './vite.config'

   export default mergeConfig(
     viteConfig,                                       // reutiliza plugins y alias de vite.config.js
     defineConfig({
       test: {                                         // todo lo de Vitest va aquí
         environment: 'jsdom',                         // navegador de mentira: crea window y document
         exclude: [...configDefaults.exclude, 'e2e/**'],
         root: fileURLToPath(new URL('./', import.meta.url)),
         setupFiles: ['./vitest.setup.js'],            // NUEVO: preparación que corre antes de cada archivo de pruebas
         coverage: {                                   // NUEVO: qué líneas ejecutaron las pruebas
           provider: 'v8',                             // la mide el motor V8 de Node.js
           reporter: ['text', 'html'],                 // tabla en la terminal y página en coverage/index.html
           include: ['src/**/*.{js,vue}'],             // el código de la aplicación
           exclude: ['src/main.js', 'src/api.js', 'src/__tests__/**'], // arranque, red y pruebas: no se miden
           thresholds: { lines: 80, functions: 80, statements: 80, branches: 75 } // mínimos de la estrategia
         }
       },
     }),
   )
   ```

   Vitest toma como prueba todo archivo `*.spec.js` o `*.test.js`; `configDefaults.exclude` ya deja fuera `node_modules` y la carpeta `cypress`, que corre aparte.

2. Crea en la raíz del proyecto `vitest.setup.js`:

   ```js
   import { afterEach } from 'vitest'                    // gancho que corre al final de cada prueba
   import { enableAutoUnmount } from '@vue/test-utils'  // desmontador automático de componentes

   enableAutoUnmount(afterEach)                          // tras cada prueba, quita lo que quedó montado
   ```

3. Crea `src/utils/filtrarProductos.js`:

   ```js
   // Función pura: con los mismos datos devuelve siempre el mismo resultado y no toca nada más.
   export function filtrarProductos(productos, texto) {
     if (!Array.isArray(productos)) {                        // ¿llegó algo que no es una lista?
       throw new TypeError('productos debe ser una lista')  // falla pronto y con un mensaje claro
     }
     const buscado = texto.trim().toLowerCase()              // quita espacios y pasa a minúsculas
     if (!buscado) return productos                          // sin texto: todos los productos
     return productos.filter((p) => p.nombre.toLowerCase().includes(buscado)) // solo los que lo contienen
   }
   ```

4. Crea la prueba en `src/__tests__/filtrarProductos.spec.js`, la carpeta de pruebas que trae create-vue:

   ```js
   import { describe, it, expect } from 'vitest'               // agrupar, declarar un caso y comprobar
   import { filtrarProductos } from '../utils/filtrarProductos.js' // la función que se prueba

   const productos = [                                         // datos fijos: siempre los mismos
     { id: 1, nombre: 'Mouse inalámbrico' },
     { id: 2, nombre: 'Teclado mecánico' },
     { id: 3, nombre: 'Monitor 4K' }
   ]

   describe('filtrarProductos', () => {
     it('devuelve los que contienen el texto, sin importar mayúsculas', () => { // caso normal
       const resultado = filtrarProductos(productos, 'MO')    // ejecutar: una sola acción
       expect(resultado.map((p) => p.id)).toEqual([1, 3])     // verificar: Mouse y Monitor
     })

     it('con texto vacío o solo espacios devuelve todos', () => { // caso borde
       expect(filtrarProductos(productos, '   ')).toHaveLength(3) // los tres productos
     })

     it('lanza un error claro si no recibe una lista', () => {  // caso de error
       expect(() => filtrarProductos(null, 'mo')).toThrow('productos debe ser una lista') // el mensaje exacto
     })
   })
   ```

5. **Predice:** ¿cuántas de las tres pruebas pasarán? Ejecuta:

   ```bash
   npm run test:run
   ```

**Qué debes ver:** tus tres pruebas y la de ejemplo de create-vue, que sigue pasando porque `App.vue` aún dice "You did it!":

```text
 ✓ src/__tests__/App.spec.js (1 test)
 ✓ src/__tests__/filtrarProductos.spec.js (3 tests)
 Test Files  2 passed (2)
      Tests  4 passed (4)
```

## Paso 3. Romperla a propósito y leer el error (3 minutos)

**Qué vas a hacer y por qué:** depurar empieza por leer bien el mensaje. Vas a meter un error real y seguir la pista que deja Vitest hasta la línea culpable.

1. Arranca Vitest en modo vigilancia y déjalo abierto:

   ```bash
   npm run test:unit
   ```

2. En `src/utils/filtrarProductos.js`, en la última línea, cambia `p.nombre.toLowerCase().includes(buscado)` por `p.nombre.includes(buscado)` y guarda.

3. **Predice:** ¿qué caso falla y qué lista recibirá?

**Qué debes ver:** Vitest repite solo las pruebas y marca en rojo el caso normal: `expected [] to deeply equal [ 1, 3 ]`, con el bloque `- Expected` y `+ Received`, la ubicación `❯ src/__tests__/filtrarProductos.spec.js:13:40` y un `^` debajo de la línea de `expect` que falló. Abajo queda `FAIL  Tests failed. Watching for file changes...`: sigue vigilando. "Mouse" empieza con mayúscula y ya no coincide con "mo".

4. Deshaz el cambio (`Ctrl + Z`) y guarda: vuelve a verde (`3 passed`: en vigilancia Vitest repite solo las pruebas del archivo que cambió). Pulsa `q` para salir del modo vigilancia.

## Paso 4. Probar un componente por lo que muestra y avisa (7 minutos)

**Qué vas a hacer y por qué:** la tarjeta recibe un producto y avisa `alternar` cuando pulsan la estrella. Eso es todo su contrato, y eso es lo que se prueba; no sus variables internas.

1. Crea `src/components/TarjetaProducto.vue`:

   ```html
   <script setup>
   defineProps({                                    // lo que entra desde el catálogo
     producto: { type: Object, required: true },    // { id, nombre, precio }
     favorito: { type: Boolean, default: false }    // true si el producto está marcado
   })
   const emit = defineEmits(['alternar'])           // lo que sale: el aviso alternar
   </script>

   <template>
     <article data-cy="tarjeta">                    <!-- data-cy: marca para la prueba E2E -->
       <h2>{{ producto.nombre }}</h2>               <!-- nombre del producto -->
       <p data-testid="precio">$ {{ producto.precio }}</p> <!-- data-testid: marca para la prueba de componente -->
       <button
         type="button"
         data-cy="favorito"
         :aria-pressed="favorito"
         :aria-label="(favorito ? 'Quitar de favoritos: ' : 'Marcar como favorito: ') + producto.nombre"
         @click="emit('alternar', producto.id)"
       >{{ favorito ? '★' : '☆' }}</button>        <!-- estrella llena o vacía -->
     </article>
   </template>
   ```

2. Crea `src/__tests__/TarjetaProducto.spec.js`:

   ```js
   import { describe, it, expect } from 'vitest'           // piezas de Vitest
   import { mount } from '@vue/test-utils'                 // monta el componente en el documento de jsdom
   import TarjetaProducto from '../components/TarjetaProducto.vue' // el componente que se prueba

   const base = { id: 7, nombre: 'Teclado', precio: 89900 } // producto de prueba
   const montar = (extra) =>                               // atajo: monta la tarjeta con la base...
     mount(TarjetaProducto, { props: { producto: base, ...extra } }) // ...y las props que cambien

   describe('TarjetaProducto', () => {
     it('muestra el nombre y el precio que recibe', () => {
       const wrapper = montar()                                       // preparar
       expect(wrapper.get('h2').text()).toBe('Teclado')               // ¿nombre?
       expect(wrapper.get('[data-testid="precio"]').text()).toBe('$ 89900') // ¿precio?
     })

     it('avisa alternar con el id al pulsar la estrella', async () => {
       const wrapper = montar()
       await wrapper.get('button').trigger('click')                   // clic y espera el redibujo
       expect(wrapper.emitted('alternar')).toEqual([[7]])             // un aviso, con el id 7
     })

     it('muestra la estrella llena cuando es favorito', () => {
       const boton = montar({ favorito: true }).get('button')         // la base, pero marcada
       expect(boton.text()).toBe('★')                                 // lo que ve la persona
       expect(boton.attributes('aria-pressed')).toBe('true')          // lo que oye el lector de pantalla
     })
   })
   ```

3. **Predice:** en la segunda prueba, ¿qué devuelve `emitted('alternar')` si la tarjeta avisara dos veces? Ejecuta:

   ```bash
   npm run test:run
   ```

**Qué debes ver:** `Test Files  3 passed (3)` y `Tests  7 passed (7)`. Ninguna prueba busca clases CSS: si mañana cambian los estilos, siguen en verde.

## Paso 5. El catálogo completo y su prueba con un doble (10 minutos)

**Qué vas a hacer y por qué:** el catálogo pide los productos a un servicio. La prueba no debe depender de la red, así que le entregas un **doble**: un servicio de mentira hecho con `vi.fn()` que responde lo que tú digas.

1. Crea los datos de ejemplo en `public/api/productos.json` (cópialo tal cual, no es el tema de hoy). Vite sirve la carpeta `public` tal como está:

   ```json
   [
     { "id": 1, "nombre": "Mouse inalámbrico", "precio": 49900 },
     { "id": 2, "nombre": "Teclado mecánico", "precio": 189900 },
     { "id": 3, "nombre": "Monitor 4K", "precio": 1299000 },
     { "id": 4, "nombre": "Cámara web", "precio": 159900 },
     { "id": 5, "nombre": "Audífonos", "precio": 99900 }
   ]
   ```

2. Crea el servicio real en `src/api.js`:

   ```js
   // Servicio real de datos. En las pruebas de componente se reemplaza por un doble.
   export const api = {
     async listarProductos() {                                      // devuelve la lista de productos
       const respuesta = await fetch('/api/productos.json')         // archivo que Vite sirve desde public/
       if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`) // un 404 o un 500 se vuelven error
       return respuesta.json()                                      // convierte el texto JSON en objetos
     }
   }
   ```

3. Reemplaza todo `src/main.js` para entregar el servicio con `provide`:

   ```js
   import { createApp } from 'vue'          // crea la aplicación
   import App from './App.vue'             // componente raíz
   import { api } from './api.js'          // servicio real de datos

   createApp(App).provide('api', api).mount('#app') // entrega el servicio a quien lo pida con inject
   ```

4. Reemplaza todo `src/App.vue`:

   ```html
   <script setup>
   import { ref, computed, inject, onMounted } from 'vue'          // herramientas de Vue que ya conoces
   import TarjetaProducto from './components/TarjetaProducto.vue'  // la tarjeta del paso 4
   import { filtrarProductos } from './utils/filtrarProductos.js'  // la función pura del paso 2

   const api = inject('api')        // servicio de datos: main.js entrega el real; la prueba, un doble
   const productos = ref([])        // lista que llega del servidor
   const texto = ref('')            // lo que se escribe en el buscador
   const favoritos = ref([])        // ids marcados con estrella
   const cargando = ref(true)       // true mientras llega la respuesta
   const error = ref('')            // mensaje si el servidor falla

   // computed guarda el resultado y solo lo recalcula si cambian productos o texto (memoización, capítulo 6)
   const visibles = computed(() => filtrarProductos(productos.value, texto.value))

   function alternar(id) {                            // marca o desmarca un favorito
     favoritos.value = favoritos.value.includes(id)   // ¿ya estaba marcado?
       ? favoritos.value.filter((f) => f !== id)      // sí: lo quita
       : [...favoritos.value, id]                     // no: lo agrega en una lista nueva
   }

   onMounted(async () => {                            // al aparecer en pantalla, pide los productos
     try {                                            // intenta...
       productos.value = await api.listarProductos()  // ...esperar la respuesta del servicio
     } catch {                                        // si la promesa falla...
       error.value = 'No se pudo cargar el catálogo.' // ...deja un aviso visible
     } finally {                                      // con o sin error...
       cargando.value = false                         // ...termina la espera
     }
   })
   </script>

   <template>
     <main>
       <h1>Catálogo Pro</h1>
       <label for="buscar">Buscar producto</label>               <!-- etiqueta unida al campo por for e id -->
       <input id="buscar" v-model="texto" data-cy="buscar" />     <!-- v-model: el campo y texto van juntos -->
       <p v-if="cargando" role="status">Cargando productos...</p> <!-- mientras llega la respuesta -->
       <p v-else-if="error" role="alert">{{ error }}</p>          <!-- role alert: el lector de pantalla lo anuncia -->
       <template v-else>                                          <!-- solo cuando hay datos -->
         <p data-cy="resumen">Favoritos: {{ favoritos.length }} de {{ productos.length }}</p>
         <p v-if="visibles.length === 0">No hay productos con ese nombre.</p>
         <ul>
           <li v-for="p in visibles" :key="p.id">                 <!-- una fila por producto visible -->
             <TarjetaProducto :producto="p" :favorito="favoritos.includes(p.id)" @alternar="alternar" />
           </li>
         </ul>
       </template>
     </main>
   </template>
   ```

5. Mira el catálogo funcionando. Arranca el servidor de desarrollo en el puerto 5177 (`npx vite` es el mismo Vite de `npm run dev` y recibe el puerto sin el `--` que PowerShell se come):

   ```bash
   npx vite --port 5177
   ```

   Abre `http://localhost:5177`, escribe "mo" en el buscador (quedan Mouse inalámbrico y Monitor 4K) y marca una estrella (el resumen pasa a `Favoritos: 1 de 5`). Luego detén el servidor con `Ctrl + C`.

6. Reemplaza todo `src/__tests__/App.spec.js`, la prueba de ejemplo de create-vue, por la del catálogo. La de ejemplo buscaba "You did it!", que ya no existe:

   ```js
   import { describe, it, expect, vi } from 'vitest'           // vi crea dobles
   import { mount, flushPromises } from '@vue/test-utils'     // flushPromises espera las promesas pendientes
   import App from '../App.vue'                                // el catálogo completo

   const productos = [                                         // lo que "responde" el servicio de mentira
     { id: 1, nombre: 'Mouse inalámbrico', precio: 49900 },
     { id: 2, nombre: 'Teclado mecánico', precio: 189900 }
   ]
   const montar = (api) => mount(App, { global: { provide: { api } } }) // entrega el doble como lo haría main.js

   describe('Catálogo', () => {
     it('pide los productos una vez y los muestra', async () => {
       const api = { listarProductos: vi.fn().mockResolvedValue(productos) } // doble que responde bien
       const wrapper = montar(api)
       expect(wrapper.text()).toContain('Cargando productos...') // antes de la respuesta
       await flushPromises()                                     // espera la causa: la respuesta
       expect(api.listarProductos).toHaveBeenCalledOnce()        // pidió una sola vez
       expect(wrapper.findAll('li')).toHaveLength(2)             // y dibujó dos filas
     })

     it('filtra con lo que escribe la persona', async () => {
       const wrapper = montar({ listarProductos: vi.fn().mockResolvedValue(productos) })
       await flushPromises()
       await wrapper.get('#buscar').setValue('tecla')            // escribe en el campo y espera
       expect(wrapper.findAll('li')).toHaveLength(1)             // solo el teclado
       await wrapper.get('#buscar').setValue('zzz')              // un texto que nadie tiene
       expect(wrapper.text()).toContain('No hay productos con ese nombre.')
     })

     it('marca y desmarca un favorito y actualiza el resumen', async () => {
       const wrapper = montar({ listarProductos: vi.fn().mockResolvedValue(productos) })
       await flushPromises()
       await wrapper.get('button').trigger('click')              // marca el primero
       expect(wrapper.get('[data-cy="resumen"]').text()).toBe('Favoritos: 1 de 2')
       await wrapper.get('button').trigger('click')              // lo desmarca
       expect(wrapper.get('[data-cy="resumen"]').text()).toBe('Favoritos: 0 de 2')
     })

     it('muestra un aviso si el servidor falla', async () => {
       const api = { listarProductos: vi.fn().mockRejectedValue(new Error('HTTP 500')) } // doble que falla
       const wrapper = montar(api)
       await flushPromises()
       expect(wrapper.get('[role="alert"]').text()).toBe('No se pudo cargar el catálogo.')
     })
   })
   ```

7. **Predice:** si quitaras la línea `await flushPromises()` de la primera prueba, ¿qué fallaría? (Respuesta: la cuenta de filas, porque la lista aún está vacía mientras la respuesta no llega.) Ejecuta:

   ```bash
   npm run test:run
   ```

**Qué debes ver:** `Test Files  3 passed (3)` y `Tests  10 passed (10)`, en pocos segundos y sin abrir ningún navegador. Sin la prueba del favorito, `alternar` quedaría sin ejecutar y la cobertura de funciones del paso 6 bajaría a 75 %, por debajo del mínimo de la estrategia.

## Paso 6. Medir la cobertura (3 minutos)

**Qué vas a hacer y por qué:** la cobertura dice qué líneas ejecutaron las pruebas. Sirve para encontrar zonas que nadie tocó, no como meta: una línea ejecutada no es una línea comprobada.

```bash
npm run test:coverage
```

**Qué debes ver:** una tabla con `App.vue`, `TarjetaProducto.vue` y `filtrarProductos.js`, con `All files` en 100 % de líneas, ramas y funciones, y ningún mensaje `ERROR: Coverage for ... does not meet global threshold`. El detalle línea por línea queda en `coverage/index.html`: ábrelo en Chrome y busca las líneas en rojo.

`main.js` y `api.js` no aparecen: se excluyeron en `vitest.config.js` porque solo arrancan la aplicación y llaman a la red, y eso lo prueba la E2E del paso 7. Es el mismo criterio de exclusión de tu estrategia.

## Paso 7. Tres recorridos E2E con Cypress (8 minutos)

**Qué vas a hacer y por qué:** arriba de la pirámide van pocas pruebas, en un navegador real, para los recorridos que no pueden fallar. Cypress responde por el servidor con datos fijos (`cy.intercept`), así la prueba da el mismo resultado hoy y mañana.

1. Reemplaza todo `cypress.config.js`. create-vue apuntaba al puerto 4173 de `vite preview`; ahora apunta al 4177 del script `preview`:

   ```js
   import { defineConfig } from 'cypress'

   export default defineConfig({
     e2e: {
       specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}', // qué archivos son pruebas E2E
       baseUrl: 'http://127.0.0.1:4177',               // CAMBIA: la aplicación compilada en el puerto del laboratorio
       video: false                                    // NUEVO: no graba video, termina antes
     },
   })
   ```

2. Borra la E2E de ejemplo, que busca "You did it!" y ya fallaría. En el explorador de VS Code: clic derecho sobre `cypress/e2e/example.cy.js` y **Eliminar**. Si prefieres la terminal, este comando sirve igual en Windows, macOS y Linux:

   ```bash
   node -e "require('fs').rmSync('cypress/e2e/example.cy.js')"
   ```

3. Crea los datos fijos en `cypress/fixtures/productos.json`. Son tres productos, no los cinco de `public/api`:

   ```json
   [
     { "id": 1, "nombre": "Mouse inalámbrico", "precio": 49900 },
     { "id": 2, "nombre": "Teclado mecánico", "precio": 189900 },
     { "id": 3, "nombre": "Monitor 4K", "precio": 1299000 }
   ]
   ```

4. Crea `cypress/e2e/catalogo.cy.js`:

   ```js
   // Abre el catálogo y responde por el servidor con lo que diga cada prueba
   function abrirCatalogo(respuesta) {
     cy.intercept('GET', '**/api/productos.json', respuesta).as('productos') // atrapa la petición
     cy.visit('/')                                 // abre la página: la intercepción quedó registrada antes
     cy.wait('@productos')                         // espera la causa, nunca un número de segundos
   }

   describe('Catálogo Pro en Chrome', () => {
     it('carga el catálogo y filtra por nombre', () => {
       abrirCatalogo({ fixture: 'productos.json' })                  // responde con los datos fijos
       cy.get('[data-cy="tarjeta"]').should('have.length', 3)        // los 3 de la fixture
       cy.get('[data-cy="buscar"]').type('mouse')                    // escribe como una persona
       cy.get('[data-cy="tarjeta"]').should('have.length', 1).and('contain', 'Mouse inalámbrico')
     })

     it('marca y desmarca un favorito', () => {
       abrirCatalogo({ fixture: 'productos.json' })
       cy.get('[data-cy="favorito"]').first().click().should('have.attr', 'aria-pressed', 'true')
       cy.get('[data-cy="resumen"]').should('have.text', 'Favoritos: 1 de 3')
       cy.get('[data-cy="favorito"]').first().click().should('have.attr', 'aria-pressed', 'false')
       cy.get('[data-cy="resumen"]').should('have.text', 'Favoritos: 0 de 3')
     })

     it('avisa cuando el servidor falla', () => {
       abrirCatalogo({ statusCode: 500, body: {} })                   // el servidor responde con error
       cy.get('[role="alert"]').should('have.text', 'No se pudo cargar el catálogo.')
     })
   })
   ```

5. **Predice:** en la primera prueba, ¿cuántas tarjetas verá Cypress, 5 o 3? Ejecuta:

   ```bash
   npm run test:e2e
   ```

**Qué debes ver:** la compilación, el aviso de `preview` en `http://127.0.0.1:4177` y, al final:

```text
  Catálogo Pro en Chrome
    ✓ carga el catálogo y filtra por nombre
    ✓ marca y desmarca un favorito
    ✓ avisa cuando el servidor falla
  3 passing
  ✔  All specs passed!
```

Son 3 tarjetas: Cypress atrapó la petición y respondió con la fixture. Busca en el archivo: no hay ningún `cy.wait` con un número.

### Opcional (3 minutos): depurar con la ventana de Cypress

1. En una terminal, `npm run build` y luego `npm run preview`. En otra terminal, `npx cypress open`.
2. Elige **E2E Testing**, Chrome y `catalogo.cy.js`. Pasa el ratón por cada paso del panel izquierdo: Cypress muestra la página como estaba en ese momento.
3. Agrega `cy.pause()` después de `abrirCatalogo(...)` en la segunda prueba, guarda y usa el botón de avanzar paso a paso. Al terminar, quítalo y cierra ambas terminales con `Ctrl + C`.

## Resultado esperado

- `docs/test-strategy.md` con pirámide, riesgos y exclusiones.
- `npm run test:run`: 10 pruebas unitarias y de componentes en verde.
- `npm run test:coverage`: reporte V8 con 80 % de líneas o más.
- `npm run test:e2e`: tres recorridos de Cypress aprobados en Chrome.

<details markdown="1">
<summary>Código final de <code>package.json</code> (lo cambiaron el punto 2 y el punto 4 de la preparación)</summary>

```json
{
  "name": "lab07-pruebas",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --host 127.0.0.1 --port 4177 --strictPort",
    "test:unit": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "prepare": "cypress install",
    "cy:run": "cypress run --e2e --browser chrome",
    "test:e2e": "npm run build && start-server-and-test preview http://127.0.0.1:4177 cy:run"
  },
  "dependencies": {
    "vue": "^3.5.13"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.3",
    "@vitest/coverage-v8": "3.2.7",
    "@vue/test-utils": "^2.4.6",
    "cypress": "^14.2.1",
    "jsdom": "^26.0.0",
    "start-server-and-test": "^2.0.11",
    "vite": "^6.2.4",
    "vite-plugin-vue-devtools": "^7.7.2",
    "vitest": "3.2.7"
  }
}
```

Los demás archivos se escriben una sola vez y completos: el bloque de cada paso ya es su versión final. En `ejercicio-resuelto/` también están los archivos de create-vue que la guía no toca (`vite.config.js`, `jsconfig.json`, `cypress/support/`, `cypress/fixtures/example.json`, `.vscode/` y el `README.md` en inglés).

</details>

## Laboratorio resuelto

La carpeta [`ejercicio-resuelto/`](https://github.com/netec-mx/VUE_INT/tree/main/Capitulo07/ejercicio-resuelto) de este capítulo tiene el proyecto terminado, igual al que construyes con esta guía. Úsalo para comparar al final o si te atascas: lo que se aprende está en escribirlo tú.

```bash
cd ejercicio-resuelto
npm install              # instala las dependencias
npx vite --port 5177     # arranca la aplicación en http://localhost:5177
npm run test:run         # corre las pruebas unitarias y de componentes
```

## Problemas frecuentes

| Lo que ves | Por qué pasa | Cómo se arregla |
|---|---|---|
| El creador pregunta `Select features to include in your project` en vez de crear el proyecto | Faltan las opciones, o se escribieron después de un `--` que PowerShell se come (`npm create vue@latest lab07-pruebas -- --vitest`) | Pulsa `Ctrl + C` y usa el comando de la guía: `npx --yes create-vue@3.16.4 lab07-pruebas --bare --vitest --cypress` |
| `npm warn EBADENGINE Unsupported engine` al crear el proyecto | Se usó `npm create vue@latest`: las versiones más nuevas de create-vue exigen Node.js 22.18 o superior y crean el proyecto con Vite 7 | Usa la versión fijada de la guía, `create-vue@3.16.4`, que funciona desde Node.js 20 |
| La terminal muestra `Local: http://localhost:5173/` y no 5177 | Se usó `npm run dev -- --port 5177` en PowerShell, que se come el `--` | Detén el servidor con `Ctrl + C` y usa `npx vite --port 5177` |
| `ReferenceError: document is not defined` | Vitest corre sin jsdom | Revisa que `vitest.config.js` conserve `environment: 'jsdom'` |
| `MISSING DEPENDENCY  Cannot find dependency '@vitest/coverage-v8'` o aviso de versiones distintas | Falta el punto 2 de la preparación, o Vitest y la cobertura quedaron en versiones diferentes | Repite `npm install -D -E vitest@3.2.7 @vitest/coverage-v8@3.2.7` |
| `AssertionError: expected '...' to contain 'You did it!'` | Quedó la prueba de ejemplo de create-vue | Reemplaza `src/__tests__/App.spec.js` con el del paso 5 |
| `ERROR: Coverage for lines (...)` o `for functions (75%) does not meet global threshold (80%)` | Hay código que ninguna prueba ejecuta: por ejemplo, falta la prueba del favorito en `App.spec.js` y `alternar` nunca corre | Abre `coverage/index.html`, mira qué archivo baja el promedio y pruébalo o bórralo si sobra |
| `Can't run because no spec files were found` o falla `My First Test` | Se borró la E2E del catálogo, o quedó `example.cy.js` | Revisa el paso 7: debe existir solo `cypress/e2e/catalogo.cy.js` |
| `No version of Cypress is installed` o `the Cypress binary is missing` | La descarga de Cypress no terminó | Ejecuta `npx cypress install` y repite `npm run test:e2e` |
| `Browser: chrome was not found on your system` | Chrome no está instalado | Instálalo, o quita `--browser chrome` del script `cy:run` para usar el navegador de Cypress |
| `cy.wait() timed out waiting ... for the 1st request to the route: productos` | La dirección interceptada no coincide con la real | Corre el opcional `npx cypress open` y mira la petición en el panel de comandos, o abre `npm run preview` en Chrome con `F12`, pestaña **Network** (Red), y compara la dirección con `**/api/productos.json` |
| `Port 4177 is already in use` | Quedó abierto un `preview` | Ciérralo con `Ctrl + C` en su terminal y repite |

## Limpieza

- Detén con `Ctrl + C` cualquier `npx vite`, `npm run test:unit` o `npm run preview` que siga abierto. `npm run test:e2e` apaga solo su servidor.
- Para recuperar espacio, borra la carpeta `coverage` (y `node_modules` si no vas a volver al proyecto). El capítulo 8 arranca en otra carpeta vacía y trae su propio código.

## Ejercicios de reserva

**Básico.** Agrega a `src/__tests__/filtrarProductos.spec.js` un caso que compruebe que `'  monitor  '`, con espacios alrededor, encuentra solo el producto 3.

<details markdown="1">
<summary>Solución</summary>

```js
it('ignora los espacios alrededor del texto', () => {               // otro caso borde
  expect(filtrarProductos(productos, '  monitor  ').map((p) => p.id)).toEqual([3]) // solo el Monitor
})
```

</details>

**Medio.** Prueba que la tarjeta marcada como favorito anuncia al lector de pantalla "Quitar de favoritos: Teclado".

<details markdown="1">
<summary>Solución</summary>

```js
it('anuncia la acción correcta al lector de pantalla', () => {
  const boton = montar({ favorito: true }).get('button')                     // tarjeta marcada
  expect(boton.attributes('aria-label')).toBe('Quitar de favoritos: Teclado') // texto que se oye
})
```

</details>

**Avanzado.** Agrega una E2E que escriba "zzz" y compruebe el mensaje "No hay productos con ese nombre.". Agrega primero `data-cy="vacio"` a ese párrafo en `App.vue`.

<details markdown="1">
<summary>Solución</summary>

```js
it('avisa cuando ningún producto coincide', () => {
  abrirCatalogo({ fixture: 'productos.json' })                     // mismos datos fijos
  cy.get('[data-cy="buscar"]').type('zzz')                         // texto que nadie tiene
  cy.get('[data-cy="tarjeta"]').should('not.exist')                // no queda ninguna tarjeta
  cy.get('[data-cy="vacio"]').should('have.text', 'No hay productos con ese nombre.')
})
```

</details>

## Recursos

- [Guía de inicio de Vitest](https://vitest.dev/guide/): instalación y primera prueba.
- [Cobertura en Vitest](https://vitest.dev/guide/coverage.html): proveedor V8, umbrales y reportes.
- [Vue Test Utils](https://test-utils.vuejs.org/): montar y revisar componentes.
- [Documentación de Cypress](https://docs.cypress.io/): `cy.intercept`, fixtures y depuración.
- [Pruebas en Vue](https://vuejs.org/guide/scaling-up/testing.html): qué nivel usar para cada cosa.

## Control de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 2.0 | 2026-10-16 | Andrés Eduardo García Márquez | Guía reescrita para construir desde una carpeta vacía con Vite 6.4: estrategia de pruebas, Vitest, Vue Test Utils y Cypress con todo el código en la guía |
| 2.1 | 2026-10-16 | Andrés Eduardo García Márquez | Validada por CLI (interfaz de línea de comandos) en Windows 11 (PowerShell) y Linux: proyecto con `npx --yes create-vite@6.4.1`, servidor con `npx vite --port 5177` y `preview` en el puerto propio 4177; `npx cypress install` explícito; prueba nueva del favorito en `App.test.js` (sin ella la cobertura de funciones quedaba en 75 %); borrado de `HelloWorld.vue` igual en los tres sistemas; mensaje real de Vitest en el paso 3; conceptos `enableAutoUnmount`, `mockResolvedValue`, `mockRejectedValue`, `toHaveBeenCalledOnce` y `start-server-and-test`; tiempos 3 y 10 minutos en los pasos 1 y 5; el capítulo 8 ya no depende de este proyecto |
| 2.2 | 2026-10-17 | Andrés Eduardo García Márquez | Proyecto creado con create-vue, la herramienta oficial de Vue, como enseña el manual: `npx --yes create-vue@3.16.4 lab07-pruebas --bare --vitest --cypress`; tabla de lo que trae el proyecto y qué se reemplaza o borra; configuración de pruebas en `vitest.config.js` y pruebas en `src/__tests__/*.spec.js`; scripts con los nombres de create-vue (`test:unit`, `test:e2e`, `prepare`); solo `@vitest/coverage-v8` se instala aparte; ya no se borra `HelloWorld.vue` ni se importa `style.css`. Validada por CLI en Windows 11 con Cypress real y en Linux |

<!-- {% endraw %} -->
