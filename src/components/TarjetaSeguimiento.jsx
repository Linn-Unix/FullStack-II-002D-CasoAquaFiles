import { ESTADOS } from '../data/candidatos'
import { formatearFecha, obtenerEstadoPostulante } from '../utils/candidatos'

// 1. Pasos que ve el postulante. Son menos que los estados internos,
//    para no mostrarle las decisiones de RR. HH. ni del psicólogo.
const PASOS = ['En revisión técnica', 'Agendado', 'Proceso finalizado']

// Seguimiento de la postulación. Recibe por props el candidato.
function TarjetaSeguimiento({ candidato }) {
  // 2. Traducimos el estado interno al estado que puede ver el postulante.
  const estadoVisible = obtenerEstadoPostulante(candidato.estado)

  // 3. Renderizado condicional: si la postulación se cerró, mostramos solo un mensaje.
  if (candidato.estado === ESTADOS.RECHAZADO) {
    return (
      <div className="panel process-card">
        <p className="tag">ESTADO DE MI POSTULACIÓN</p>
        <span className="badge badge-postulante">{estadoVisible}</span>
        <h2>Seguimiento</h2>
        <p>Tu postulación no continúa en este proceso. Gracias por postular a AquaChile.</p>
      </div>
    )
  }

  // 4. indexOf() devuelve en qué paso va el postulante (0, 1 o 2).
  const pasoActual = PASOS.indexOf(estadoVisible)
  const terminado = candidato.estado === ESTADOS.FINALIZADO

  return (
    <div className="panel process-card">
      <p className="tag">ESTADO DE MI POSTULACIÓN</p>
      <span className="badge badge-postulante">{estadoVisible}</span>
      <h2>Seguimiento</h2>

      {/* 5. Si la entrevista está agendada, le mostramos la fecha al postulante. */}
      {candidato.estado === ESTADOS.AGENDADO && candidato.fechaEntrevista && (
        <p className="stage-note">
          Tu entrevista psicolaboral es el {formatearFecha(candidato.fechaEntrevista)} y se realizará por Teams.
        </p>
      )}

      {/* 6. map() crea un paso por cada elemento de PASOS. */}
      {PASOS.map((paso, indice) => {
        const listo = indice <= pasoActual
        const detalle = indice < pasoActual || terminado ? 'Completado' : indice === pasoActual ? 'En curso' : 'Pendiente'
        return (
          <div className={listo ? 'process-step done' : 'process-step'} key={paso}>
            <span>{listo ? '✓' : indice + 1}</span>
            <div>
              <strong>{paso}</strong>
              <small>{detalle}</small>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TarjetaSeguimiento
