<!--
  App.vue: componente raíz. Retirada la versión de partida (TareasOpciones.vue se borró),
  solo queda la columna "Después", hecha con Composition API, composables, provide y un renderless.
-->
<script setup>
import ProjectHubView from './ProjectHubView.vue'      // la versión con composables
</script>

<template>
  <main class="columnas">
    <ProjectHubView />
  </main>
</template>

<!-- Estilos: cópialos tal cual, no son el tema de hoy -->
<style>
.columnas { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; font-family: system-ui, sans-serif; }
section { border: 1px solid #888; border-radius: 8px; padding: 1rem; }
section ul { list-style: none; padding: 0; }
section li { padding: 0.5rem 0; }
.compacta li { padding: 0; }
</style>
