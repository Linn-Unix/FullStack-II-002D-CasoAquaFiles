import { useState } from 'react'
import { analizarCandidato } from '../services/iaService'
import { leerSesion } from '../services/sesion'

// Lista con título; no muestra nada si la lista viene vacía.
function ListaIa({ titulo, elementos }) {
  if (!elementos?.length) return null
  return (
    <>
      <strong className="d-block small mt-2">{titulo}</strong>
      <ul className="small mb-1 ps-3">
        {elementos.map((elemento) => <li key={elemento}>{elemento}</li>)}
      </ul>
    </>
  )
}

// Apoyo de IA (Grok) en la ficha del analista.
// La IA solo sugiere: no aprueba, rechaza ni deriva. La decisión la toma el analista con los botones de la ficha.
function ApoyoIa({ candidatoId }) {
  const [sugerencia, setSugerencia] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // 1. Solo funciona con sesión real y un candidato guardado en el backend.
  if (!leerSesion()?.token || !Number.isInteger(candidatoId)) return null

  async function analizar() {
    setCargando(true)
    setError('')
    try {
      setSugerencia(await analizarCandidato(candidatoId))
    } catch (errorApi) {
      setError(errorApi.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="ia-box mt-3" aria-label="Apoyo de IA">
      <div className="d-flex justify-content-between align-items-center gap-2">
        <strong><i className="bi bi-stars" /> Apoyo de IA (Grok)</strong>
        <button className="btn btn-sm btn-outline-primary" type="button" onClick={analizar} disabled={cargando}>
          {cargando ? 'Analizando...' : sugerencia ? 'Volver a analizar' : 'Analizar CV con IA'}
        </button>
      </div>
      <small className="d-block mt-1">
        Se envía el cargo, los requisitos y el texto del CV <strong>sin nombre, RUT, correo ni teléfono</strong>.
      </small>

      {error && <p className="small text-danger mt-2 mb-0" role="alert">{error}</p>}

      {/* 2. Renderizado condicional: la sugerencia solo aparece después de analizar. */}
      {sugerencia && (
        <div className="mt-2">
          <div className="d-flex align-items-center gap-2">
            <span className="small">Puntuación orientativa</span>
            <div className="progress flex-grow-1" role="progressbar" aria-label="Puntuación orientativa" aria-valuenow={sugerencia.puntaje} aria-valuemin="0" aria-valuemax="100">
              <div className="progress-bar" style={{ width: `${sugerencia.puntaje}%` }} />
            </div>
            <strong>{sugerencia.puntaje}/100</strong>
          </div>
          <p className="small mt-2 mb-1">{sugerencia.resumen}</p>
          {!sugerencia.cvAnalizado && <p className="small text-warning-emphasis mb-1">No se pudo leer el CV (solo PDF): la sugerencia usa solo los datos del cargo.</p>}
          <ListaIa titulo="Fortalezas" elementos={sugerencia.fortalezas} />
          <ListaIa titulo="Brechas o información faltante" elementos={sugerencia.brechas} />
          <ListaIa titulo="Preguntas sugeridas para la entrevista" elementos={sugerencia.preguntas} />
          <details className="small">
            <summary>Criterios usados por la IA</summary>
            <ul className="mb-1 ps-3">
              {sugerencia.criterios.map((criterio) => <li key={criterio}>{criterio}</li>)}
            </ul>
          </details>
          <div className="alert alert-warning small py-2 mt-2 mb-0">
            <i className="bi bi-exclamation-triangle" /> {sugerencia.advertencia} <strong>Revisión humana obligatoria.</strong>
          </div>
          <small className="d-block text-body-secondary mt-1">Modelo: {sugerencia.modelo}</small>
        </div>
      )}
    </section>
  )
}

export default ApoyoIa
