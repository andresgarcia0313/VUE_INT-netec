<!--
  TarjetaProducto.vue: muestra un producto y su estrella de favorito.
  Versión de partida (paso 1): cada tarjeta toma con inject la lista COMPLETA de favoritos.
  Vue anota que las 12 tarjetas leyeron esa lista; si cambia, las redibuja a todas.
-->
<script setup>
// Tarjeta de un producto: muestra nombre, precio y la estrella de favorito
import { inject, onUpdated } from 'vue'
import { contar } from '../medicion.js'               // contadores del panel

// defineProps declara las entradas (props) que el padre le pasa al componente.
// Se usa sin import: es una macro que el compilador de <script setup> entiende solo.
const props = defineProps({ producto: Object })       // el producto llega desde la lista
const { favoritos, alternarFavorito } = inject('catalogo') // la tarjeta toma TODOS los favoritos

function esFavorito() {                               // ¿este producto está en favoritos?
  // Esta lectura es el problema: cada tarjeta queda "suscrita" a toda la lista de favoritos.
  return favoritos.value.includes(props.producto.id)  // lee la lista completa de favoritos
}

onUpdated(() => contar('tarjetas'))                   // cuenta cada vez que una tarjeta se redibuja
</script>

<template>
  <article class="tarjeta">
    <h2>{{ producto.nombre }}</h2>
    <!-- toLocaleString('es-CO') escribe el número con puntos de miles: 180.000 -->
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
