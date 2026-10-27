// keys.js: la clave del contexto de ProjectHub y el composable para leerlo.
// Symbol() crea un valor único: aunque otro módulo use Symbol('projectHub'), no es la misma clave.
// Con claves de texto ('catalogo', como en el laboratorio 1) dos librerías podrían chocar.
import { inject } from 'vue'                            // función para recibir lo que ofrece un componente de arriba

export const projectHubKey = Symbol('projectHub')       // clave única: ninguna otra puede chocar con ella

// Envolver inject en un composable da un solo lugar para pedir el contexto y un error claro si falta.
export function useProjectHubContext() {                // así piden el contexto los componentes de abajo
  const contexto = inject(projectHubKey)                // busca hacia arriba quién lo ofreció con provide
  if (!contexto) {                                      // si nadie lo ofreció...
    throw new Error('useProjectHubContext debe utilizarse dentro de ProjectHubView') // ...error con nombre
  }
  return contexto                                       // datos y acciones de ProjectHub
}
