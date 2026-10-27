// Plugin: Pinia lo llama una vez por cada tienda que nace, con la tienda y sus opciones
// Concepto: un PLUGIN de Pinia agrega comportamiento a TODAS las tiendas sin tocar su código.
// Cada tienda declara su política en la opción persist (key y paths) y este plugin la cumple:
// 1) al nacer la tienda, la HIDRATA con lo guardado en localStorage;
// 2) con $subscribe, guarda en cada cambio solo las claves de paths (nunca el token).
export function persistPlugin({ store, options }) {
  const persist = options.persist                    // la política que declaró la tienda, si tiene
  if (!persist) return                               // sin política: no hace nada

  try {                                              // leer puede fallar
    const saved = localStorage.getItem(persist.key)  // el texto guardado con su nombre (key)
    // $patch cambia varias claves de la tienda de una sola vez
    if (saved) store.$patch(JSON.parse(saved))       // hidratar: lo devuelve a la tienda
  } catch {                                          // texto dañado...
    localStorage.removeItem(persist.key)             // ...se borra para no fallar en cada carga
  }

  store.$subscribe((mutation, state) => {            // Pinia avisa cada vez que cambian los datos
    const chosen = {}                                // aquí va solo lo permitido
    for (const key of persist.paths) {               // recorre la lista paths
      chosen[key] = state[key]                       // copia solo esa clave
    }
    try {
      localStorage.setItem(persist.key, JSON.stringify(chosen)) // lo guarda como texto JSON
    } catch {
      // almacenamiento lleno o bloqueado: la aplicación sigue, solo no recuerda el cambio
    }
  }, { detached: true })                             // sin detached, la suscripción muere al desmontarse el componente que creó la tienda (aquí, la vista de login o de proyectos)
}
