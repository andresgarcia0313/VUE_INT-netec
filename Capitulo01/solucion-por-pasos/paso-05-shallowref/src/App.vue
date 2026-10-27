<!--
  App.vue: componente raíz del catálogo. En el paso 5 la lista de productos pasa a shallowRef.
  Es el "dueño" de los datos: la lista de productos
  y los favoritos viven aquí, y los componentes de abajo los reciben con inject.
  provide/inject evita pasar los mismos datos de padre a hijo a nieto por props (prop drilling).
-->
<script setup>
// Componente principal: guarda los datos del catálogo y los comparte con provide
import { ref, shallowRef, provide } from 'vue'        // shallowRef vigila solo el cambio de la lista entera
import { productosIniciales } from './datos.js'       // los 12 productos de ejemplo
import { dibujos, reiniciar } from './medicion.js'    // contadores del panel
import ListaProductos from './components/ListaProductos.vue'

// shallowRef (ref "superficial"): Vue vigila solo .value, es decir, que llegue una lista NUEVA.
// No recorre ni vigila cada producto por dentro, lo que ahorra tiempo y memoria con listas grandes
// que se reemplazan completas (por ejemplo, cuando llegan del servidor).
const productos = shallowRef([...productosIniciales]) // antes: ref([...productosIniciales])
// favoritos sigue con ref: es una lista pequeña que se cambia por dentro con push y splice.
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
  // Con shallowRef un push NO se ve: cambia la lista por dentro y Vue solo vigila .value.
  // Por eso se asigna una lista nueva: copia los anteriores (...) y suma el nuevo al final.
  productos.value = [...productos.value, nuevo]       // lista nueva: copia los anteriores y suma el nuevo
}

// provide(clave, valor): ofrece datos a todos los componentes que están debajo de App.
// Se comparten los ref (no sus valores), así quien los reciba siempre ve el dato actual.
provide('catalogo', { productos, favoritos, alternarFavorito }) // comparte con todos los componentes de abajo
</script>

<template>
  <header class="encabezado">
    <h1>Catálogo de accesorios</h1>
    <!-- @click es la forma corta de v-on:click: ejecuta la función al pulsar el botón -->
    <button type="button" @click="agregarProducto">Agregar producto de prueba</button>
  </header>
  <main class="contenido">
    <section><ListaProductos /></section>
    <!-- Panel de medición: cópialo tal cual, no es el tema de hoy -->
    <aside class="medicion" aria-live="polite">
      <h2>Medición</h2>
      <dl>
        <!-- {{ }} (interpolación) muestra el valor y se actualiza solo cuando cambia -->
        <div><dt>Dibujos de tarjetas</dt><dd data-prueba="tarjetas">{{ dibujos.tarjetas }}</dd></div>
        <div><dt>Dibujos de la lista</dt><dd data-prueba="lista">{{ dibujos.lista }}</dd></div>
        <div><dt>Cálculos del filtro</dt><dd data-prueba="filtro">{{ dibujos.filtro }}</dd></div>
      </dl>
      <button type="button" @click="reiniciar">Reiniciar contadores</button>
    </aside>
  </main>
</template>
