// src/mocks/handlers.js: el servidor simulado. Cópialo tal cual: no es el tema de hoy.
// Concepto: un "handler" es una regla "si llega esta petición, responde esto". MSW tiene dos tipos:
// http.get / http.post para rutas REST (método + dirección) y graphql.query para consultas GraphQL
// (se reconocen por el NOMBRE de la operación, aquí ProjectTasks). Los datos viven en memoria:
// si Vite recarga la página, vuelven a como están aquí.
import { http, graphql, HttpResponse } from 'msw'   // http: rutas REST; graphql: consultas

// Datos de ejemplo; __typename le dice a Apollo de qué tipo es cada objeto
const projects = [
  { __typename: 'Project', id: 'p-100', name: 'Portal de clientes' },
  { __typename: 'Project', id: 'p-200', name: 'Migración de facturación' }
]
let tasks = [
  { __typename: 'Task', id: 't-1', projectId: 'p-100', title: 'Diseñar pantalla de acceso' },
  { __typename: 'Task', id: 't-2', projectId: 'p-100', title: 'Recuperar contraseña' },
  { __typename: 'Task', id: 't-3', projectId: 'p-200', title: 'Mapear campos antiguos' }
]

// ¿La petición trae la cabecera Authorization: Bearer ...?
const hasToken = (request) => request.headers.get('Authorization')?.startsWith('Bearer ')
// Respuesta 401: sin sesión válida
const unauthorized = () =>
  HttpResponse.json({ message: 'La sesión no es válida o ha expirado.' }, { status: 401 })

export const handlers = [
  // GET /api/projects: la lista, solo con token
  http.get('/api/projects', ({ request }) =>
    hasToken(request) ? HttpResponse.json({ data: projects }) : unauthorized()),

  // POST /api/tasks: crea una tarea; sin título responde 422
  http.post('/api/tasks', async ({ request }) => {
    if (!hasToken(request)) return unauthorized()
    const body = await request.json()
    if (!body.title?.trim()) {
      return HttpResponse.json(
        { message: 'No fue posible validar la tarea.', errors: { title: ['El título es obligatorio.'] } },
        { status: 422 }
      )
    }
    const task = { __typename: 'Task', id: `t-${Date.now()}`, projectId: body.projectId, title: body.title.trim() }
    tasks = [...tasks, task]   // copia nueva del arreglo, no lo muta
    return HttpResponse.json({ data: task }, { status: 201 })
  }),

  // Consulta GraphQL ProjectTasks: un proyecto con sus tareas
  graphql.query('ProjectTasks', ({ variables }) => {
    const project = projects.find((p) => p.id === variables.projectId)
    if (!project) return HttpResponse.json({ errors: [{ message: 'Proyecto no encontrado.' }] })
    const own = tasks.filter((t) => t.projectId === project.id)
    return HttpResponse.json({ data: { project: { ...project, tasks: own } } })
  })
]
