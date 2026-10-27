<!--
  ListaVirtual.vue: lista virtual (virtualización). Recibe los 2.000 productos pero dibuja solo 18.
  Concepto: lo caro no es calcular, es DIBUJAR. La caja mide 560 px y cada fila 56 px: se ven 10.
  Se dibujan esas 10 más 4 de reserva arriba y 4 abajo. Un div "relleno" con el alto de TODAS las
  filas mantiene la barra de desplazamiento del tamaño real, y translateY baja las 18 filas a su sitio.
  Todo sale de computed: al cambiar scrollTop, Vue recalcula inicio, visibles y mover.
-->
<script setup>
import { computed, ref } from 'vue'                                  // funciones de Vue
import FilaProducto from './FilaProducto.vue'                        // cada fila sigue siendo su componente

const { productos } = defineProps({ productos: Array })             // lista completa, ya filtrada (reactiva: Vue 3.5)
const emit = defineEmits(['vender'])                                 // reenvía el aviso de cada fila
const ALTO = 56                                                      // alto de una fila en px: igual al CSS de la fila
const VENTANA = 560                                                  // alto de la caja visible: caben 10 filas
const RESERVA = 4                                                    // filas extra arriba y abajo para no ver huecos
const CUANTAS = VENTANA / ALTO + RESERVA * 2                         // 10 + 8 = 18 filas dibujadas
const scrollTop = ref(0)                                             // cuántos px ha bajado la persona

const inicio = computed(() =>                                        // primera fila que se dibuja
  Math.max(0, Math.floor(scrollTop.value / ALTO) - RESERVA))         // floor redondea abajo; max evita negativos
const visibles = computed(() =>                                      // solo este trozo llega a la página
  productos.slice(inicio.value, inicio.value + CUANTAS))             // slice corta sin tocar la lista original
const alto = computed(() => productos.length * ALTO + 'px')          // alto de TODAS las filas, para la barra
const mover = computed(() => `translateY(${inicio.value * ALTO}px)`) // baja las filas a su lugar

function alDesplazar(e) {                                            // corre en cada movimiento de la barra
  scrollTop.value = e.target.scrollTop                               // guarda cuánto se bajó
}
</script>

<template>
  <!-- tabindex="0": la caja recibe el foco y se desplaza con las flechas del teclado -->
  <div class="ventana" tabindex="0" @scroll="alDesplazar">
    <!-- el relleno da a la barra el tamaño de la lista entera -->
    <div class="relleno" :style="{ height: alto }">
      <div class="filas" :style="{ transform: mover }">
        <!-- una fila por producto visible; key por id -->
        <FilaProducto
          v-for="p in visibles"
          :key="p.id"
          :fila="p"
          @vender="emit('vender', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ventana { height: 560px; overflow-y: auto; border: 1px solid #ccc; }
.relleno { position: relative; }
.filas { position: absolute; top: 0; left: 0; right: 0; }
</style>
