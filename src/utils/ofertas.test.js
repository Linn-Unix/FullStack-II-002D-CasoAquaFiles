import { describe, expect, it } from 'vitest'
import { formatearSueldo, ofertaVacia, prepararOferta, separarEnLista, validarOferta } from './ofertas'

const ofertaValida = {
  ...ofertaVacia,
  cargo: 'Técnico Acuícola',
  cupos: '2',
  descripcion: 'Apoyo en centros de cultivo.',
  funciones: 'Monitorear jaulas.',
  requisitos: 'Título técnico.',
  beneficios: 'Seguro complementario.',
  sueldoMinimo: '800000',
  sueldoMaximo: '1000000',
}

describe('validarOferta', () => {
  it('no devuelve errores si la oferta está completa', () => {
    expect(validarOferta(ofertaValida)).toEqual({})
  })

  it('marca los campos vacíos y los cupos fuera de rango', () => {
    const errores = validarOferta({ ...ofertaVacia, cupos: '0' })
    expect(Object.keys(errores)).toEqual(
      expect.arrayContaining(['cargo', 'cupos', 'descripcion', 'funciones', 'requisitos', 'beneficios', 'sueldoMinimo', 'sueldoMaximo']),
    )
  })

  it('no acepta un sueldo máximo menor que el mínimo', () => {
    expect(validarOferta({ ...ofertaValida, sueldoMaximo: '500000' }).sueldoMaximo).toMatch(/no puede ser menor/)
  })
})

describe('utilidades de ofertas', () => {
  it('convierte los números antes de enviarlos', () => {
    expect(prepararOferta(ofertaValida)).toMatchObject({ cupos: 2, sueldoMinimo: 800000, sueldoMaximo: 1000000 })
  })

  it('formatea el rango de sueldo en pesos chilenos', () => {
    expect(formatearSueldo(850000, 1100000)).toBe('$850.000 – $1.100.000')
    expect(formatearSueldo(900000, 900000)).toBe('$900.000')
  })

  it('separa un texto en una lista', () => {
    expect(separarEnLista('Revisar jaulas. Registrar datos.\nApoyar cosechas')).toEqual(['Revisar jaulas', 'Registrar datos', 'Apoyar cosechas'])
    expect(separarEnLista(undefined)).toEqual([])
  })
})
