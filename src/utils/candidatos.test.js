import { describe, expect, it } from 'vitest'
import { candidatosIniciales, ESTADOS } from '../data/candidatos'
import { contarPorEstado, filtrarCandidatos, obtenerIniciales } from './candidatos'

describe('filtrarCandidatos', () => {
  it('filtra por texto sin importar mayúsculas', () => {
    const resultado = filtrarCandidatos(candidatosIniciales, 'puerto montt', '')
    expect(resultado.map((c) => c.nombre)).toEqual(['Gosman Radatz', 'Valentina Ríos'])
  })

  it('filtra por estado', () => {
    const resultado = filtrarCandidatos(candidatosIniciales, '', ESTADOS.REVISION)
    expect(resultado).toHaveLength(1)
    expect(resultado[0].nombre).toBe('Nicolás Vera')
  })

  it('combina texto y estado', () => {
    expect(filtrarCandidatos(candidatosIniciales, 'chiloé', ESTADOS.FINALIZADO)).toHaveLength(0)
  })
})

describe('utilidades', () => {
  it('obtiene las iniciales del nombre', () => {
    expect(obtenerIniciales('Valentina Ríos')).toBe('VR')
  })
  it('cuenta candidatos por estado', () => {
    expect(contarPorEstado(candidatosIniciales, ESTADOS.AGENDADO)).toBe(1)
  })
})