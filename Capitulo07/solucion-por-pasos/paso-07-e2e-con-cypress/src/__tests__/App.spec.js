import { describe, it, expect, vi } from 'vitest'           // vi crea dobles
import { mount, flushPromises } from '@vue/test-utils'     // flushPromises espera las promesas pendientes
import App from '../App.vue'                                // el catálogo completo

const productos = [                                         // lo que "responde" el servicio de mentira
  { id: 1, nombre: 'Mouse inalámbrico', precio: 49900 },
  { id: 2, nombre: 'Teclado mecánico', precio: 189900 }
]
const montar = (api) => mount(App, { global: { provide: { api } } }) // entrega el doble como lo haría main.js

describe('Catálogo', () => {
  it('pide los productos una vez y los muestra', async () => {
    const api = { listarProductos: vi.fn().mockResolvedValue(productos) } // doble que responde bien
    const wrapper = montar(api)
    expect(wrapper.text()).toContain('Cargando productos...') // antes de la respuesta
    await flushPromises()                                     // espera la causa: la respuesta
    expect(api.listarProductos).toHaveBeenCalledOnce()        // pidió una sola vez
    expect(wrapper.findAll('li')).toHaveLength(2)             // y dibujó dos filas
  })

  it('filtra con lo que escribe la persona', async () => {
    const wrapper = montar({ listarProductos: vi.fn().mockResolvedValue(productos) })
    await flushPromises()
    await wrapper.get('#buscar').setValue('tecla')            // escribe en el campo y espera
    expect(wrapper.findAll('li')).toHaveLength(1)             // solo el teclado
    await wrapper.get('#buscar').setValue('zzz')              // un texto que nadie tiene
    expect(wrapper.text()).toContain('No hay productos con ese nombre.')
  })

  it('marca y desmarca un favorito y actualiza el resumen', async () => {
    const wrapper = montar({ listarProductos: vi.fn().mockResolvedValue(productos) })
    await flushPromises()
    await wrapper.get('button').trigger('click')              // marca el primero
    expect(wrapper.get('[data-cy="resumen"]').text()).toBe('Favoritos: 1 de 2')
    await wrapper.get('button').trigger('click')              // lo desmarca
    expect(wrapper.get('[data-cy="resumen"]').text()).toBe('Favoritos: 0 de 2')
  })

  it('muestra un aviso si el servidor falla', async () => {
    const api = { listarProductos: vi.fn().mockRejectedValue(new Error('HTTP 500')) } // doble que falla
    const wrapper = montar(api)
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe('No se pudo cargar el catálogo.')
  })
})

// Doble de prueba: vi.fn() crea una función de mentira que registra cómo la llamaron.
// mockResolvedValue la hace devolver una promesa que se cumple; mockRejectedValue, una que falla.
// global.provide entrega ese doble al inject('api') de App.vue, igual que provide en main.js:
// la prueba no toca la red, corre en milisegundos y da el mismo resultado siempre.
// flushPromises espera la causa (la respuesta del doble) en lugar de un número de milisegundos.
