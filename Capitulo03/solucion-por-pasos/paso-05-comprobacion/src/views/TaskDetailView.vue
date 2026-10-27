<!--
  TaskDetailView.vue: ruta hija /app/tasks/:taskId.
  Con props: true en la ruta, el parámetro :taskId de la dirección llega como prop.
  Así la vista no depende de useRoute() y se puede reutilizar y probar sola.
-->
<script setup>
// defineProps declara las entradas del componente; aquí taskId es obligatoria y de tipo texto.
defineProps({ taskId: { type: String, required: true } }) // llega desde :taskId gracias a props: true
</script>

<template>
  <h2>Detalle de tarea</h2>
  <p>Tarea recibida desde la dirección: <strong>{{ taskId }}</strong></p>
</template>
