import { ESTADOS } from '../data/candidatos'
import { pedir } from './api'

// 1. Convierte una evaluación del backend al formato que ya usa PsicologoPage.
//    "id" es el id de la EVALUACIÓN (lo usa la API); "candidatoId" queda guardado aparte.
export function adaptarEvaluacion(dato) {
  return {
    id: dato.id,
    candidatoId: dato.candidatoId,
    nombre: dato.nombre,
    rut: dato.rut,
    cargo: dato.cargo,
    familia: dato.familia,
    ubicacion: dato.ubicacion,
    centroCosto: dato.centroCosto,
    responsable: dato.responsable ?? '',
    fechaSolicitud: dato.fechaSolicitud,
    estado: ESTADOS[dato.estado],
    observaciones: dato.observacionesAnalista ?? '',
    nombreCv: dato.nombreCv ?? '',
    fechaEntrevista: dato.fechaEntrevista ?? '',
    resultado: dato.resultado ?? '',
    observacionesEvaluacion: dato.observaciones ?? '',
    informe: dato.nombreInforme ?? '',
  }
}

export async function listarEvaluaciones() {
  const datos = await pedir('/evaluaciones')
  return datos.map(adaptarEvaluacion)
}

// 2. Guarda fecha, resultado y observaciones (la API los recibe juntos).
export async function guardarEvaluacionApi(evaluacion) {
  const cuerpo = {
    fechaEntrevista: evaluacion.fechaEntrevista || null,
    resultado: evaluacion.resultado || null,
    observaciones: evaluacion.observacionesEvaluacion || null,
  }
  const dato = await pedir(`/evaluaciones/${evaluacion.id}`, { metodo: 'PUT', cuerpo })
  return adaptarEvaluacion(dato)
}

// 3. Sube el informe; el backend deja el proceso FINALIZADO.
export async function subirInformeApi(id, archivo) {
  const formulario = new FormData()
  formulario.append('archivo', archivo)
  const dato = await pedir(`/evaluaciones/${id}/informe`, { metodo: 'POST', cuerpo: formulario })
  return adaptarEvaluacion(dato)
}