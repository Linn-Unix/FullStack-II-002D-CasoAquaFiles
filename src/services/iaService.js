import { pedir } from './api'

// Pide a Grok (a través del backend) la sugerencia para un candidato. Solo analista.
export function analizarCandidato(candidatoId) {
  return pedir(`/ia/candidatos/${candidatoId}/analisis`, { metodo: 'POST' })
}
