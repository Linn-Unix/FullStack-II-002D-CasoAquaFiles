import { describe, expect, it } from 'vitest'
import { ROLES } from '../data/roles'
import { validarCredenciales } from './autenticacion'

describe('validarCredenciales', () => {
  it('devuelve el usuario cuando los datos son correctos', () => {
    expect(validarCredenciales('analista', 'aqua123')).toMatchObject({ nombre: 'Rosa Martínez', rol: ROLES.SUPERVISOR })
  })

  it('devuelve null si la contraseña es incorrecta', () => {
    expect(validarCredenciales('evaluador', 'otra')).toBeNull()
  })
})
