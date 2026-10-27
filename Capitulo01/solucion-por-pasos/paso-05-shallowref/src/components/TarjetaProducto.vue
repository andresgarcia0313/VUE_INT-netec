<!--
  TarjetaProducto.vue: muestra un producto y su estrella de favorito.
  Paso 4: la tarjeta recibe por props solo lo que necesita (su producto y un booleano)
  y, al pulsar la estrella, emite un evento hacia la lista en lugar de cambiar datos ajenos.
  Regla de Vue: los datos bajan por props y los avisos suben por eventos.
-->
<script setup>
// Tarjeta de un producto: recibe por props solo lo que necesita
import { onUpdated } from 'vue'                      // función que avisa después de cada redibujo
import { contar } from '../medicion.js'              // contadores del panel

// defineProps declara las entradas (props). Vue compara las props nuevas con las anteriores:
// si producto y favorito no cambiaron, la tarjeta no se vuelve a dibujar.
defineProps({                                        // datos que la tarjeta recibe de la lista
  producto: Object,                                  // el producto que se muestra
  favorito: Boolean                                  // true si este producto está marcado
})
// defineEmits declara los eventos que este componente puede emitir; el padre los escucha con @alternar.
const emit = defineEmits(['alternar'])               // aviso que la tarjeta le manda a la lista

onUpdated(() => contar('tarjetas'))                  // cuenta cada vez que esta tarjeta se redibuja
</script>

<template>
  <article class="tarjeta">
    <h2>{{ producto.nombre }}</h2>
    <!-- toLocaleString('es-CO') escribe el número con puntos de miles: 180.000 -->
    <p>{{ producto.precio.toLocaleString('es-CO') }} pesos</p>
    <!-- aria-pressed y aria-label le dicen al lector de pantalla si está marcada y de qué producto es -->
    <!-- emit('alternar', producto.id) dispara el evento con el id; la lista decide qué hacer -->
    <button
      type="button"
      class="estrella"
      :aria-pressed="favorito"
      :aria-label="(favorito ? 'Quitar de favoritos: ' : 'Marcar como favorito: ') + producto.nombre"
      @click="emit('alternar', producto.id)"
    >{{ favorito ? '★' : '☆' }}</button>
  </article>
</template>
