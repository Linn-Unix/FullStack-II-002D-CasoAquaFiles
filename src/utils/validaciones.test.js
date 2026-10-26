import { describe, expect, it } from 'vitest'
import { esCorreoValido, esRutValido, validarPostulacion } from './validaciones'

// Datos válidos que reutilizamos en varias pruebas.
const valoresValidos = {
  nombre: 'Andrea Muñoz',
  rut: '12.345.678-5',
  correo: 'andrea@correo.cl',
  familia: 'Producción',
  ubicacion: 'Chiloé',
  cargo: 'Técnico Acuícola',
  cv: new File(['cv'], 'cv_andrea.pdf', { type: 'application/pdf' }),
}

describe('esRutValido', () => {
  it('acepta un RUT válido con puntos y guion', () => {
    expect(esRutValido('12.345.678-5')).toBe(true)
  })
  it('acepta un RUT con dígito verificador K', () => {
    expect(esRutValido('15.678.432-k')).toBe(true)
  })
  it('rechaza un RUT con dígito verificador incorrecto', () => {
    expect(esRutValido('12.345.678-9')).toBe(false)
  })
  it('rechaza un texto que no es RUT', () => {
    expect(esRutValido('hola')).toBe(false)
  })
})

describe('esCorreoValido', () => {
  it('valida el formato del correo', () => {
    expect(esCorreoValido('andrea@correo.cl')).toBe(true)
    expect(esCorreoValido('andrea@correo')).toBe(false)
  })
})

describe('validarPostulacion', () => {
  it('no devuelve errores con datos válidos', () => {
    expect(validarPostulacion(valoresValidos)).toEqual({})
  })

  it('devuelve errores cuando faltan datos', () => {
    const errores = validarPostulacion({ ...valoresValidos, nombre: '', rut: '', correo: '', cargo: '', cv: null })
    expect(Object.keys(errores)).toEqual(['nombre', 'rut', 'correo', 'cargo', 'cv'])
  })

  it('rechaza un CV que no es PDF ni Word', () => {
    const cv = new File(['cv'], 'cv.png', { type: 'image/png' })
    expect(validarPostulacion({ ...valoresValidos, cv }).cv).toMatch(/PDF o Word/)
  })
})