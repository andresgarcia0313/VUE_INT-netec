# Práctica 1.4: diagnóstico y optimización de dibujos en una SPA

<!-- lang: es-CO -->
<!-- {% raw %} -->

| Campo | Valor |
|---|---|
| Duración | 24 minutos |
| Complejidad | Media |
| Nivel de Bloom | Aplicar |

## De qué trata

Vas a construir y medir una SPA (aplicación de una sola página) que trabaja de más, y a mejorarla con tres herramientas de Vue: `computed`, props y `shallowRef`. Es un catálogo de 12 productos con un panel que cuenta cuántas veces Vue vuelve a dibujar cada parte. Al marcar un favorito, al principio se redibujan las 12 tarjetas; al terminar, solo 1. No se trata de que "se sienta" más rápida: vas a ver el número antes y después.


## Objetivos

- Identificar, con números, qué cambio provoca dibujos innecesarios.
- Reemplazar un cálculo repetido en la plantilla por un `computed`.
- Pasar a un componente solo lo que necesita por props, para que no se redibuje cuando cambia lo demás.
- Usar `shallowRef` en una lista grande y agregar elementos sin que la pantalla se quede quieta.

## Conceptos que usas

Repaso de Vue básico: `ref`, `v-for` con `:key`, `v-model`, props y eventos (`defineProps`, `defineEmits`). Del capítulo 1: `computed` y el hook `onUpdated` (tema 1.2), `provide`/`inject` y `shallowRef` (tema 1.3).

## Antes de empezar

- **Node.js 20, 22 o 24** (el programa que ejecuta JavaScript fuera del navegador). Compruébalo con `node -v`. La guía se validó con 24.22.0, la versión LTS (Long Term Support, con soporte extendido) vigente.
- Google Chrome y Visual Studio Code. Si VS Code ofrece la extensión **Vue (Official)**, acéptala: colorea los archivos `.vue`.
- No descargas nada más: el proyecto se crea desde cero en una carpeta vacía.

## Preparación (4 minutos)

1. Abre una terminal en una carpeta tuya para el curso (por ejemplo, `labs-vue` en Documentos) y crea el proyecto con create-vue, la herramienta oficial de Vue (la misma de `npm create vue@latest` del capítulo 0), en una versión fija. El comando es igual en Windows (PowerShell), macOS y Linux:

   ```bash
   npx --yes create-vue@3.16.4 catalogo --default --bare
   cd catalogo
   npm install
   ```

   `--yes` acepta descargar el creador sin preguntar. `--default` responde "No" a todas las opciones (TypeScript, Router, Pinia, pruebas), porque este laboratorio no las necesita, y `--bare` deja un proyecto mínimo, sin componentes de ejemplo. Escribe las opciones sin `--` delante del nombre: PowerShell se lo come. Al terminar, create-vue sugiere `npm run dev`: no lo ejecutes todavía; en el paso 1.5 arrancas el servidor con el puerto propio del laboratorio. `npm install` puede tardar un par de minutos.

2. Abre la carpeta `catalogo` en VS Code y mira qué trae: `index.html` (la página con `<div id="app">`), `vite.config.js` (Vite 6 con el atajo `@` hacia `src` y las Vue DevTools, el panel de depuración que aparece como un botón flotante abajo de la página), `jsconfig.json`, `public/favicon.ico`, `.vscode/`, `.gitignore`, `README.md`, y en `src` solo `main.js` y `App.vue`. No borras ninguno y `vite.config.js` no lo cambias.

3. En `index.html`, cambia `<html lang="">` por `<html lang="es">` (así el lector de pantalla lee en español) y `<title>Vite App</title>` por `<title>Catálogo - Laboratorio 1</title>`.

**Qué debes ver:** `npm install` termina con `added ... packages` y sin errores en rojo.

## Paso 1. Construir el catálogo de partida (8 minutos)

**Qué vas a hacer y por qué:** armas el catálogo tal como lo escribiría alguien con prisa. Funciona, pero trabaja de más; en los pasos siguientes lo vas a medir y corregir.

1. Cuatro archivos de apoyo. **Cópialos tal cual, no son el tema de hoy.** Reemplaza todo `src/main.js` (el de create-vue no carga estilos ni activa la medición) y crea `src/style.css`, `src/datos.js` y `src/medicion.js`:

   `src/style.css`

   ```css
   /* Estilos con buen contraste y foco visible para el teclado. Cópialo tal cual, no es el tema de hoy */
   :root { font-family: system-ui, sans-serif; color: #1d1d1f; background: #f5f5f7; }
   body { margin: 0; }
   button { font: inherit; padding: 0.4rem 0.8rem; border: 1px solid #0058b0; border-radius: 8px; background: #0066cc; color: #fff; cursor: pointer; }
   button:focus-visible, input:focus-visible { outline: 3px solid #ff9f0a; outline-offset: 2px; }
   input { font: inherit; display: block; margin: 0.3rem 0 0.8rem; padding: 0.5rem; border: 1px solid #86868b; border-radius: 8px; width: min(22rem, 100%); }
   .encabezado { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background: #fff; border-bottom: 1px solid #d2d2d7; }
   .encabezado h1 { margin: 0; font-size: 1.4rem; }
   .contenido { display: grid; grid-template-columns: 1fr 15rem; gap: 1.5rem; padding: 1.5rem; align-items: start; }
   @media (max-width: 40rem) { .contenido { grid-template-columns: 1fr; } }
   .lista { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr)); gap: 0.8rem; }
   .tarjeta, .medicion { position: relative; background: #fff; border: 1px solid #d2d2d7; border-radius: 12px; padding: 0.8rem; }
   .tarjeta h2 { font-size: 1rem; margin: 0 2rem 0.3rem 0; }
   .estrella { position: absolute; top: 0.5rem; right: 0.5rem; padding: 0.1rem 0.45rem; background: #fff; color: #b25000; border-color: #d2d2d7; font-size: 1.2rem; }
   .medicion dl div { display: flex; justify-content: space-between; padding: 0.3rem 0; border-bottom: 1px solid #e8e8ed; }
   .medicion dd { margin: 0; font-weight: 700; }
   ```

   `src/main.js`

   ```js
   // Punto de entrada: crea la aplicación y la dibuja en la página
   import { createApp } from 'vue'              // función que crea una aplicación Vue
   import App from './App.vue'                  // componente principal
   import './style.css'                         // estilos de toda la aplicación

   const app = createApp(App)                   // crea la aplicación con el componente principal
   app.config.performance = true                // deja que Chrome mida cada dibujo (pestaña Rendimiento)
   app.mount('#app')                            // la dibuja dentro de <div id="app"> de index.html
   ```

   `src/datos.js`

   ```js
   // Los 12 productos del catálogo. En una aplicación real llegarían del servidor. Cópialo tal cual.
   export const productosIniciales = [
     { id: 1, nombre: 'Cámara web', precio: 180000 }, { id: 2, nombre: 'Teclado', precio: 150000 },
     { id: 3, nombre: 'Mouse inalámbrico', precio: 90000 }, { id: 4, nombre: 'Monitor 24 pulgadas', precio: 720000 },
     { id: 5, nombre: 'Audífonos', precio: 210000 }, { id: 6, nombre: 'Micrófono', precio: 260000 },
     { id: 7, nombre: 'Base para portátil', precio: 85000 }, { id: 8, nombre: 'Disco externo', precio: 340000 },
     { id: 9, nombre: 'Memoria USB', precio: 45000 }, { id: 10, nombre: 'Lámpara de escritorio', precio: 120000 },
     { id: 11, nombre: 'Silla ergonómica', precio: 950000 }, { id: 12, nombre: 'Cable HDMI', precio: 30000 }
   ]
   ```

   `src/medicion.js`

   ```js
   // Contadores de dibujos: cuántas veces Vue vuelve a dibujar cada parte. Cópialo tal cual.
   import { reactive } from 'vue'

   const cuentas = { tarjetas: 0, lista: 0, filtro: 0 }  // números de trabajo, sin vigilancia de Vue
   export const dibujos = reactive({ ...cuentas })       // copia vigilada que se ve en pantalla

   export function contar(nombre) {                      // suma 1 al contador indicado
     cuentas[nombre]++
     queueMicrotask(() => { dibujos[nombre] = cuentas[nombre] }) // pinta un instante después: medir no causa dibujos extra
   }

   export function reiniciar() {                         // pone todo en cero antes de medir
     for (const nombre in cuentas) { cuentas[nombre] = 0; dibujos[nombre] = 0 }
   }
   ```

2. Reemplaza todo `src/App.vue`. Guarda los productos y los favoritos, y los comparte con `provide`:

   ```html
   <script setup>
   // Componente principal: guarda los datos del catálogo y los comparte con provide
   import { ref, provide } from 'vue'                    // ref crea datos vigilados; provide los comparte
   import { productosIniciales } from './datos.js'       // los 12 productos de ejemplo
   import { dibujos, reiniciar } from './medicion.js'    // contadores del panel
   import ListaProductos from './components/ListaProductos.vue'

   const productos = ref([...productosIniciales])        // copia de la lista (Vue vigila cada producto por dentro)
   const favoritos = ref([])                             // ids de los productos marcados con estrella

   function alternarFavorito(id) {                       // marca o desmarca un producto
     const posicion = favoritos.value.indexOf(id)        // busca el id; -1 si no está
     if (posicion === -1) favoritos.value.push(id)       // no estaba: lo agrega
     else favoritos.value.splice(posicion, 1)            // ya estaba: lo quita
   }

   let siguienteId = 13                                  // número del próximo producto de prueba
   function agregarProducto() {
     const nuevo = { id: siguienteId, nombre: 'Producto nuevo ' + siguienteId, precio: 50000 }
     siguienteId++                                       // el siguiente tendrá otro número
     productos.value.push(nuevo)                         // lo agrega al final de la lista
   }

   provide('catalogo', { productos, favoritos, alternarFavorito }) // comparte con todos los componentes de abajo
   </script>

   <template>
     <header class="encabezado">
       <h1>Catálogo de accesorios</h1>
       <button type="button" @click="agregarProducto">Agregar producto de prueba</button>
     </header>
     <main class="contenido">
       <section><ListaProductos /></section>
       <!-- Panel de medición: cópialo tal cual, no es el tema de hoy -->
       <aside class="medicion" aria-live="polite">
         <h2>Medición</h2>
         <dl>
           <div><dt>Dibujos de tarjetas</dt><dd data-prueba="tarjetas">{{ dibujos.tarjetas }}</dd></div>
           <div><dt>Dibujos de la lista</dt><dd data-prueba="lista">{{ dibujos.lista }}</dd></div>
           <div><dt>Cálculos del filtro</dt><dd data-prueba="filtro">{{ dibujos.filtro }}</dd></div>
         </dl>
         <button type="button" @click="reiniciar">Reiniciar contadores</button>
       </aside>
     </main>
   </template>
   ```

3. Crea `src/components/ListaProductos.vue`. La carpeta `components` todavía no existe: créala dentro de `src` (en VS Code, si escribes `components/ListaProductos.vue` como nombre del archivo nuevo, la crea sola). La búsqueda vive aquí porque solo la lista la usa:

   ```html
   <script setup>
   // Lista: buscador y una tarjeta por producto
   import { ref, inject, onUpdated } from 'vue'          // onUpdated avisa después de cada redibujo
   import TarjetaProducto from './TarjetaProducto.vue'
   import { contar } from '../medicion.js'               // contadores del panel

   const { productos, favoritos } = inject('catalogo')  // recibe lo que App compartió con provide
   const consulta = ref('')                              // texto del buscador: solo lo usa la lista

   function filtrar() {                                  // productos cuyo nombre contiene el texto buscado
     contar('filtro')                                    // cuenta cada cálculo del filtro
     const texto = consulta.value.trim().toLowerCase()   // trim quita espacios a los lados; toLowerCase pasa a minúsculas
     if (!texto) return productos.value                  // sin texto: todos los productos
     return productos.value.filter((p) => p.nombre.toLowerCase().includes(texto))
   }

   onUpdated(() => contar('lista'))                      // cuenta cada vez que la lista se vuelve a dibujar
   </script>

   <template>
     <label for="buscar">Buscar producto</label>
     <!-- v-model une la caja de texto con consulta: lo que escribes la cambia -->
     <input id="buscar" v-model="consulta" type="search" placeholder="Ejemplo: cable" />
     <p>Favoritos: {{ favoritos.length }} de {{ productos.length }} productos</p>
     <ul class="lista">
       <!-- filtrar() se ejecuta otra vez cada vez que la lista se dibuja -->
       <li v-for="producto in filtrar()" :key="producto.id">
         <TarjetaProducto :producto="producto" />
       </li>
     </ul>
   </template>
   ```

4. Crea `src/components/TarjetaProducto.vue`. Cada tarjeta toma con `inject` la lista **completa** de favoritos:

   ```html
   <script setup>
   // Tarjeta de un producto: muestra nombre, precio y la estrella de favorito
   import { inject, onUpdated } from 'vue'
   import { contar } from '../medicion.js'               // contadores del panel

   const props = defineProps({ producto: Object })       // el producto llega desde la lista
   const { favoritos, alternarFavorito } = inject('catalogo') // la tarjeta toma TODOS los favoritos

   function esFavorito() {                               // ¿este producto está en favoritos?
     return favoritos.value.includes(props.producto.id)  // lee la lista completa de favoritos
   }

   onUpdated(() => contar('tarjetas'))                   // cuenta cada vez que una tarjeta se redibuja
   </script>

   <template>
     <article class="tarjeta">
       <h2>{{ producto.nombre }}</h2>
       <p>{{ producto.precio.toLocaleString('es-CO') }} pesos</p>
       <!-- aria-pressed y aria-label le dicen al lector de pantalla si está marcada y de qué producto es -->
       <button
         type="button"
         class="estrella"
         :aria-pressed="esFavorito()"
         :aria-label="(esFavorito() ? 'Quitar de favoritos: ' : 'Marcar como favorito: ') + producto.nombre"
         @click="alternarFavorito(producto.id)"
       >{{ esFavorito() ? '★' : '☆' }}</button>
     </article>
   </template>
   ```

5. Arranca el servidor de desarrollo en el puerto 5171 y deja esa terminal abierta. `npx vite` ejecuta el Vite instalado en el proyecto; el comando es igual en PowerShell, macOS y Linux:

   ```bash
   npx vite --port 5171
   ```

   Abre en Chrome la dirección que muestra la terminal en `Local:`, `http://localhost:5171/`.

**Qué debes ver:** el catálogo con 12 tarjetas y, a la derecha, el panel **Medición** con Dibujos de tarjetas **0**, Dibujos de la lista **0** y Cálculos del filtro **1** (el filtro se calculó una vez para dibujar la lista al abrir). Escribe "cable" en el buscador: queda solo "Cable HDMI".


## Paso 2. Medir el problema (2 minutos)

**Qué vas a hacer y por qué:** antes de optimizar hay que medir. Sin el número de antes no puedes demostrar la mejora.

**Primero, predice:** si marcas como favorito un solo producto, ¿cuántas tarjetas se vuelven a dibujar? Anótalo.

1. Borra el buscador, pulsa **Reiniciar contadores** y pulsa la estrella ☆ de **Teclado**.
2. Anota los tres números en la columna "Antes":

| Medición tras marcar un favorito | Antes | Después |
|---|---|---|
| Dibujos de tarjetas | | |
| Dibujos de la lista | | |
| Cálculos del filtro | | |

**Qué debes ver:** Dibujos de tarjetas **12**, Dibujos de la lista **1**, Cálculos del filtro **1**.


**Por qué pasa:** cada tarjeta llamó a `esFavorito()`, que lee la lista completa de favoritos. Vue anotó que las 12 la leyeron; cuando cambia, las redibuja a todas.

**Opcional, fuera del tiempo del laboratorio (2 minutos), con la herramienta real:** en Chrome pulsa `F12`, pestaña **Rendimiento** (Performance), botón de grabar, marca otra estrella y detén la grabación. En la fila **Tiempos** (Timings) aparecen 12 marcas `<TarjetaProducto> patch`, una por tarjeta; las crea `app.config.performance = true` de `main.js`.

## Paso 3. Guardar el filtro con computed (2 minutos)

**Qué vas a hacer y por qué:** la plantilla llama a `filtrar()` cada vez que la lista se dibuja, aunque la búsqueda no haya cambiado. Un `computed` guarda el resultado y solo lo recalcula cuando cambia algo que usa.

**Dónde:** `src/components/ListaProductos.vue`.

1. En el `import`, agrega `computed`:

   ```js
   import { ref, inject, computed, onUpdated } from 'vue' // computed guarda un resultado y lo recalcula solo si cambia lo que usa
   ```

2. Cambia la función por un `computed`. Solo cambian dos líneas: la primera (`function filtrar() {`) y la última (`}`) de la función:

   ```js
   const filtrados = computed(() => {                    // antes: function filtrar() {
   ```

   ```js
   })                                                    // antes: }
   ```

3. En la plantilla, reemplaza el comentario y la línea del `<li>` por estas. `filtrados` va sin paréntesis: un `computed` se lee como un dato.

   ```html
   <!-- filtrados es un computed: si la consulta no cambió, Vue reutiliza el resultado guardado -->
   <li v-for="producto in filtrados" :key="producto.id">
   ```

**Predice** cuántos cálculos del filtro habrá ahora. Guarda, pulsa **Reiniciar contadores** y marca otra estrella.

**Qué debes ver:** Cálculos del filtro **0**. Las tarjetas siguen en **12**: eso se arregla en el paso 4.

## Paso 4. Darle a cada tarjeta solo lo que necesita (4 minutos)

**Qué vas a hacer y por qué:** si la tarjeta recibe por prop un simple `true` o `false` ("¿soy favorito?"), Vue solo la redibuja cuando ese valor cambia. Ya no lee la lista completa, así que las otras 11 se quedan quietas.

**Dónde:** primero `ListaProductos.vue` y luego `TarjetaProducto.vue`. En `TarjetaProducto.vue` haz los cambios 4.3 y 4.4 y guarda solo al final: si guardas entre uno y otro, la plantilla todavía llama a `esFavorito()`, que ya no existe, y la consola muestra el aviso `Property "esFavorito" was accessed during render but is not defined`.

1. En `ListaProductos.vue`, cambia la línea del `inject` para tomar también `alternarFavorito`:

   ```js
   const { productos, favoritos, alternarFavorito } = inject('catalogo') // recibe lo que App compartió con provide
   ```

2. En la plantilla de la lista, reemplaza `<TarjetaProducto :producto="producto" />` por este bloque:

   ```html
   <!-- cada tarjeta recibe solo lo que necesita: su producto y si es favorito -->
   <TarjetaProducto
     :producto="producto"
     :favorito="favoritos.includes(producto.id)"
     @alternar="alternarFavorito"
   />
   ```

   `:favorito` le entrega a cada tarjeta `true` o `false`; `@alternar` escucha el aviso de la tarjeta y llama a `alternarFavorito` con el id.

3. En `TarjetaProducto.vue`, reemplaza todo el bloque `<script setup>`:

   ```html
   <script setup>
   // Tarjeta de un producto: recibe por props solo lo que necesita
   import { onUpdated } from 'vue'                      // función que avisa después de cada redibujo
   import { contar } from '../medicion.js'              // contadores del panel

   defineProps({                                        // datos que la tarjeta recibe de la lista
     producto: Object,                                  // el producto que se muestra
     favorito: Boolean                                  // true si este producto está marcado
   })
   const emit = defineEmits(['alternar'])               // aviso que la tarjeta le manda a la lista

   onUpdated(() => contar('tarjetas'))                  // cuenta cada vez que esta tarjeta se redibuja
   </script>
   ```

4. En la plantilla de la tarjeta, reemplaza el `<button>` (sus 7 líneas) por este. Cambia `esFavorito()` por `favorito`, y el clic ahora avisa a la lista:

   ```html
   <button
     type="button"
     class="estrella"
     :aria-pressed="favorito"
     :aria-label="(favorito ? 'Quitar de favoritos: ' : 'Marcar como favorito: ') + producto.nombre"
     @click="emit('alternar', producto.id)"
   >{{ favorito ? '★' : '☆' }}</button>
   ```

5. Guarda, pulsa **Reiniciar contadores** y marca una estrella.

**Qué debes ver:** Dibujos de tarjetas **1**. ¿Se parece a lo que predijiste en el paso 2?


## Paso 5. shallowRef para la lista grande (3 minutos)

**Qué vas a hacer y por qué:** `ref` vigila cada producto por dentro. Con 12 no se nota; con miles, cuesta tiempo y memoria. `shallowRef` vigila solo que la lista completa cambie, que es lo que pasa cuando llega del servidor.

**Dónde:** `src/App.vue`.

Antes de empezar, ten presente que cada vez que guardas `App.vue`, Vite vuelve a crear el catálogo: las estrellas se desmarcan y la lista vuelve a 12. Es normal. Por eso `App.vue` copia la lista con `[...productosIniciales]`: el `push` de la predicción no altera `datos.js` y el producto no aparece repetido.

1. Haz dos cambios en el `<script setup>`. Primero, reemplaza la línea `import { ref, provide } from 'vue'` (la primera del `import`) por esta:

   ```js
   import { ref, shallowRef, provide } from 'vue'        // shallowRef vigila solo el cambio de la lista entera
   ```

   Después, más abajo, reemplaza la línea `const productos = ref([...productosIniciales])` por esta:

   ```js
   const productos = shallowRef([...productosIniciales]) // antes: ref([...productosIniciales])
   ```

2. **Predice:** guarda y pulsa **Agregar producto de prueba**. ¿Aparece la tarjeta nueva?

3. No aparece: `push` agrega el producto dentro de la misma lista, y `shallowRef` no mira por dentro. En `agregarProducto`, reemplaza `productos.value.push(nuevo)` por esta línea, que crea una lista nueva:

   ```js
   productos.value = [...productos.value, nuevo]       // lista nueva: copia los anteriores y suma el nuevo
   ```

4. Guarda y vuelve a pulsar **Agregar producto de prueba**.

**Qué debes ver:** la tarjeta "Producto nuevo 13" al final y el resumen "Favoritos: 0 de 13 productos".


## Paso 6. Cerrar la medición (1 minuto)

Pulsa **Reiniciar contadores** y marca una estrella. Anota los tres números en la columna "Después" de la tabla del paso 2 y compárala con tu predicción.

<details markdown="1">
<summary>Cifras esperadas</summary>

| Medición tras marcar un favorito | Antes | Después |
|---|---|---|
| Dibujos de tarjetas | 12 | 1 |
| Dibujos de la lista | 1 | 1 |
| Cálculos del filtro | 1 | 0 |

</details>

La lista se sigue dibujando una vez porque muestra "Favoritos: N de 13 productos", que sí cambió. Ese dibujo es necesario.

## Resultado esperado

- Componentes que se redibujan de más, identificados con números (y en la pestaña Rendimiento de Chrome, si hiciste el paso opcional).
- `shallowRef` aplicado a la lista de productos.
- Filtro con `computed`, sin cálculos repetidos.
- Dibujos de las tarjetas: de 12 a 1.

<details markdown="1">
<summary>Código final de <code>src/components/ListaProductos.vue</code></summary>

```html
<script setup>
// Lista: buscador y una tarjeta por producto
import { ref, inject, computed, onUpdated } from 'vue' // computed guarda un resultado y lo recalcula solo si cambia lo que usa
import TarjetaProducto from './TarjetaProducto.vue'
import { contar } from '../medicion.js'               // contadores del panel

const { productos, favoritos, alternarFavorito } = inject('catalogo') // recibe lo que App compartió con provide
const consulta = ref('')                              // texto del buscador: solo lo usa la lista

const filtrados = computed(() => {                    // antes: function filtrar() {
  contar('filtro')                                    // cuenta cada cálculo del filtro
  const texto = consulta.value.trim().toLowerCase()   // trim quita espacios a los lados; toLowerCase pasa a minúsculas
  if (!texto) return productos.value                  // sin texto: todos los productos
  return productos.value.filter((p) => p.nombre.toLowerCase().includes(texto))
})                                                    // antes: }

onUpdated(() => contar('lista'))                      // cuenta cada vez que la lista se vuelve a dibujar
</script>

<template>
  <label for="buscar">Buscar producto</label>
  <!-- v-model une la caja de texto con consulta: lo que escribes la cambia -->
  <input id="buscar" v-model="consulta" type="search" placeholder="Ejemplo: cable" />
  <p>Favoritos: {{ favoritos.length }} de {{ productos.length }} productos</p>
  <ul class="lista">
    <!-- filtrados es un computed: si la consulta no cambió, Vue reutiliza el resultado guardado -->
    <li v-for="producto in filtrados" :key="producto.id">
      <!-- cada tarjeta recibe solo lo que necesita: su producto y si es favorito -->
      <TarjetaProducto
        :producto="producto"
        :favorito="favoritos.includes(producto.id)"
        @alternar="alternarFavorito"
      />
    </li>
  </ul>
</template>
```

</details>

<details markdown="1">
<summary>Código final de <code>src/components/TarjetaProducto.vue</code></summary>

```html
<script setup>
// Tarjeta de un producto: recibe por props solo lo que necesita
import { onUpdated } from 'vue'                      // función que avisa después de cada redibujo
import { contar } from '../medicion.js'              // contadores del panel

defineProps({                                        // datos que la tarjeta recibe de la lista
  producto: Object,                                  // el producto que se muestra
  favorito: Boolean                                  // true si este producto está marcado
})
const emit = defineEmits(['alternar'])               // aviso que la tarjeta le manda a la lista

onUpdated(() => contar('tarjetas'))                  // cuenta cada vez que esta tarjeta se redibuja
</script>

<template>
  <article class="tarjeta">
    <h2>{{ producto.nombre }}</h2>
    <p>{{ producto.precio.toLocaleString('es-CO') }} pesos</p>
    <!-- aria-pressed y aria-label le dicen al lector de pantalla si está marcada y de qué producto es -->
    <button
      type="button"
      class="estrella"
      :aria-pressed="favorito"
      :aria-label="(favorito ? 'Quitar de favoritos: ' : 'Marcar como favorito: ') + producto.nombre"
      @click="emit('alternar', producto.id)"
    >{{ favorito ? '★' : '☆' }}</button>
  </article>
</template>
```

</details>

<details markdown="1">
<summary>Cambios finales de <code>src/App.vue</code> (el resto queda igual que en el paso 1)</summary>

```js
import { ref, shallowRef, provide } from 'vue'        // shallowRef vigila solo el cambio de la lista entera
const productos = shallowRef([...productosIniciales]) // antes: ref([...productosIniciales])
// ... y dentro de agregarProducto():
productos.value = [...productos.value, nuevo]       // lista nueva: copia los anteriores y suma el nuevo
```

</details>

## Laboratorio resuelto

La carpeta [`ejercicio-resuelto/`](https://github.com/netec-mx/VUE_INT/tree/main/Capitulo01/ejercicio-resuelto) de este capítulo tiene el proyecto terminado, igual al que construyes con esta guía. Úsalo para comparar al final o si te atascas: lo que se aprende está en escribirlo tú.

```bash
cd ejercicio-resuelto
npm install              # instala las dependencias
npx vite --port 5171     # arranca la aplicación en http://localhost:5171
```

## Problemas frecuentes

| Lo que ves | Por qué pasa | Cómo se arregla |
|---|---|---|
| El creador pregunta `Add TypeScript?` o falla con `ERR_TTY_INIT_FAILED` | Faltó `--default`: con solo `--bare`, create-vue hace sus preguntas | Pulsa `Ctrl + C`, borra la carpeta `catalogo` si se creó y usa `npx --yes create-vue@3.16.4 catalogo --default --bare` |
| Avisos `EBADENGINE` o `Vite requires Node.js version ...` | Se usó `create-vue@latest` con un Node.js antiguo: las versiones nuevas traen Vite 7, que pide Node.js 20.19 o 22.12 en adelante | Crea el proyecto otra vez con la versión fija `create-vue@3.16.4` |
| `npm error enoent ... package.json` | La terminal no está en la carpeta `catalogo` | Entra con `cd catalogo` y repite el comando |
| La terminal muestra `Local: http://localhost:5172/` en vez de 5171 | Otro servidor ocupa el puerto 5171 y Vite tomó el siguiente | Cierra el otro servidor con `Ctrl + C` en su terminal, o abre la dirección que muestra la terminal |
| Sigue el título "You did it!" o falla `Failed to resolve import "./components/ListaProductos.vue"` | `App.vue` todavía es el de create-vue, o falta crear `src/components/ListaProductos.vue` | Reemplaza todo `src/App.vue` (paso 1.2) y crea la carpeta `src/components` con sus dos archivos (pasos 1.3 y 1.4) |
| La página queda en blanco tras guardar | Error de sintaxis en el archivo | Mira la consola de Chrome (`F12`) y la terminal: dicen el archivo y la línea |
| `[Vue warn]: Property "esFavorito" was accessed during render but is not defined` | Guardaste `TarjetaProducto.vue` después de 4.3 y antes de 4.4 | Haz el cambio 4.4, guarda y recarga con `F5` |
| Las tarjetas siguen en 12 tras el paso 4 | La plantilla aún usa `esFavorito()` o la lista no pasa `:favorito` | Revisa los pasos 4.2 y 4.4 |
| El producto nuevo no aparece | Falta el paso 5.3: con `shallowRef` hay que asignar una lista nueva | Cambia `push` por `productos.value = [...productos.value, nuevo]` |

## Limpieza

En la terminal del servidor, pulsa `Ctrl + C` para detenerlo. La carpeta `catalogo` puedes borrarla; el laboratorio 2 empieza en una carpeta nueva.

## Ejercicios de reserva

Para quien termina antes. Todos se hacen sobre tu catálogo.

**Básico. Un dato que la plantilla no lee no redibuja nada.** En `App.vue` agrega `const visitas = ref(0)` y un botón "Registrar visita" que solo haga `visitas.value++` y lo muestre con `console.log`. Predice los contadores y compruébalo.

<details markdown="1">
<summary>Solución</summary>

```html
<!-- en <script setup> -->
const visitas = ref(0)                                // dato vigilado que ninguna plantilla lee
function registrarVisita() {
  visitas.value++                                     // cambia el dato
  console.log('Visitas:', visitas.value)              // se ve en la consola, no en pantalla
}
<!-- en el <header> -->
<button type="button" @click="registrarVisita">Registrar visita</button>
```

Los tres contadores quedan en **0**: Vue solo redibuja lo que leyó el dato que cambió.

</details>

**Medio. Buscar sin tildes.** Escribe "camara" y no aparece "Cámara web". Haz que la búsqueda ignore las tildes.

<details markdown="1">
<summary>Solución</summary>

```js
// en ListaProductos.vue, antes del computed
function sinTildes(texto) {                           // "Cámara" -> "camara"
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() // NFD separa la tilde de la letra; replace la quita
}
// dentro del computed, cambia las dos comparaciones:
const texto = sinTildes(consulta.value.trim())
return productos.value.filter((p) => sinTildes(p.nombre).includes(texto))
```

</details>

**Avanzado. v-memo.** Al marcar una estrella, la lista vuelve a recorrer sus 12 `<li>` para compararlos. Cuéntalo y redúcelo a 1 con `v-memo`, que solo vuelve a dibujar un elemento si cambia lo que tú declaras.

<details markdown="1">
<summary>Solución</summary>

```html
<!-- en <script setup> de ListaProductos.vue -->
function fila(id) { console.count('fila dibujada'); return id } // cuenta en la consola cada fila que se dibuja
<!-- en la plantilla: primero sin v-memo (12 por estrella), luego con v-memo (1 por estrella) -->
<li v-for="producto in filtrados" :key="producto.id" :data-fila="fila(producto.id)"
    v-memo="[favoritos.includes(producto.id)]">
```

`v-memo` es la última herramienta, solo después de medir: si olvidas un dato en el arreglo, la fila no se actualiza.

</details>

## Recursos

- [Crear un proyecto de Vue con create-vue](https://vuejs.org/guide/quick-start#creating-a-vue-application): la herramienta oficial con la que empieza este laboratorio.
- [Reactividad en profundidad](https://vuejs.org/guide/extras/reactivity-in-depth): cómo Vue vigila datos y actualiza la pantalla.
- [Propiedades computadas](https://vuejs.org/guide/essentials/computed): valores calculados que se guardan y recalculan solos.
- [Rendimiento](https://vuejs.org/guide/best-practices/performance): técnicas oficiales, incluidas `shallowRef` y props estables.
- [v-memo](https://vuejs.org/api/built-in-directives#v-memo) y [app.config.performance](https://vuejs.org/api/application#app-config-performance).
- [Pestaña Rendimiento de Chrome](https://developer.chrome.com/docs/devtools/performance).

Enlaces comprobados el 18 de octubre de 2026.

## Control de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0 | 2026-10-16 | Andrés Eduardo García Márquez | Guía corta con proyecto inicial descargable y solución aparte |
| 2.0 | 2026-10-16 | Andrés Eduardo García Márquez | Arranque en carpeta vacía con `npm create vite@6.4`: la guía trae todo el código. Búsqueda local en la lista, panel dentro de `App.vue`, medición opcional en la pestaña Rendimiento de Chrome, ejercicios de reserva con solución desplegable (incluido `v-memo`). Puerto 5171 |
| 2.1 | 2026-10-16 | Andrés Eduardo García Márquez | Validada por CLI en Windows 11 (PowerShell) y Linux desde carpeta vacía. `npx create-vite@6.4` en lugar de `npm create vite@6.4 ... -- --template vue`, que en PowerShell se queda en `Select a framework:`. Contadores iniciales reales (0, 0 y 1). Tiempos por paso que suman 24 minutos, opcional de Chrome fuera del tiempo, aviso de guardado en 4.3 y 4.4 y de `App.vue` antes de 5.2, cambios de `App.vue` en dos bloques, columna "Después" medida de nuevo, 13 productos, expresión regular `\u0300-\u036f` e imágenes con el número de paso real |
| 2.2 | 2026-10-18 | Andrés Eduardo García Márquez | El proyecto se crea con create-vue, la herramienta oficial que enseñan los manuales: `npx --yes create-vue@3.16.4 catalogo --default --bare`. La guía dice qué trae el proyecto; ya no se borra `HelloWorld.vue` ni se reemplaza `vite.config.js` (el puerto se da con `npx vite --port 5171`); `src/style.css` y `src/components/` se crean. Node.js 20, 22 o 24; sin imágenes; problemas frecuentes de create-vue y del puerto ocupado; `ejercicio-resuelto/` rehecho siguiendo la guía. Validada paso a paso en Windows 11 y en Linux con Node.js 24.22.0 |

<!-- {% endraw %} -->
