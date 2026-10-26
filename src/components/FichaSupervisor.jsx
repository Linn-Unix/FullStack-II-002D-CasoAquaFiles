import { ESTADOS } from '../data/candidatos'
import { obtenerIniciales } from '../utils/candidatos'
import ArchivoFila from './ArchivoFila'
import EstadoBadge from './EstadoBadge'

// Ficha del candidato seleccionado en el panel del supervisor.
// Recibe el candidato y la función para actualizarlo (viene de App).
function FichaSupervisor({ candidato, actualizarCandidato }) {
  // 1. Si no hay candidato seleccionado, mostramos un mensaje.
  if (!candidato) {
    return (
      <div className="panel expediente">
        <p className="mb-0">Selecciona un candidato de la tabla para ver su ficha.</p>
      </div>
    )
  }

  // 2. Según el estado, decidimos qué botones mostrar.
  const enRevision = candidato.estado === ESTADOS.REVISION
  const puedeDerivar = candidato.estado === ESTADOS.APROBADO

  return (
    <div className="panel expediente">
      <p className="tag">FICHA TÉCNICA Y DOSSIER</p>
      <div className="candidate-initials">{obtenerIniciales(candidato.nombre)}</div>
      <h2>{candidato.nombre}</h2>
      <p>{candidato.cargo} · {candidato.familia}</p>
      <EstadoBadge estado={candidato.estado} />
      <hr />
      <p><i className="bi bi-person-vcard" /> {candidato.rut}</p>
      <p><i className="bi bi-envelope" /> {candidato.correo}</p>
      <p><i className="bi bi-geo-alt" /> {candidato.ubicacion}</p>
      <ArchivoFila nombre={candidato.nombreCv} icono="bi-file-earmark-pdf" />

      {/* 3. En revisión técnica: el supervisor puede aprobar o rechazar. */}
      {enRevision && (
        <div className="d-grid gap-2 mt-3">
          <button className="btn btn-aqua" type="button" onClick={() => actualizarCandidato(candidato.id, { estado: ESTADOS.APROBADO })}>
            Aprobar etapa técnica <i className="bi bi-check-lg" />
          </button>
          <button className="btn btn-outline-danger" type="button" onClick={() => actualizarCandidato(candidato.id, { estado: ESTADOS.RECHAZADO })}>
            Rechazar <i className="bi bi-x-lg" />
          </button>
        </div>
      )}

      {/* 4. Aprobado: el supervisor puede derivarlo al psicólogo. */}
      {puedeDerivar && (
        <button className="btn btn-aqua w-100 mt-3" type="button" onClick={() => actualizarCandidato(candidato.id, { estado: ESTADOS.DERIVADO })}>
          Derivar al psicólogo <i className="bi bi-send" />
        </button>
      )}

      {/* 5. En cualquier otro estado, la etapa técnica ya terminó. */}
      {!enRevision && !puedeDerivar && (
        <p className="stage-note">Etapa técnica cerrada: {candidato.estado}.</p>
      )}

      <small className="restriction">
        <i className="bi bi-info-circle" /> No puedes editar el informe psicolaboral privado.
      </small>
    </div>
  )
}

export default FichaSupervisor