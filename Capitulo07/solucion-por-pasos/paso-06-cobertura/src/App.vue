<!-- App.vue: el catálogo. Pide los productos al servicio inyectado, filtra con la función pura del
     paso 2 y dibuja una TarjetaProducto por producto. Muestra tres estados: cargando, error o datos. -->
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
