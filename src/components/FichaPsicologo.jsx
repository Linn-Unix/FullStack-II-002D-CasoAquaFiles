import { useState } from 'react'
import { ESTADOS, RESULTADOS } from '../data/candidatos'
import ArchivoFila from './ArchivoFila'
import EstadoBadge from './EstadoBadge'

// Ficha del candidato seleccionado en el panel del psicólogo.
function FichaPsicologo({ candidato, actualizarCandidato }) {
  const finalizado = candidato.estado === ESTADOS.FINALIZADO
  const [resultado, setResultado] = useState(candidato.resultado ?? '')
  const [notas, setNotas] = useState(candidato.observacionesEvaluacion ?? '')
  const [error, setError] = useState('')
  const [guardada, setGuardada] = useState(false)

  // 1. Al elegir una fecha, el candidato pasa a "Agendado".
  //    Si se borra la fecha, vuelve a "Derivado a psicólogo".
  function agendar(evento) {
    const fecha = evento.target.value
    actualizarCandidato(candidato.id, { fechaEntrevista: fecha, estado: fecha ? ESTADOS.AGENDADO : ESTADOS.DERIVADO })
  }

  // 2. Al subir el informe, el proceso queda finalizado.
  function subirInforme(evento) {
    const archivo = evento.target.files[0]
    if (!archivo) return
    if (!candidato.resultado) {
      setError('Guarda el resultado de la evaluación antes de subir el informe.')
      return
    }
    actualizarCandidato(candidato.id, { informe: archivo.name, estado: ESTADOS.FINALIZADO })
  }

  function guardarEvaluacion() {
    if (!resultado) {
      setError('Selecciona el resultado de la evaluación.')
      return
    }
    actualizarCandidato(candidato.id, { resultado, observacionesEvaluacion: notas.trim() })
    setError('')
    setGuardada(true)
  }

  return (
    <div className="panel psych-detail">
      <p className="tag">EVALUACIÓN PROFESIONAL</p>
      <h2>{candidato.nombre}</h2>
      <p>{candidato.cargo} · {candidato.ubicacion}</p>
      <EstadoBadge estado={candidato.estado} />
      <hr />
      <ArchivoFila nombre={candidato.nombreCv} icono="bi-file-earmark-pdf" />

      {/* Observaciones del supervisor: el psicólogo solo puede leerlas. */}
      <div className="stage-note">
        <strong className="d-block mb-1">Observaciones técnicas del supervisor</strong>
        {candidato.observaciones || 'Sin observaciones.'}
      </div>

      <label className="date-field">
        Fecha de entrevista (Teams)
        <input type="date" value={candidato.fechaEntrevista} onChange={agendar} disabled={finalizado} />
      </label>

      {/* 3. Renderizado condicional según el avance del proceso. */}
      {!candidato.fechaEntrevista && (
        <p className="stage-note">Agenda la entrevista para habilitar la carga del informe.</p>
      )}

      {candidato.fechaEntrevista && (
        <>
          <label className="form-label small fw-bold w-100">
            Resultado de la evaluación
            <select
              className="form-select"
              value={resultado}
              disabled={finalizado}
              onChange={(evento) => {
                setResultado(evento.target.value)
                setGuardada(false)
                setError('')
              }}
            >
              <option value="">Selecciona un resultado</option>
              {RESULTADOS.map((opcion) => <option key={opcion}>{opcion}</option>)}
            </select>
          </label>
          <label className="form-label small fw-bold w-100">
            Observaciones de la evaluación
            <textarea
              className="form-control"
              rows="3"
              value={notas}
              disabled={finalizado}
              onChange={(evento) => {
                setNotas(evento.target.value)
                setGuardada(false)
              }}
              placeholder="Escribe las observaciones de la evaluación."
            />
          </label>
          {!finalizado && (
            <>
              <button className="btn btn-outline-secondary btn-sm mb-3" type="button" onClick={guardarEvaluacion}>
                Guardar evaluación
              </button>
              {error && <span className="field-error d-block mb-2">{error}</span>}
              {guardada && <small className="d-block mb-2 text-success">Evaluación guardada</small>}
            </>
          )}
        </>
      )}

      {candidato.fechaEntrevista && !finalizado && (
        <label className="upload-field">
          <i className="bi bi-file-earmark-arrow-up" /> Subir informe psicolaboral final
          <input type="file" accept=".pdf,.doc,.docx" onChange={subirInforme} />
        </label>
      )}

      {finalizado && (
        <p className="completed-note">
          <i className="bi bi-check-circle-fill" /> {candidato.informe} · proceso finalizado
        </p>
      )}

      <small className="restriction">
        <i className="bi bi-lock" /> El psicólogo no puede modificar la calificación técnica ni eliminar candidatos.
      </small>
    </div>
  )
}

export default FichaPsicologo