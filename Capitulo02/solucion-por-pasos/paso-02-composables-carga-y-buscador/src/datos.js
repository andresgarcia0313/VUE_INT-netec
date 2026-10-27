// Datos de ejemplo de ProjectHub: cópialo tal cual, no es el tema de hoy
const tareas = [
  { id: 1, titulo: 'Diseñar la pantalla de inicio', hecha: true },
  { id: 2, titulo: 'Conectar la API de proyectos', hecha: false },
  { id: 3, titulo: 'Escribir pruebas del buscador', hecha: false },
  { id: 4, titulo: 'Revisar accesibilidad del menú', hecha: true },
  { id: 5, titulo: 'Publicar la versión 1.0', hecha: false }
]

// Simula pedir las tareas a un servidor: responde después de 800 milisegundos
// Devuelve una Promise (promesa): un valor que llegará más tarde. Quien la recibe usa await para esperarlo.
export function pedirTareas() {
  return new Promise((resolver) =>
    setTimeout(() => resolver(tareas.map((t) => ({ ...t }))), 800))  // entrega copias: el original no cambia
}
