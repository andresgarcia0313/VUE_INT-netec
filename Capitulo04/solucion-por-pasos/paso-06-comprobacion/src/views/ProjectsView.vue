<script setup>
// ProjectsView: la página de proyectos (ruta /proyectos, protegida por la guardia).
// Concepto: el componente NO guarda datos de la API; solo los LEE de las tiendas y llama sus actions.
// Lo que se lee (datos y getters) sale con storeToRefs para seguir conectado;
// lo que se llama (actions) se usa directo desde la tienda: projects.loadAll().
import { onMounted } from 'vue'                            // ciclo de vida (capítulo 1)
import { storeToRefs } from 'pinia'                        // lo que se lee, con storeToRefs
import { useApiStatusStore } from '@/stores/apiStatus.js'  // carga y errores
import { useProjectsStore } from '@/stores/projects.js'    // proyectos
import { useTasksStore } from '@/stores/tasks.js'          // tareas
import { useUiStore } from '@/stores/ui.js'                // tema, filtro y avisos

const projects = useProjectsStore()                        // cada tienda, una vez
const tasks = useTasksStore()
const ui = useUiStore()
const { list, status } = storeToRefs(projects)             // datos y getters: conectados
const { filter, toast } = storeToRefs(ui)
const { isBusy, errors } = storeToRefs(useApiStatusStore())

onMounted(() => {                                          // al aparecer la vista...
  projects.loadAll()                                       // ...pide los proyectos
  tasks.loadAll()                                          // ...y las tareas
})
</script>

<template>
  <section>
    <p>
      <button type="button" @click="ui.toggleTheme()">Cambiar tema</button>
      <label>
        Mostrar
        <!-- v-model sobre filter (un ref de storeToRefs): elegir una opción cambia la tienda ui -->
        <select v-model="filter">
          <option value="todas">Todas</option>
          <option value="pendientes">Pendientes</option>
          <option value="hechas">Hechas</option>
        </select>
      </label>
      <!-- loadAll(true) pide los proyectos con un error simulado del servidor -->
      <button type="button" @click="projects.loadAll(true)">Simular error</button>
    </p>
    <!-- La carga y los errores salen de un solo lugar: el semáforo de projects y la tienda apiStatus -->
    <p>
      Semáforo de proyectos: <strong>{{ status }}</strong>
      <span v-if="isBusy">(cargando...)</span>
      - Errores registrados: {{ errors.length }}
    </p>
    <!-- El aviso (toast) lo escribe apiStatus en la tienda ui cuando una llamada falla -->
    <p v-if="toast" role="alert">
      {{ toast }}
      <button type="button" @click="ui.notify('')">Cerrar aviso</button>
    </p>
    <!-- pendingCount y la lista leen la MISMA copia de cada tarea en byId: marcar una cambia los dos -->
    <h2>Proyectos ({{ tasks.pendingCount }} tareas pendientes)</h2>
    <article v-for="project in list" :key="project.id">
      <h3>{{ project.name }}</h3>
      <ul>
        <li v-for="task in tasks.forProject(project.id)" :key="task.id">
          <label>
            <input type="checkbox" :checked="task.done" @change="tasks.toggleDone(task.id)" />
            {{ task.title }}
          </label>
        </li>
      </ul>
    </article>
  </section>
</template>
