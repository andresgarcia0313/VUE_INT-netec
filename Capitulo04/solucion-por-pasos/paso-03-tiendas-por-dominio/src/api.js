// API simulada: cópiala tal cual, no es el tema de hoy. No hay servidor real detrás.
// Imita a un servidor: cada función espera unos milisegundos y responde con datos o con un error.
// Las tiendas de Pinia son las únicas que la llaman; los componentes nunca hablan con la API directo.
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) // espera ms milisegundos

// Datos de ejemplo: dos proyectos y cuatro tareas. Cada tarea apunta a su proyecto con projectId.
const PROJECTS = [
  { id: 'p1', name: 'Sitio web' },
  { id: 'p2', name: 'App móvil' },
]

const TASKS = [
  { id: 't1', projectId: 'p1', title: 'Diseñar la portada', done: true },
  { id: 't2', projectId: 'p1', title: 'Publicar el sitio', done: false },
  { id: 't3', projectId: 'p2', title: 'Pantalla de inicio', done: false },
  { id: 't4', projectId: 'p2', title: 'Pruebas en Android', done: false },
]

// async: la función devuelve una promesa; quien la llama usa await para esperar la respuesta
export const api = {
  async signIn(name) {
    await wait(300)
    if (!name.trim()) throw new Error('Escribe tu nombre para entrar') // throw = la promesa falla con este mensaje
    return { user: { name: name.trim(), roles: ['editor'] }, token: `demo-${Date.now()}` }
  },
  async getProjects(fail = false) {
    await wait(400)
    if (fail) throw new Error('el servidor respondió 500')
    return PROJECTS.map((project) => ({ ...project })) // copias: la recarga en caliente no duplica datos
  },
  async getTasks() {
    await wait(300)
    return TASKS.map((task) => ({ ...task }))
  },
}
