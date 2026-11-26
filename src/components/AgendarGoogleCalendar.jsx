import { useState } from 'react'
import { crearEventoEntrevista, googleConfigurado } from '../services/googleCalendar'

// Botón para crear la entrevista en Google Calendar con enlace de Google Meet.
// Recibe el candidato y la fecha de entrevista ya agendada en AquaFiles.
function AgendarGoogleCalendar({ candidato }) {
  // 1. La hora parte a las 10:00 del día agendado; el evaluador puede cambiarla.
  const [inicio, setInicio] = useState(`${candidato.fechaEntrevista}T10:00`)
  const [mensaje, setMensaje] = useState('')
  const [evento, setEvento] = useState(null)
  const [creando, setCreando] = useState(false)

  if (!googleConfigurado()) {
    return (
      <p className="stage-note small">
        <i className="bi bi-calendar-x" /> Google Calendar no está configurado (falta VITE_GOOGLE_CLIENT_ID).
      </p>
    )
  }

  async function crear() {
    setCreando(true)
    setMensaje('')
    try {
      const creado = await crearEventoEntrevista({
        nombre: candidato.nombre,
        correo: candidato.correo,
        cargo: candidato.cargo,
        inicio: new Date(inicio),
      })
      setEvento(creado)
      setMensaje('Entrevista creada en Google Calendar.')
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setCreando(false)
    }
  }

  return (
    <div className="stage-note">
      <strong className="d-block mb-2"><i className="bi bi-google" /> Google Calendar y Meet</strong>
      <label className="form-label small fw-bold w-100">
        Fecha y hora de la entrevista
        <input className="form-control" type="datetime-local" value={inicio} onChange={(evento) => setInicio(evento.target.value)} />
      </label>
      <button className="btn btn-outline-primary btn-sm" type="button" onClick={crear} disabled={creando}>
        {creando ? 'Creando...' : 'Crear evento con Google Meet'}
      </button>
      {candidato.correo && <small className="d-block mt-1">Se enviará una invitación a {candidato.correo}.</small>}
      {mensaje && <p className="small mt-2 mb-1" role="status">{mensaje}</p>}
      {/* 2. Renderizado condicional: los enlaces solo aparecen si Google creó el evento. */}
      {evento && (
        <div className="small">
          <a href={evento.htmlLink} target="_blank" rel="noreferrer">Ver en Google Calendar</a>
          {evento.hangoutLink && (
            <> · <a href={evento.hangoutLink} target="_blank" rel="noreferrer">Entrar a Google Meet</a></>
          )}
        </div>
      )}
    </div>
  )
}

export default AgendarGoogleCalendar
