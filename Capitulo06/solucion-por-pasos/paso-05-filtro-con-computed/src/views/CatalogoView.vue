<!--
  CatalogoView.vue: la vista de entrada (/).
  Concepto (paso 5): computed MEMOIZA. Guarda el resultado y solo vuelve a calcular cuando cambia
  algo que leyó adentro (busqueda.value o productos.value). Pulsar Contar nodos redibuja la vista,
  pero el filtro ya no se recalcula: la consola se queda en "Cálculos del filtro: 1".
-->
<script setup>
import { ref, shallowRef, computed, onMounted } from 'vue'           // funciones de Vue
import { pedirProductos } from '../datos/productos.js'               // la "API" de los datos
import FilaProducto from '../components/FilaProducto.vue'            // componente de una fila

// shallowRef: solo vigila el cambio de la lista entera (productos.value = ...), no cada objeto por dentro.
// Con 2.000 productos ahorra el trabajo de volver reactivo cada campo.
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
  <!-- v-model une el campo con la ref busqueda: cada tecla cambia busqueda.value -->
  <label>Buscar producto <input v-model="busqueda" type="search" /></label>
  <button type="button" @click="contarNodos">Contar nodos</button>
  <!-- aria-live: el lector de pantalla anuncia el número cuando cambia -->
  <p aria-live="polite">Nodos en la página: {{ nodos }} - Filas dibujadas: {{ filas }}</p>
  <p v-if="cargando">Cargando productos...</p>
  <section v-else aria-label="Productos">
    <!-- filtrados sin paréntesis: un computed se lee como un dato. Aún dibuja las 2.000 filas -->
    <FilaProducto v-for="p in filtrados" :key="p.id" :fila="p" @vender="vender" />
  </section>
</template>
