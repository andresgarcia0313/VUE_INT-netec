<!--
  ProjectHubView.vue: la versión nueva, en Composition API con <script setup>.
  Ya usa cuatro composables: carga, buscador, selección y preferencia guardada.
  Cada uno se llama una vez y se toma solo lo que la plantilla necesita.
-->
<script setup>
import { pedirTareas } from './datos.js'                // la carga simulada
import { useAsyncState } from './composables/useAsyncState.js'             // carga
import { useProjectFilters } from './composables/useProjectFilters.js'     // buscador
import { useTaskSelection } from './composables/useTaskSelection.js'       // selección
import { useLocalPreferences } from './composables/useLocalPreferences.js' // preferencia

// Desestructuración: se toma del objeto devuelto solo lo que se usa.
// La lista de tareas (un ref) pasa de un composable a otro: así se componen.
const { datos: tareas, cargando, error, recargar } = useAsyncState(pedirTareas, []) // datos: tareas la renombra
const { texto, soloPendientes, visibles, pendientes } = useProjectFilters(tareas)    // buscador
const { seleccionada, seleccionar } = useTaskSelection(tareas)                       // selección
// La clave 'vista-compacta' es distinta de 'compacta' (columna Antes): cada columna recuerda lo suyo.
const compacta = useLocalPreferences('vista-compacta')                               // preferencia guardada
</script>

<template>
  <!-- :class="{ compacta }" agrega la clase compacta solo si el dato compacta es true -->
  <section :class="{ compacta }">
    <h2>Después: Composition API</h2>
    <input v-model="texto" aria-label="Buscar tarea" placeholder="Buscar..." />
    <label><input type="checkbox" v-model="soloPendientes" /> Solo pendientes ({{ pendientes }})</label>
    <label><input type="checkbox" v-model="compacta" /> Vista compacta</label>
    <p v-if="cargando">Cargando...</p>
    <p v-else-if="error" role="alert">{{ error }}</p>
    <ul v-else>
      <li v-for="t in visibles" :key="t.id">
        <button type="button" @click="seleccionar(t.id)">{{ t.hecha ? '✔' : '○' }} {{ t.titulo }}</button>
      </li>
    </ul>
    <!-- ?. (encadenamiento opcional) evita el error si no hay selección; ?? pone 'ninguna' en ese caso -->
    <p>Seleccionada: {{ seleccionada?.titulo ?? 'ninguna' }}</p>
    <button type="button" @click="recargar">Recargar</button>
  </section>
</template>
