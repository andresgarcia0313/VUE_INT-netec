<!-- src/App.vue: la pantalla principal; no conoce direcciones ni cabeceras -->
<!-- Concepto: la vista solo lee la tienda y llama a sus acciones. No importa librerías HTTP ni -->
<!-- GraphQL y no escribe direcciones ni cabeceras: eso vive en los servicios (src/services). -->
<!-- Si mañana cambia el servidor, esta pantalla no se toca. El paso 6 lo comprueba con grep. -->
<script setup>
import { onMounted } from 'vue'                      // corre algo al aparecer en pantalla
import { useProjectsStore } from './stores/projects'
import ProjectDetail from './components/ProjectDetail.vue'

const store = useProjectsStore()                     // la tienda del capítulo 4
// onMounted: gancho del ciclo de vida; se ejecuta cuando el componente ya está en la página
onMounted(() => store.loadProjects())                // al abrir, pide la lista
</script>

<template>
  <main>
    <h1>ProjectHub</h1>
    <!-- v-if / v-else: un solo botón según haya sesión o no -->
    <!-- @click (v-on:click): llama a la acción de la tienda al pulsar -->
    <button v-if="store.loggedIn" @click="store.logout">Cerrar sesión</button>
    <button v-else @click="store.login">Iniciar sesión</button>
    <!-- role="alert": el lector de pantalla anuncia el aviso -->
    <p v-if="store.notice" role="alert">{{ store.notice }}</p>
    <ul>
      <li v-for="project in store.projects" :key="project.id">
        <button @click="store.openProject(project.id)">{{ project.name }}</button>
      </li>
    </ul>
    <ProjectDetail />
  </main>
</template>

<style>
/* Estilos mínimos. Cópialos tal cual: no son el tema de hoy. */
main { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; }
[role='alert'] { color: #b00020; }
button { margin: 0.2rem; }
</style>
