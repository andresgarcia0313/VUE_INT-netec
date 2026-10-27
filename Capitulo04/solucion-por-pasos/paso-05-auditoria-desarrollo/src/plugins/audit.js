// Plugin de auditoría: anota en la consola cada action, cuánto tardó y si falló
// Concepto: $onAction es un "escucha" de Pinia que se ejecuta ANTES de cada action de la tienda.
// Recibe el nombre de la action y dos ganchos: after (terminó bien) y onError (falló).
// Sirve para medir o depurar sin modificar ninguna tienda; main.js lo activa solo en desarrollo.
export function auditPlugin({ store }) {
  store.$onAction(({ name, after, onError }) => {    // avisa antes de cada action
    const id = `${store.$id}.${name}`                // ej.: projects.loadAll
    const start = performance.now()                  // arranca el cronómetro
    after(() => {                                    // si la action termina bien...
      const ms = performance.now() - start           // ...cuánto tardó
      console.info(id, ms.toFixed(1), 'ms')          // lo anota en la consola
    })
    onError((error) => {                             // si la action falla...
      console.error(id, error.message)               // ...anota el error, en rojo
    })
  })
}
