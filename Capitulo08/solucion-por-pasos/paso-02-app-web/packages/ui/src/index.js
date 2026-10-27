// Puerta de entrada pública: las apps importan solo desde aquí
// "exports" de packages/ui/package.json apunta a este archivo: cualquier otra ruta interna queda cerrada,
// así el paquete puede reorganizar sus archivos sin romper a quien lo usa.
export { default as EtiquetaEstado } from './EtiquetaEstado.vue'
export { etiquetaDeEstado } from './estado.js'
