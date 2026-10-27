<!-- src/components/ProjectDetail.vue: el proyecto abierto y la caché de Apollo -->
<!-- Concepto: este componente no recibe props; lee la misma tienda de Pinia que App.vue. -->
<!-- Como la tienda es única para toda la aplicación, cuando App.vue abre un proyecto -->
<!-- este panel se entera solo y se vuelve a dibujar. -->
<script setup>
import { useProjectsStore } from '../stores/projects'
// Paso 5: con <script setup>, importar un componente basta para usarlo en el template
import TaskForm from './TaskForm.vue'

const store = useProjectsStore()                     // la misma tienda que usa App.vue
</script>

<template>
  <!-- solo aparece cuando hay un proyecto abierto -->
  <section v-if="store.selected">
    <!-- {{ }} (interpolación): escribe en pantalla el valor y lo actualiza si cambia -->
    <h2>{{ store.selected.name }}</h2>
    <ul>
      <!-- v-for repite el <li> por cada tarea; :key le da a Vue un id para seguir cada fila -->
      <li v-for="task in store.selected.tasks" :key="task.id">{{ task.title }}</li>
    </ul>
    <!-- Paso 5: el formulario de nueva tarea, justo después de la lista -->
    <TaskForm />
    <h3>Caché de Apollo: {{ store.cacheEntries.length }} entradas</h3>
    <!-- cada clave es tipo:id, y ninguna se repite -->
    <p><code>{{ store.cacheEntries.join(' · ') }}</code></p>
  </section>
</template>
