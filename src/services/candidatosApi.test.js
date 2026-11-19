import { describe, expect, it } from 'vitest'
import {
  consultarPostulacion,
  listarCandidatos,
} from './candidatosApi'
import { candidatosApi, simularApi } from '../test/simularApi'

describe('candidatosApi', () => {
  it('envía los filtros al backend', async () => {
    const fetchFalso = simularApi({
      'GET /candidatos': { cuerpo: candidatosApi },
    })

    await listarCandidatos({
      estado: 'RECHAZADO',
      centroCosto: 'Mantención',
    })

    expect(fetchFalso.mock.calls[0][0]).toContain('estado=RECHAZADO')
    expect(fetchFalso.mock.calls[0][0]).toContain('centroCosto=Mantenci%C3%B3n')
  })

  it('adapta la consulta pública de una postulación', async () => {
    simularApi({
      'GET /candidatos/consulta': {
        cuerpo: {
          id: 4,
          nombre: 'Camila Rojas',
          estado: { name: 'REVISION' },
          estadoGeneral: 'En revisión técnica',
        },
      },
    })

    const candidato = await consultarPostulacion('19.876.543-0')

    expect(candidato).toMatchObject({
      id: 4,
      nombre: 'Camila Rojas',
      estado: 'En revisión técnica',
      estadoApi: 'REVISION',
    })
  })
})
