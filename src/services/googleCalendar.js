// Integración con Google Calendar (basada en el ejemplo "aqua-calendar" del profesor).
// Crea la entrevista en el calendario del evaluador, con enlace de Google Meet e invitación al candidato.

const URL_EVENTOS = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all'
const PERMISO = 'https://www.googleapis.com/auth/calendar.events'
const DURACION_MINUTOS = 30

export function googleConfigurado() {
  return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)
}

// 1. Pide a Google un token de acceso. Google muestra su propia ventana de permiso.
function solicitarToken() {
  return new Promise((resolver, rechazar) => {
    if (!window.google?.accounts?.oauth2) {
      rechazar(new Error('No se cargó Google. Revisa tu conexión e inténtalo de nuevo.'))
      return
    }
    window.google.accounts.oauth2
      .initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: PERMISO,
        callback: ({ access_token: token }) => (token ? resolver(token) : rechazar(new Error('Acceso denegado.'))),
        error_callback: () => rechazar(new Error('Autorización cancelada.')),
      })
      .requestAccessToken()
  })
}

// 2. Arma el evento: 30 minutos, con Google Meet y el candidato como invitado.
export function armarEvento({ nombre, correo, cargo, inicio }) {
  const fin = new Date(inicio.getTime() + DURACION_MINUTOS * 60 * 1000)
  return {
    summary: `Entrevista psicolaboral - ${nombre}`,
    description: `Entrevista para el cargo ${cargo} (AquaChile).`,
    start: { dateTime: inicio.toISOString() },
    end: { dateTime: fin.toISOString() },
    attendees: correo ? [{ email: correo }] : [],
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  }
}

// 3. Valida la fecha, pide permiso y crea el evento. Devuelve el evento creado por Google.
export async function crearEventoEntrevista(datos) {
  if (Number.isNaN(datos.inicio.getTime()) || datos.inicio <= new Date()) {
    throw new Error('Selecciona una fecha y hora futura.')
  }
  const token = await solicitarToken()
  const respuesta = await fetch(URL_EVENTOS, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(armarEvento(datos)),
  })
  const evento = await respuesta.json()
  if (!respuesta.ok) throw new Error(evento.error?.message || 'No se pudo crear el evento en Google Calendar.')
  return evento
}
