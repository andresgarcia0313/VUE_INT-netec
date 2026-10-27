import { describe, it, expect } from 'vitest'           // piezas de Vitest
import { mount } from '@vue/test-utils'                 // monta el componente en el documento de jsdom
import TarjetaProducto from '../components/TarjetaProducto.vue' // el componente que se prueba

const base = { id: 7, nombre: 'Teclado', precio: 89900 } // producto de prueba
const montar = (extra) =>                               // atajo: monta la tarjeta con la base...
  mount(TarjetaProducto, { props: { producto: base, ...extra } }) // ...y las props que cambien

describe('TarjetaProducto', () => {
  it('muestra el nombre y el precio que recibe', () => {
    const wrapper = montar()                                       // preparar
    expect(wrapper.get('h2').text()).toBe('Teclado')               // ¿nombre?
    expect(wrapper.get('[data-testid="precio"]').text()).toBe('$ 89900') // ¿precio?
  })

  it('avisa alternar con el id al pulsar la estrella', async () => {
    const wrapper = montar()
    await wrapper.get('button').trigger('click')                   // clic y espera el redibujo
    expect(wrapper.emitted('alternar')).toEqual([[7]])             // un aviso, con el id 7
  })

  it('muestra la estrella llena cuando es favorito', () => {
    const boton = montar({ favorito: true }).get('button')         // la base, pero marcada
    expect(boton.text()).toBe('★')                                 // lo que ve la persona
    expect(boton.attributes('aria-pressed')).toBe('true')          // lo que oye el lector de pantalla
  })
})

// Prueba de componente: se prueba por lo que muestra (texto, atributos) y lo que avisa (emitted),
// nunca por sus variables internas ni sus clases CSS; así un cambio de estilo no la rompe.
// get() falla con un mensaje claro si el elemento no existe; trigger() devuelve una promesa que
// se espera con await para que Vue termine de redibujar antes de comprobar.
