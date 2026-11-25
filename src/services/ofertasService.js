import { pedir } from './api'

// 1. Administración (solo analista, con token).
export function listarOfertas() {
  return pedir('/ofertas')
}

export function crearOferta(oferta) {
  return pedir('/ofertas', { metodo: 'POST', cuerpo: oferta })
}

export function actualizarOferta(id, oferta) {
  return pedir(`/ofertas/${id}`, { metodo: 'PUT', cuerpo: oferta })
}

export function publicarOferta(id) {
  return pedir(`/ofertas/${id}/publicar`, { metodo: 'PATCH' })
}

export function despublicarOferta(id) {
  return pedir(`/ofertas/${id}/despublicar`, { metodo: 'PATCH' })
}

export function eliminarOferta(id) {
  return pedir(`/ofertas/${id}`, { metodo: 'DELETE' })
}

// 2. Portal público (sin token).
export function listarOfertasPublicadas({ busqueda = '', familia = '', modalidad = '' } = {}) {
  const parametros = new URLSearchParams()
  if (busqueda.trim()) parametros.set('busqueda', busqueda.trim())
  if (familia) parametros.set('familia', familia)
  if (modalidad) parametros.set('modalidad', modalidad)
  const consulta = parametros.toString()
  return pedir(`/portal/ofertas${consulta ? `?${consulta}` : ''}`)
}

export function obtenerOfertaPublicada(id) {
  return pedir(`/portal/ofertas/${id}`)
}
