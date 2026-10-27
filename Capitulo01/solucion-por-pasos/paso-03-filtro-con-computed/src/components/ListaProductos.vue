<!--
  ListaProductos.vue: buscador y una tarjeta por producto.
  Paso 3: el filtro pasa de función normal a computed. Un computed guarda (cachea) su
  resultado y solo lo recalcula cuando cambia un dato vigilado que leyó (consulta o productos).
-->
<script setup>
// Lista: buscador y una tarjeta por producto
import { ref, inject, computed, onUpdated } from 'vue' // computed guarda un resultado y lo recalcula solo si cambia lo que usa
import TarjetaProducto from './TarjetaProducto.vue'
import { contar } from '../medicion.js'               // contadores del panel

// inject(clave) recibe lo que un componente de más arriba ofreció con provide(clave, ...).
const { productos, favoritos } = inject('catalogo')  // recibe lo que App compartió con provide
const consulta = ref('')                              // texto del buscador: solo lo usa la lista

// computed(() => ...): Vue anota qué datos vigilados lee la función (consulta y productos).
// Mientras ninguno cambie, entrega el resultado guardado sin volver a ejecutar la función.
// Marcar un favorito no cambia ninguno de los dos, por eso "Cálculos del filtro" queda en 0.
const filtrados = computed(() => {                    // antes: function filtrar() {
  contar('filtro')                                    // cuenta cada cálculo del filtro
  const texto = consulta.value.trim().toLowerCase()   // trim quita espacios a los lados; toLowerCase pasa a minúsculas
  if (!texto) return productos.value                  // sin texto: todos los productos
  return productos.value.filter((p) => p.nombre.toLowerCase().includes(texto))
})                                                    // antes: }

// onUpdated es un hook (gancho) del ciclo de vida: Vue lo llama cada vez que este componente
// termina de volver a dibujarse. Aquí sirve para contar los redibujos de la lista.
onUpdated(() => contar('lista'))                      // cuenta cada vez que la lista se vuelve a dibujar
</script>

<template>
  <label for="buscar">Buscar producto</label>
  <!-- v-model une la caja de texto con consulta: lo que escribes la cambia -->
  <input id="buscar" v-model="consulta" type="search" placeholder="Ejemplo: cable" />
  <p>Favoritos: {{ favoritos.length }} de {{ productos.length }} productos</p>
  <ul class="lista">
    <!-- filtrados es un computed: si la consulta no cambió, Vue reutiliza el resultado guardado -->
    <!-- v-for repite el <li> por cada producto; :key le da a Vue un id estable para reconocer cada fila -->
    <!-- Un computed se lee como un dato, sin paréntesis -->
    <li v-for="producto in filtrados" :key="producto.id">
      <!-- :producto (forma corta de v-bind:producto) le pasa el objeto a la tarjeta como prop -->
      <TarjetaProducto :producto="producto" />
    </li>
  </ul>
</template>
