<!-- TarjetaProducto.vue: componente de presentación. Su contrato es todo lo que se prueba:
     entra un producto por props y sale el aviso 'alternar' con emit cuando pulsan la estrella. -->
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
    <!-- aria-pressed y aria-label: el lector de pantalla anuncia si está marcado y qué hace el botón -->
    <button
      type="button"
      data-cy="favorito"
      :aria-pressed="favorito"
      :aria-label="(favorito ? 'Quitar de favoritos: ' : 'Marcar como favorito: ') + producto.nombre"
      @click="emit('alternar', producto.id)"
    >{{ favorito ? '★' : '☆' }}</button>        <!-- estrella llena o vacía -->
  </article>
</template>
