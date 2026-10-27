// sesion.js: composable de sesión (repaso del capítulo 2).
// Un composable es una función use...() que agrupa estado reactivo y acciones para reutilizarlos.
// Como el estado se declara FUERA de la función, todas las vistas que llamen useSesion()
// comparten la MISMA sesión (patrón de estado compartido sin Pinia).
import { ref, computed } from 'vue'                          // estado reactivo y valores calculados

const cuentas = {                                            // cuentas de prueba: correo -> datos del usuario
  'user@projecthub.dev': { nombre: 'Úrsula', rol: 'user' },
  'admin@projecthub.dev': { nombre: 'Ada', rol: 'admin' },
}
// ref(): caja reactiva; al cambiar .value, Vue vuelve a dibujar lo que la usa.
const usuario = ref(null)                                    // fuera de la función: una sola sesión para toda la app
// computed(): valor derivado que se recalcula solo cuando cambia usuario.
const conectado = computed(() => usuario.value !== null)     // true cuando alguien inició sesión

async function entrar(correo) {                              // simula la llamada al servidor de autenticación
  await new Promise((listo) => setTimeout(listo, 300))       // espera 300 ms, como haría la red
  if (!cuentas[correo]) throw new Error('Ese correo no está registrado.') // la vista muestra este mensaje
  usuario.value = cuentas[correo]                            // guarda quién entró
}

function salir() {                                           // cierra la sesión
  usuario.value = null                                       // sin usuario, la guardia vuelve a pedir ingreso
}

// La sesión vive en memoria: si recargas la página (F5 o escribir en la barra), se pierde.
export function useSesion() {                                // el composable entrega el estado y las acciones
  return { usuario, conectado, entrar, salir }
}
