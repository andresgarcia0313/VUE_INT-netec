<!-- EtiquetaEstado.vue: componente compartido del paquete @catalogo/ui. Recibe el estado por props y
     muestra su texto; computed lo recalcula solo cuando cambia la prop. data-estado elige el color en CSS. -->
<script setup>
import { computed } from 'vue'
import { etiquetaDeEstado } from './estado.js'

const props = defineProps({ estado: { type: String, required: true } })
const texto = computed(() => etiquetaDeEstado(props.estado)) // se recalcula si cambia el estado
</script>

<template>
  <span class="etiqueta" :data-estado="estado">{{ texto }}</span>
</template>

<style scoped>
.etiqueta { padding: 0.1rem 0.5rem; border-radius: 999px; font-weight: 700; background: #e5e7eb; color: #111827; }
.etiqueta[data-estado='activo'] { background: #dcfce7; color: #166534; }
.etiqueta[data-estado='agotado'] { background: #fee2e2; color: #991b1b; }
</style>
