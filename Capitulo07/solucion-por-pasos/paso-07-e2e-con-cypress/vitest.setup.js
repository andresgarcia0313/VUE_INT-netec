// vitest.setup.js: preparación común. Vitest lo ejecuta antes de cada archivo de pruebas (setupFiles).
// enableAutoUnmount evita que un componente montado en una prueba siga vivo y contamine la siguiente.
import { afterEach } from 'vitest'                    // gancho que corre al final de cada prueba
import { enableAutoUnmount } from '@vue/test-utils'  // desmontador automático de componentes

enableAutoUnmount(afterEach)                          // tras cada prueba, quita lo que quedó montado
