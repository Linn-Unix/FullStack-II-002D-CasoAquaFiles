import { useState } from 'react'
import Encabezado from '../components/Encabezado'
import FichaPsicologo from '../components/FichaPsicologo'
import { ESTADOS } from '../data/candidatos'
import { obtenerIniciales } from '../utils/candidatos'

// 1. El psicólogo solo ve candidatos que el supervisor ya derivó.
const ESTADOS_PSICOLOGO = [ESTADOS.DERIVADO, ESTADOS.AGENDADO, ESTADOS.FINALIZADO]

// Página del psicólogo (ruta "/psicologo").
function PsicologoPage({ candidatos, actualizarCandidato, modoOscuro, alCambiarTema }) {
  const [idSeleccionado, setIdSeleccionado] = useState(null)

  // 2. filter() deja solo los candidatos derivados.
  const derivados = candidatos.filter((candidato) => ESTADOS_PSICOLOGO.includes(candidato.estado))
  const seleccionado = derivados.find((candidato) => candidato.id === idSeleccionado) ?? derivados[0]
  const nuevasDerivaciones = derivados.filter((candidato) => candidato.estado === ESTADOS.DERIVADO).length

  return (
    <main className="container py-4">
      <Encabezado
        titulo="Panel Psicolaboral"
        subtitulo="Evaluación psicolaboral de candidatos derivados."
        modoOscuro={modoOscuro}
        alCambiarTema={alCambiarTema}
      />

      {/* 3. Si no hay derivados, mostramos un mensaje vacío. */}
      {derivados.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-inbox" />
          <h2>Sin dossiers derivados</h2>
          <p>El supervisor todavía no ha derivado candidatos aprobados técnicamente.</p>
        </div>
      ) : (
        <>
          <div className="privilege-banner psychologist-banner">
            <i className="bi bi-clipboard2-pulse" />
            <div>
              <strong>Acceso de Psicólogo/a</strong>
              <small>Solo ves candidatos aprobados técnicamente y derivados por el supervisor.</small>
            </div>
            {nuevasDerivaciones > 0 && <span className="new-badge">{nuevasDerivaciones} nueva(s) derivación(es)</span>}
          </div>

          <div className="row g-4">
            <div className="col-lg-5">
              <div className="panel dossier-list">
                <p className="tag">DOSSIERS RECIBIDOS</p>
                <h2>Candidatos derivados</h2>
                {/* 4. map() crea un botón por cada candidato derivado. */}
                {derivados.map((candidato) => (
                  <button
                    key={candidato.id}
                    type="button"
                    className={candidato.id === seleccionado.id ? 'dossier-item active' : 'dossier-item'}
                    onClick={() => setIdSeleccionado(candidato.id)}
                  >
                    <span className="candidate-initials">{obtenerIniciales(candidato.nombre)}</span>
                    <span>
                      <strong>{candidato.nombre}</strong>
                      <small>{candidato.cargo} · {candidato.estado}</small>
                    </span>
                    <i className="bi bi-chevron-right" />
                  </button>
                ))}
              </div>
            </div>
            <div className="col-lg-7">
              <FichaPsicologo candidato={seleccionado} actualizarCandidato={actualizarCandidato} />
            </div>
          </div>
        </>
      )}
    </main>
  )
}

export default PsicologoPage