// Tienda de TAREAS: todas las tareas, normalizadas igual que los proyectos (byId y allIds).
// Concepto: una tienda puede usar otra. Aquí tasks lee el filtro de la tienda ui y reporta
// su carga a apiStatus. Las dependencias van en una sola dirección para no crear ciclos.
import { defineStore } from 'pinia'                  // crea tiendas
import { computed, ref } from 'vue'                  // piezas del capítulo 1
import { api } from '@/api.js'                       // API simulada (@ = src)
import { useApiStatusStore } from './apiStatus.js'   // carga y errores en un solo lugar
import { useUiStore } from './ui.js'                 // el filtro vive en la tienda de interfaz

export const useTasksStore = defineStore('tasks', () => {
  const byId = ref({})                               // cada tarea UNA vez, por su id
  const allIds = ref([])                             // el orden de las tareas
  const ui = useUiStore()                            // una tienda puede usar otra
  // getter: cuántas tareas faltan; se recalcula solo cuando cambia alguna tarea
  const pendingCount = computed(() => allIds.value.filter((id) => !byId.value[id].done).length)

  // getter que devuelve una función: las tareas de un proyecto, según el filtro elegido
  // El computed entrega una función que recibe el id; la plantilla la llama con tasks.forProject(project.id)
  // y la lista se recalcula cuando cambian las tareas o el filtro.
  const forProject = computed(() => (projectId) => allIds.value
    .map((id) => byId.value[id])                     // de id a tarea
    .filter((task) => task.projectId === projectId)  // solo las de ese proyecto
    .filter((task) => ui.filter === 'todas' || task.done === (ui.filter === 'hechas')))

  async function loadAll() {
    const tasks = await useApiStatusStore().track('cargar tareas', () => api.getTasks())
    byId.value = Object.fromEntries(tasks.map((t) => [t.id, t])) // { t1: {...}, t2: {...} }
    allIds.value = tasks.map((t) => t.id)            // ['t1', 't2', 't3', 't4']
  }

  // En Pinia no hay mutations (como en Vuex): la action cambia el dato directamente
  function toggleDone(id) {                          // una sola copia: el cambio se ve en todas partes
    byId.value[id].done = !byId.value[id].done
  }

  return { byId, allIds, pendingCount, forProject, loadAll, toggleDone }
})
