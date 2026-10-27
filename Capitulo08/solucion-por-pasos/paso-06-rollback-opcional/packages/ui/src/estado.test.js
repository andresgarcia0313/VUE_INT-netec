// Prueba unitaria con Vitest: describe agrupa, it declara un caso y expect comprueba.
// La misma prueba la correrá la pipeline de CI en cada cambio (paso 5).
import { describe, it, expect } from 'vitest'
import { etiquetaDeEstado } from './estado.js'

describe('etiquetaDeEstado', () => {
  it('traduce un estado conocido', () => {
    expect(etiquetaDeEstado('agotado')).toBe('Agotado')
  })
  it('avisa cuando no conoce el estado', () => {
    expect(etiquetaDeEstado('xyz')).toBe('Desconocido')
  })
})
