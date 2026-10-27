// Composable de selección: guarda solo el id elegido y calcula la tarea completa a partir de él.
// Guardar el id (y no una copia de la tarea) evita tener dos versiones del mismo dato.
import { computed, ref } from 'vue'                     // dato calculado y caja vigilada

export function useTaskSelection(tareas) {              // recibe la lista vigilada
  const seleccionadaId = ref(null)                      // id de la tarea elegida; null es ninguna
  const seleccionada = computed(() =>                   // la tarea completa, calculada desde el id
    tareas.value.find((t) => t.id === seleccionadaId.value) ?? null) // ?? da null si no la encuentra
  // seleccionadaId no se devuelve: quien use el composable solo puede cambiarla con seleccionar().
  function seleccionar(id) {                            // única puerta para cambiar la selección
    seleccionadaId.value = id                           // guarda el id elegido
  }
  return { seleccionada, seleccionar }                  // entrega la tarea y la acción
}
