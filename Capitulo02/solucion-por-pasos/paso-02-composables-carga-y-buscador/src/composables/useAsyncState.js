// Composable: una función useAlgo() que agrupa estado, cálculos y efectos de UNA tarea.
// Cada llamada crea su propio estado nuevo, así dos componentes que lo usen no se pisan.
// Este se encarga de la carga: datos, bandera de espera, error y la acción de recargar.
import { onMounted, ref } from 'vue'                    // un hook y la caja vigilada

export function useAsyncState(cargar, inicial) {        // recibe cómo cargar y el valor de arranque
  // ref(): caja vigilada; se lee y se cambia con .value. Si cambia, Vue redibuja lo que la leyó.
  const datos = ref(inicial)                            // lo que llegue del servidor
  const cargando = ref(false)                           // bandera de espera
  const error = ref('')                                 // mensaje si algo falla
  async function recargar() {                           // pide los datos otra vez
    cargando.value = true                               // empieza la espera
    error.value = ''                                    // borra el error anterior
    try { datos.value = await cargar() }                // intenta cargar y guarda lo que llegó
    catch { error.value = 'No se pudieron cargar las tareas' } // si falla, deja el aviso
    finally { cargando.value = false }                  // pase lo que pase, termina la espera
  }
  // Un composable puede registrar hooks: onMounted queda atado al componente que llamó a useAsyncState.
  onMounted(recargar)                                   // hook: carga cuando el componente aparece
  return { datos, cargando, error, recargar }           // lo que entrega a quien lo llame
}
