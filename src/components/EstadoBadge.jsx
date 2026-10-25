import { obtenerColorEstado } from '../utils/candidatos'

// Etiqueta con el estado del candidato. Cada etapa del proceso tiene su propio color.
function EstadoBadge({ estado }) {
  return <span className={`badge ${obtenerColorEstado(estado)}`}>{estado}</span>
}

export default EstadoBadge