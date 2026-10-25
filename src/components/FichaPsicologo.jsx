import { ESTADOS } from '../data/candidatos'
import ArchivoFila from './ArchivoFila'
import EstadoBadge from './EstadoBadge'

// Ficha del candidato seleccionado en el panel del psicólogo.
function FichaPsicologo({ candidato, actualizarCandidato }) {
  const finalizado = candidato.estado === ESTADOS.FINALIZADO

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
    actualizarCandidato(candidato.id, { informe: archivo.name, estado: ESTADOS.FINALIZADO })
  }

  return (
    <div className="panel psych-detail">
      <p className="tag">EVALUACIÓN PSICOLABORAL</p>
      <h2>{candidato.nombre}</h2>
      <p>{candidato.cargo} · {candidato.ubicacion}</p>
      <EstadoBadge estado={candidato.estado} />
      <hr />
      <ArchivoFila nombre={candidato.nombreCv} icono="bi-file-earmark-pdf" />

      <label className="date-field">
        Fecha de entrevista (Teams)
        <input type="date" value={candidato.fechaEntrevista} onChange={agendar} disabled={finalizado} />
      </label>

      {/* 3. Renderizado condicional según el avance del proceso. */}
      {!candidato.fechaEntrevista && (
        <p className="stage-note">Agenda la entrevista para habilitar la carga del informe.</p>
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