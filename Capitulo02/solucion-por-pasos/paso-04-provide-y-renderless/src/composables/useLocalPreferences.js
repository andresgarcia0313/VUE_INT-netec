// Composable de preferencia: un valor true/false que se recuerda en el navegador (localStorage).
// localStorage guarda texto por clave y sobrevive a recargar la página con F5.
import { ref, watch } from 'vue'                        // caja vigilada y observador

export function useLocalPreferences(clave, inicial = false) { // clave con la que se guarda en el navegador
  const guardado = localStorage.getItem(clave)          // lo que quedó de la visita anterior, o null
  const valor = ref(guardado === null ? inicial : guardado === 'true') // el texto 'true' pasa a booleano
  // watch(fuente, efecto): cada vez que valor cambia, ejecuta el efecto con el valor nuevo.
  watch(valor, (nuevo) => localStorage.setItem(clave, String(nuevo)))  // efecto: guarda cada cambio
  return valor                                          // entrega la caja: se usa con v-model
}
