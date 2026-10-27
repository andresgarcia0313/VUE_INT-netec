// Lógica pura del paquete de interfaz: sin Vue ni red, se prueba sola (capítulo 7).
const ETIQUETAS = { activo: 'Activo', agotado: 'Agotado', pendiente: 'Pendiente' }

// Traduce el código del estado a la palabra que ve el usuario
export function etiquetaDeEstado(estado) {
  return ETIQUETAS[estado] ?? 'Desconocido' // ?? da un valor de respaldo
}
