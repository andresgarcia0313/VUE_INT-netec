import { describe, it, expect } from 'vitest'               // agrupar, declarar un caso y comprobar
import { filtrarProductos } from '../utils/filtrarProductos.js' // la función que se prueba

const productos = [                                         // datos fijos: siempre los mismos
  { id: 1, nombre: 'Mouse inalámbrico' },
  { id: 2, nombre: 'Teclado mecánico' },
  { id: 3, nombre: 'Monitor 4K' }
]

describe('filtrarProductos', () => {
  it('devuelve los que contienen el texto, sin importar mayúsculas', () => { // caso normal
    const resultado = filtrarProductos(productos, 'MO')    // ejecutar: una sola acción
    expect(resultado.map((p) => p.id)).toEqual([1, 3])     // verificar: Mouse y Monitor
  })

  it('con texto vacío o solo espacios devuelve todos', () => { // caso borde
    expect(filtrarProductos(productos, '   ')).toHaveLength(3) // los tres productos
  })

  it('lanza un error claro si no recibe una lista', () => {  // caso de error
    expect(() => filtrarProductos(null, 'mo')).toThrow('productos debe ser una lista') // el mensaje exacto
  })
})

// Prueba unitaria: cada caso sigue el patrón preparar, ejecutar y verificar.
// Tres casos cubren lo que importa de una función: el normal, el borde y el de error.
