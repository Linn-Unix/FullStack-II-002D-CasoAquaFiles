import { useState } from 'react'
import { CENTROS_COSTO, ESTADOS, UBICACIONES } from '../data/candidatos'
import { obtenerIniciales } from '../utils/candidatos'
import ArchivoFila from './ArchivoFila'
import EstadoBadge from './EstadoBadge'

// Ficha del candidato seleccionado en el panel del supervisor.
// Recibe el candidato y la función para actualizarlo (viene de App).
function FichaSupervisor({ candidato, actualizarCandidato }) {
  // 1. Estados para editar los datos: si está en modo edición y la copia que se está editando.
  const [editando, setEditando] = useState(false)
  const [borrador, setBorrador] = useState(null)
  const [errorCargo, setErrorCargo] = useState('')

  // 2. Estados para las observaciones técnicas.
  const [observaciones, setObservaciones] = useState(candidato?.observaciones ?? '')
  const [observacionGuardada, setObservacionGuardada] = useState(false)

  // 3. Si no hay candidato seleccionado, mostramos un mensaje.
  if (!candidato) {
    return (
      <div className="panel expediente">
        <p className="mb-0">Selecciona un candidato de la tabla para ver su ficha.</p>
      </div>
    )
  }

  // 4. Según el estado, decidimos qué botones mostrar.
  const enRevision = candidato.estado === ESTADOS.REVISION
  const puedeDerivar = candidato.estado === ESTADOS.APROBADO

  // 5. Al presionar "Editar datos" copiamos los datos actuales al borrador.
  function empezarEdicion() {
    setBorrador({ cargo: candidato.cargo, ubicacion: candidato.ubicacion, centroCosto: candidato.centroCosto })
    setEditando(true)
  }

  // 6. Cada cambio en un campo actualiza solo esa propiedad del borrador.
  function cambiarBorrador(evento) {
    const { name, value } = evento.target
    setBorrador((actual) => ({ ...actual, [name]: value }))
  }

  // 7. Validamos y guardamos los cambios en la lista de candidatos (App).
  function guardarEdicion() {
    if (borrador.cargo.trim().length < 3) {
      setErrorCargo('El cargo debe tener al menos 3 caracteres.')
      return
    }
    actualizarCandidato(candidato.id, { ...borrador, cargo: borrador.cargo.trim() })
    setErrorCargo('')
    setEditando(false)
  }

  // 8. Guardamos las observaciones técnicas. El psicólogo las verá en el dossier.
  function guardarObservaciones() {
    actualizarCandidato(candidato.id, { observaciones: observaciones.trim() })
    setObservacionGuardada(true)
  }

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

      {/* 9. Renderizado condicional: datos en modo lectura o formulario de edición. */}
      {editando ? (
        <div className="edit-box">
          <label className="form-label small fw-bold w-100">
            Cargo
            <input name="cargo" className={errorCargo ? 'form-control is-invalid' : 'form-control'} value={borrador.cargo} onChange={cambiarBorrador} />
          </label>
          {errorCargo && <span className="field-error">{errorCargo}</span>}

          <label className="form-label small fw-bold w-100">
            Ubicación
            <select name="ubicacion" className="form-select" value={borrador.ubicacion} onChange={cambiarBorrador}>
              {UBICACIONES.map((ubicacion) => (
                <option key={ubicacion}>{ubicacion}</option>
              ))}
            </select>
          </label>

          <label className="form-label small fw-bold w-100">
            Centro de costos
            <select name="centroCosto" className="form-select" value={borrador.centroCosto} onChange={cambiarBorrador}>
              {CENTROS_COSTO.map((centro) => (
                <option key={centro}>{centro}</option>
              ))}
            </select>
          </label>

          <div className="d-flex gap-2">
            <button className="btn btn-aqua btn-sm" type="button" onClick={guardarEdicion}>
              Guardar cambios
            </button>
            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setEditando(false)}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <p><i className="bi bi-geo-alt" /> {candidato.ubicacion}</p>
          <p><i className="bi bi-building" /> {candidato.centroCosto}</p>
          <button className="btn btn-outline-secondary btn-sm mb-3" type="button" onClick={empezarEdicion}>
            <i className="bi bi-pencil" /> Editar datos
          </button>
        </>
      )}

      <ArchivoFila nombre={candidato.nombreCv} icono="bi-file-earmark-pdf" />

      {/* 10. Observaciones técnicas: textarea controlado por el estado "observaciones". */}
      <label className="form-label small fw-bold w-100 mt-3">
        Observaciones técnicas
        <textarea
          className="form-control"
          rows="3"
          value={observaciones}
          onChange={(evento) => {
            setObservaciones(evento.target.value)
            setObservacionGuardada(false)
          }}
          placeholder="Ej. Cumple con la experiencia requerida en el cargo."
        />
      </label>
      <button className="btn btn-outline-secondary btn-sm" type="button" onClick={guardarObservaciones}>
        Guardar observaciones
      </button>
      {observacionGuardada && <small className="d-block mt-1 text-success">✓ Observaciones guardadas</small>}

      {/* 11. En revisión técnica: el supervisor puede aprobar o rechazar. */}
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

      {/* 12. Aprobado: el supervisor puede derivarlo al psicólogo. */}
      {puedeDerivar && (
        <button className="btn btn-aqua w-100 mt-3" type="button" onClick={() => actualizarCandidato(candidato.id, { estado: ESTADOS.DERIVADO })}>
          Derivar al psicólogo <i className="bi bi-send" />
        </button>
      )}

      {/* 13. En cualquier otro estado, la etapa técnica ya terminó. */}
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