import { describe, expect, it } from 'vitest'
import { candidatosIniciales, ESTADOS } from '../data/candidatos'
import { contarPorEstado, filtrarCandidatos, obtenerColorEstado, obtenerIniciales } from './candidatos'

describe('filtrarCandidatos', () => {
  it('filtra por texto sin importar mayúsculas', () => {
    const resultado = filtrarCandidatos(candidatosIniciales, 'puerto montt', '')
    expect(resultado.map((c) => c.nombre)).toEqual(['Juanito Pérez', 'Pedro Soto'])
  })

  it('filtra por estado', () => {
    const resultado = filtrarCandidatos(candidatosIniciales, '', ESTADOS.REVISION)
    expect(resultado).toHaveLength(1)
    expect(resultado[0].nombre).toBe('Camila Rojas')
  })

  it('filtra por centro de costos', () => {
    const resultado = filtrarCandidatos(candidatosIniciales, '', '', 'Cultivo y engorda')
    expect(resultado.map((c) => c.nombre)).toEqual(['María González', 'Camila Rojas'])
  })

  it('combina texto y estado', () => {
    expect(filtrarCandidatos(candidatosIniciales, 'chiloé', ESTADOS.FINALIZADO)).toHaveLength(0)
  })
})

describe('utilidades', () => {
  it('obtiene las iniciales del nombre', () => {
    expect(obtenerIniciales('Pedro Soto')).toBe('PS')
  })
  it('cuenta candidatos por estado', () => {
    expect(contarPorEstado(candidatosIniciales, ESTADOS.AGENDADO)).toBe(1)
  })
})

describe('obtenerColorEstado', () => {
  it('devuelve un color distinto para cada estado', () => {
    expect(obtenerColorEstado(ESTADOS.REVISION)).toBe('text-bg-warning')
    expect(obtenerColorEstado(ESTADOS.RECHAZADO)).toBe('text-bg-danger')
  })
  it('usa un color neutro si el estado no existe', () => {
    expect(obtenerColorEstado('Otro')).toBe('text-bg-light')
  })
})