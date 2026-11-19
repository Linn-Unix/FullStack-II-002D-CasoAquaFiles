import { describe, expect, it } from 'vitest'
import {
  guardarEvaluacionApi,
  listarEvaluaciones,
} from './evaluacionesService'
import { simularApi } from '../test/simularApi'

const evaluacionApi = {
  id: 8,
  candidatoId: 2,
  nombre: 'María González',
  rut: '18.923.456-2',
  cargo: 'Jefe de Turno Centro',
  familia: 'Operaciones',
  ubicacion: 'Puerto Natales',
  centroCosto: 'Cultivo y engorda',
  fechaSolicitud: '2026-09-28',
  estado: 'AGENDADO',
  fechaEntrevista: '2026-10-28',
  resultado: null,
  observaciones: null,
}

describe('evaluacionesService', () => {
  it('lista y adapta las evaluaciones del backend', async () => {
    simularApi({
      'GET /evaluaciones': { cuerpo: [evaluacionApi] },
    })

    const evaluaciones = await listarEvaluaciones()

    expect(evaluaciones[0]).toMatchObject({
      id: 8,
      nombre: 'María González',
      estado: 'Agendado',
      fechaEntrevista: '2026-10-28',
    })
  })

  it('guarda el resultado y las observaciones', async () => {
    const fetchFalso = simularApi({
      'PUT /evaluaciones/8': {
        cuerpo: {
          ...evaluacionApi,
          resultado: 'Recomendable',
          observaciones: 'Buen desempeño.',
        },
      },
    })

    const evaluacion = await guardarEvaluacionApi({
      ...evaluacionApi,
      observacionesEvaluacion: 'Buen desempeño.',
      resultado: 'Recomendable',
    })

    expect(fetchFalso.mock.calls[0][1]).toMatchObject({ method: 'PUT' })
    expect(JSON.parse(fetchFalso.mock.calls[0][1].body)).toEqual({
      fechaEntrevista: '2026-10-28',
      resultado: 'Recomendable',
      observaciones: 'Buen desempeño.',
    })
    expect(evaluacion.resultado).toBe('Recomendable')
  })
})
