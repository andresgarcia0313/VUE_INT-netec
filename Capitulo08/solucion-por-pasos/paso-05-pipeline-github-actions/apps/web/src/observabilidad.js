// Observabilidad mínima: deja rastro de lo que pasa en el navegador del usuario.
// Cada evento lleva su tipo, la versión desplegada y la hora; se ve en la consola y se guarda
// en localStorage, el almacén del navegador que sobrevive a una recarga.
const CLAVE = 'catalogo-platform:observability' // nombre del registro en localStorage
const MAXIMO = 50 // solo los últimos 50 eventos, para no llenar el navegador
const version = import.meta.env.VITE_APP_VERSION ?? 'desarrollo' // la pone el build de Docker

function reportar(type, datos) {
  const evento = { type, version, timestamp: new Date().toISOString(), ...datos }
  console.info('[catalogo-observability]', evento) // se ve en la consola
  const guardados = JSON.parse(localStorage.getItem(CLAVE) ?? '[]') // lo que ya había
  localStorage.setItem(CLAVE, JSON.stringify([...guardados, evento].slice(-MAXIMO))) // agrega y recorta
}

// Guardias globales de Vue Router (capítulo 3): beforeEach corre antes de cada navegación y afterEach
// al terminarla. app.config.errorHandler es el manejador global de errores de Vue.
export function instalarObservabilidad(app, router) {
  let inicio = 0
  router.beforeEach(() => { inicio = performance.now() }) // arranca el cronómetro al salir
  router.afterEach((to, from) => { // al llegar, reporta cuánto tardó
    reportar('navigation', { from: from.fullPath, to: to.fullPath, durationMs: Math.round(performance.now() - inicio) })
  })
  app.config.errorHandler = (error, instancia, info) => { // todo error que Vue atrapa pasa por aquí
    reportar('error', { message: error.message, info })
  }
}
