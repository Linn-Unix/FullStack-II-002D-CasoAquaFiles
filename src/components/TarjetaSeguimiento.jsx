import { ESTADOS } from '../data/candidatos'
import { formatearFecha, obtenerEstadoPostulante } from '../utils/candidatos'

const PASOS = ['En revisión técnica', 'Agendado', 'Proceso finalizado']

function TarjetaSeguimiento({ candidato }) {
  const estadoVisible = obtenerEstadoPostulante(candidato.estado)
  const aprobadoFinal = candidato.estado === ESTADOS.FINALIZADO
  const rechazado = candidato.estado === ESTADOS.RECHAZADO

  // Determinamos hasta qué paso llegó si fue rechazado:
  // Si tiene fecha de entrevista o evaluación psicológica, llegó hasta el paso 1 ("Agendado").
  // Si no, quedó en el paso 0 ("En revisión técnica").
  const pasoRechazo = candidato.fechaEntrevista || candidato.observacionPsicologo ? 1 : 0
  const pasoActual = rechazado ? pasoRechazo : PASOS.indexOf(estadoVisible)

  return (
    <div className="panel process-card">
      <p className="tag">ESTADO DE MI POSTULACIÓN</p>
      
      {/* Badge superior con color según resultado */}
      <span
        className={`badge ${
          aprobadoFinal
            ? 'bg-success text-white'
            : rechazado
            ? 'bg-danger text-white'
            : 'badge-postulante'
        }`}
      >
        {aprobadoFinal ? '✓ Seleccionado / Aprobado' : rechazado ? '✕ No seleccionado' : estadoVisible}
      </span>

      <h2 className="mt-2">Seguimiento</h2>

      {/* TICKET / BANNER DE RESOLUCIÓN FINAL */}
      {aprobadoFinal && (
        <div className="alert alert-success d-flex align-items-start gap-2 mt-3 mb-2" role="alert">
          <i className="bi bi-check-circle-fill fs-5" />
          <div>
            <strong>¡Visto bueno aprobado!</strong>
            <p className="mb-0 small">
              Has superado correctamente todas las etapas técnicas y psicolaborales. Pronto nos pondremos en contacto contigo.
            </p>
          </div>
        </div>
      )}

      {rechazado && (
        <div className="alert alert-danger d-flex align-items-start gap-2 mt-3 mb-2" role="alert">
          <i className="bi bi-x-circle-fill fs-5" />
          <div>
            <strong>Proceso cerrado — No continúa</strong>
            <p className="mb-0 small">
              Tu postulación no avanzó en la etapa de <strong>{PASOS[pasoRechazo]}</strong>. Gracias por participar en AquaChile.
            </p>
          </div>
        </div>
      )}

      {/* Si la entrevista está agendada y sigue en curso, mostramos la fecha */}
      {candidato.estado === ESTADOS.AGENDADO && candidato.fechaEntrevista && (
        <p className="stage-note">
          Tu entrevista psicolaboral es el {formatearFecha(candidato.fechaEntrevista)} y se realizará por Teams.
        </p>
      )}

      {/* Cuadrícula de pasos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
        {PASOS.map((paso, indice) => {
          const esPasoFallo = rechazado && indice === pasoRechazo
          const listo = !esPasoFallo && (indice < pasoActual || (!rechazado && indice <= pasoActual))
          
          let detalle = 'Pendiente'
          let icono = indice + 1

          if (esPasoFallo) {
            detalle = 'No superado'
            icono = '✕'
          } else if (rechazado && indice > pasoRechazo) {
            detalle = 'No aplica'
            icono = '—'
          } else if (indice < pasoActual || aprobadoFinal) {
            detalle = 'Completado'
            icono = '✓'
          } else if (indice === pasoActual) {
            detalle = 'En curso'
            icono = '✓'
          }

          return (
            <div
              className={listo ? 'process-step done m-0' : 'process-step m-0'}
              style={esPasoFallo ? { borderColor: '#dc3545', backgroundColor: 'rgba(220, 53, 69, 0.08)' } : undefined}
              key={paso}
            >
              <span style={esPasoFallo ? { backgroundColor: '#dc3545', color: '#fff' } : undefined}>
                {icono}
              </span>
              <div>
                <strong>{paso}</strong>
                <small className={esPasoFallo ? 'text-danger fw-semibold' : ''}>{detalle}</small>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TarjetaSeguimiento