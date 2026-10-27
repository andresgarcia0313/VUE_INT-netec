// Contadores de dibujos: cuántas veces Vue vuelve a dibujar cada parte. Cópialo tal cual.
// reactive() convierte un objeto en uno vigilado: si cambia una propiedad, Vue redibuja
// lo que la leyó (aquí, el panel "Medición" de App.vue).
import { reactive } from 'vue'

// Truco de medición: se cuenta en un objeto normal (cuentas) y se copia al vigilado (dibujos)
// un instante después. Si se sumara directo en dibujos durante un dibujo, el panel se
// redibujaría por culpa de la propia medición y los números saldrían inflados.
const cuentas = { tarjetas: 0, lista: 0, filtro: 0 }  // números de trabajo, sin vigilancia de Vue
export const dibujos = reactive({ ...cuentas })       // copia vigilada que se ve en pantalla

export function contar(nombre) {                      // suma 1 al contador indicado
  cuentas[nombre]++
  // queueMicrotask ejecuta la función apenas termina el trabajo actual (el dibujo en curso).
  queueMicrotask(() => { dibujos[nombre] = cuentas[nombre] }) // pinta un instante después: medir no causa dibujos extra
}

export function reiniciar() {                         // pone todo en cero antes de medir
  for (const nombre in cuentas) { cuentas[nombre] = 0; dibujos[nombre] = 0 }
}
