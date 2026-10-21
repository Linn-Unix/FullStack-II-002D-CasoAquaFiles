import { ESTADOS } from '../data/candidatos'

// 1. Pasos que ve el candidato en su seguimiento.
const PASOS = [ESTADOS.REVISION, ESTADOS.APROBADO, ESTADOS.AGENDADO, ESTADOS.FINALIZADO]

// 2. Según el estado, calculamos cuántos pasos están completos.
function contarPasosCompletos(estado) {
  if (estado === ESTADOS.FINALIZADO) return 4
  if (estado === ESTADOS.AGENDADO) return 3
  if (estado === ESTADOS.APROBADO || estado === ESTADOS.DERIVADO) return 2
  return 1
}

// Recibe por props el candidato que se va a mostrar.
function TarjetaSeguimiento({ candidato }) {
  // 3. Renderizado condicional: si fue rechazado mostramos otro mensaje.
  if (candidato.estado === ESTADOS.RECHAZADO) {
    return (
      <div className="panel process-card">
        <p className="tag">ESTADO DE MI POSTULACIÓN</p>
        <span className="badge-status">Proceso cerrado</span>
        <h2>Seguimiento</h2>
        <p>Tu postulación no continúa en este proceso. Gracias por postular a AquaChile.</p>
      </div>
    )
  }

  const completos = contarPasosCompletos(candidato.estado)

  return (
    <div className="panel process-card">
      <p className="tag">ESTADO DE MI POSTULACIÓN</p>
      <span className="badge-status">{candidato.estado}</span>
      <h2>Seguimiento</h2>

      {/* 4. map() crea un paso por cada elemento de PASOS. */}
      {PASOS.map((paso, indice) => {
        const listo = completos >= indice + 1
        return (
          <div className={listo ? 'process-step done' : 'process-step'} key={paso}>
            <span>{listo ? '✓' : indice + 1}</span>
            <div>
              <strong>{paso}</strong>
              <small>{listo ? 'Completado o en curso' : 'Pendiente'}</small>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TarjetaSeguimiento