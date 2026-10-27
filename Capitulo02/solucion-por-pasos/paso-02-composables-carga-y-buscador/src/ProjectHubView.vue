<!--
  ProjectHubView.vue: la versión nueva, en Composition API con <script setup>.
  Cada tarea del componente vive en su propio composable (carga y buscador) y aquí solo
  se llaman y se conectan. Para entender la carga basta con leer useAsyncState.js.
-->
<script setup>
import { pedirTareas } from './datos.js'                // la carga simulada
import { useAsyncState } from './composables/useAsyncState.js'             // carga
import { useProjectFilters } from './composables/useProjectFilters.js'     // buscador

// Desestructuración: se toma del objeto devuelto solo lo que se usa.
// La lista de tareas (un ref) pasa de un composable al otro: así se componen.
const { datos: tareas, cargando, error, recargar } = useAsyncState(pedirTareas, []) // datos: tareas la renombra
const { texto, soloPendientes, visibles, pendientes } = useProjectFilters(tareas)    // buscador
</script>

<template>
  <section>
    <h2>Después: Composition API</h2>
    <!-- En la plantilla los ref se usan sin .value: Vue lo quita solo -->
    <input v-model="texto" aria-label="Buscar tarea" placeholder="Buscar..." />
    <label><input type="checkbox" v-model="soloPendientes" /> Solo pendientes ({{ pendientes }})</label>
    <p v-if="cargando">Cargando...</p>
    <!-- role="alert" hace que el lector de pantalla anuncie el error apenas aparece -->
    <p v-else-if="error" role="alert">{{ error }}</p>
    <ul v-else>
      <li v-for="t in visibles" :key="t.id">{{ t.hecha ? '✔' : '○' }} {{ t.titulo }}</li>
    </ul>
    <button type="button" @click="recargar">Recargar</button>
  </section>
</template>
