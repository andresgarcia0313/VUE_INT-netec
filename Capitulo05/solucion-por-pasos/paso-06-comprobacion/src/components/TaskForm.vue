<!-- src/components/TaskForm.vue: crea una tarea y muestra el 422 junto al campo -->
<!-- Concepto: el mismo AppError llega con distintos type. El formulario solo se encarga del -->
<!-- type 'validation' (422) y lo pone debajo del campo; los demás (401, red) ya los convirtió -->
<!-- la tienda en el aviso general de arriba. -->
<script setup>
import { ref } from 'vue'
import { useProjectsStore } from '../stores/projects'

const store = useProjectsStore()
const title = ref('')                                // lo que escribe la persona
const titleError = ref('')                           // mensaje debajo del campo

async function submit() {
  titleError.value = ''                              // limpia el error anterior
  try {
    await store.addTask(title.value)                 // la tienda llama al servicio REST
    title.value = ''                                 // éxito: vacía el campo
  } catch (error) {
    // Decide con type: solo la validación se queda junto al campo
    if (error.type === 'validation') titleError.value = error.details?.title?.[0] ?? error.message
  }
}
</script>

<template>
  <!-- .prevent: evita que el navegador recargue la página al enviar -->
  <form @submit.prevent="submit">
    <label for="task-title">Nueva tarea</label>
    <!-- v-model: une el campo con la ref title en los dos sentidos (lo escrito llega a title) -->
    <!-- :aria-invalid (v-bind): marca el campo como inválido para lectores de pantalla si hay error -->
    <input id="task-title" v-model="title" :aria-invalid="Boolean(titleError)" />
    <button type="submit">Crear tarea</button>
    <p v-if="titleError" role="alert">{{ titleError }}</p>
  </form>
</template>
