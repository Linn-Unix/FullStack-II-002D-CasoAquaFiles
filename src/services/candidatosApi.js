import { ESTADOS } from '../data/candidatos'
import { pedir } from './api'

const ESTADO_DESDE_API = {
  REVISION: ESTADOS.REVISION,
  APROBADO: ESTADOS.APROBADO,
  RECHAZADO: ESTADOS.RECHAZADO,
  DERIVADO: ESTADOS.DERIVADO,
  AGENDADO: ESTADOS.AGENDADO,
  FINALIZADO: ESTADOS.FINALIZADO,
}

const RUTA_ESTADO = {
  [ESTADOS.APROBADO]: 'aprobar',
  [ESTADOS.RECHAZADO]: 'rechazar',
  [ESTADOS.DERIVADO]: 'derivar',
  [ESTADOS.AGENDADO]: 'agendar',
  [ESTADOS.FINALIZADO]: 'finalizar',
}

export function adaptarCandidato(datos) {
  if (!datos) return null
  const estado = ESTADO_DESDE_API[datos.estado] ?? datos.estadoEtiqueta ?? datos.estado
  return {
    ...datos,
    estado,
    estadoApi: datos.estado,
    fechaEntrevista: datos.fechaEntrevista ?? '',
    nombreCv: datos.nombreCv ?? 'CV adjunto',
    informe: datos.informe ?? '',
    resultado: datos.resultado ?? '',
    observacionesEvaluacion: datos.observacionesEvaluacion ?? '',
  }
}

export async function listarCandidatos(filtros = {}) {
  const parametros = new URLSearchParams()
  Object.entries(filtros).forEach(([nombre, valor]) => {
    if (valor) parametros.set(nombre, valor)
  })
  const datos = await pedir(`/candidatos${parametros.toString() ? `?${parametros}` : ''}`)
  if (!Array.isArray(datos)) throw new Error('La API devolvió una lista de candidatos inválida.')
  return datos.map(adaptarCandidato)
}

export async function consultarPostulacion(rut) {
  const datos = await pedir(`/candidatos/consulta?rut=${encodeURIComponent(rut)}`)
  return adaptarCandidato({
    ...datos,
    estado: datos.estado?.name ?? datos.estado,
    estadoEtiqueta: datos.estadoGeneral,
  })
}

export async function registrarPostulacion(candidato) {
  const datos = await pedir('/postulaciones', {
    metodo: 'POST',
    cuerpo: {
      nombre: candidato.nombre,
      rut: candidato.rut,
      correo: candidato.correo,
      telefono: candidato.telefono,
      cargo: candidato.cargo,
      familia: candidato.familia,
      ubicacion: candidato.ubicacion,
      centroCosto: candidato.centroCosto,
      ofertaId: candidato.ofertaId ?? null,
    },
  })
  return { ...candidato, ...adaptarCandidato(datos) }
}

export async function subirArchivo(candidatoId, archivo) {
  const cuerpo = new FormData()
  cuerpo.append('archivo', archivo)
  return pedir(`/postulaciones/${candidatoId}/cv`, { metodo: 'POST', cuerpo })
}

export async function actualizarCandidatoApi(candidato) {
  const datos = await pedir(`/candidatos/${candidato.id}`, {
    metodo: 'PUT',
    cuerpo: {
      nombre: candidato.nombre,
      rut: candidato.rut,
      correo: candidato.correo,
      telefono: candidato.telefono,
      cargo: candidato.cargo,
      familia: candidato.familia,
      ubicacion: candidato.ubicacion,
      centroCosto: candidato.centroCosto,
      responsable: candidato.responsable ?? '',
      observaciones: candidato.observaciones ?? '',
    },
  })
  if (!datos?.id) throw new Error('La API devolvió un candidato inválido.')
  return adaptarCandidato(datos)
}

export async function cambiarEstado(candidatoId, estado) {
  const ruta = RUTA_ESTADO[estado]
  if (!ruta) throw new Error(`No existe una transición para el estado "${estado}".`)
  const datos = await pedir(`/candidatos/${candidatoId}/${ruta}`, { metodo: 'PATCH' })
  if (!datos?.id) throw new Error('La API devolvió un candidato inválido.')
  return adaptarCandidato(datos)
}
