<!--
  App.vue: componente raíz. Dibuja las columnas de la comparación.
  En este paso solo está la versión de partida, escrita en Options API.
-->
<script setup>
// <script setup>: forma corta de la Composition API. Lo que se importa o declara aquí
// queda disponible en la plantilla sin registrarlo (por eso TareasOpciones se usa directo).
import TareasOpciones from './TareasOpciones.vue'      // la versión de partida, en Options API
</script>

<template>
  <main class="columnas">
    <TareasOpciones />
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
