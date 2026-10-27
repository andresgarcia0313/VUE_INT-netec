<!--
  FilaProducto.vue: una fila del catálogo. Recibe el producto por props y avisa con un evento.
  Concepto: props bajan datos del padre al hijo; emit sube avisos del hijo al padre (capítulo 2).
  La fila no cambia el stock ella misma: solo avisa "vender" con el id y el padre decide.
  Paso 7. Concepto: v-once dibuja el elemento una sola vez y Vue no lo vuelve a revisar. Sirve
  para lo que nunca cambia, como la referencia (el id).
-->
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
    <!-- :aria-label (v-bind) arma un nombre distinto por fila; @click emite el aviso con el id -->
    <button type="button" :aria-label="'Vender 1 de ' + fila.nombre" @click="emit('vender', fila.id)">Vender 1</button>
  </article>
</template>

<style scoped>
/* height: 56px es el alto fijo de cada fila; la lista virtual del paso 6 depende de este número */
.fila { display: grid; grid-template-columns: 5rem 1fr 5rem 5rem 5rem 6rem; gap: 0.5rem; align-items: center;
  height: 56px; box-sizing: border-box; padding: 0 0.5rem; border-bottom: 1px solid #ddd; }
</style>
