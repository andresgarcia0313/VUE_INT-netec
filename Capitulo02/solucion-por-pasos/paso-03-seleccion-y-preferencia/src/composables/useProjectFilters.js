// Composable del buscador: el texto, el filtro de pendientes y la lista ya filtrada, juntos.
// Recibe la lista como ref (no su valor) para que el computed note cuando llegan datos nuevos.
import { computed, ref } from 'vue'                     // dato calculado y caja vigilada

export function useProjectFilters(tareas) {             // recibe la lista vigilada (un ref)
  const texto = ref('')                                 // lo que se escribe en el buscador
  const soloPendientes = ref(false)                     // true: oculta las tareas hechas
  // computed: guarda el resultado y solo lo recalcula si cambia texto, soloPendientes o tareas.
  const visibles = computed(() => {                     // se recalcula solo si cambia algo que usa
    const buscado = texto.value.toLowerCase()           // minúsculas para comparar sin importar mayúsculas
    return tareas.value
      .filter((t) => t.titulo.toLowerCase().includes(buscado)) // deja las que contienen el texto
      .filter((t) => !soloPendientes.value || !t.hecha)        // si el filtro está activo, quita las hechas
      .sort((a, b) => a.titulo.localeCompare(b.titulo))        // ordena por título, de la A a la Z
  })
  const pendientes = computed(() => tareas.value.filter((t) => !t.hecha).length) // cuántas faltan
  return { texto, soloPendientes, visibles, pendientes }  // estado y cálculos del buscador
}
