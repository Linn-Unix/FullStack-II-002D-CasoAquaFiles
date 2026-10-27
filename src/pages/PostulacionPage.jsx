import ArchivoFila from '../components/ArchivoFila'
import ConsultaPostulacion from '../components/ConsultaPostulacion'
import Encabezado from '../components/Encabezado'
import FormularioPostulacion from '../components/FormularioPostulacion'
import TarjetaSeguimiento from '../components/TarjetaSeguimiento'
import { obtenerIniciales } from '../utils/candidatos'

// Página del postulante (ruta "/postulacion").
// "candidato" es su postulación: si todavía no existe, mostramos la consulta por RUT y el formulario.
function PostulacionPage({ candidato, candidatos, alEnviar, alConsultar, alSalir, modoOscuro, alCambiarTema }) {
  return (
    <main className="container py-4">
      <Encabezado
        titulo="Mi postulación"
        subtitulo="Consulta tu currículum y el estado de tu proceso."
        modoOscuro={modoOscuro}
        alCambiarTema={alCambiarTema}
      />

      {/* Renderizado condicional: consulta + formulario, o seguimiento. */}
      {!candidato ? (
        <>
          <ConsultaPostulacion candidatos={candidatos} alEncontrar={alConsultar} />
          <FormularioPostulacion alEnviar={alEnviar} />
        </>
      ) : (
        <>
          <div className="candidate-welcome">
            <div>
              <p className="tag">ESPACIO PERSONAL</p>
              <h2>Hola, {candidato.nombre}</h2>
              <p>Esta es la única postulación visible para tu cuenta.</p>
            </div>
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="private-badge"><i className="bi bi-lock-fill" /> Información privada</span>
              <button className="btn btn-outline-secondary btn-sm" type="button" onClick={alSalir}>
                <i className="bi bi-box-arrow-right" /> Salir
              </button>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-7">
              <div className="panel personal-card">
                <p className="tag">MIS ANTECEDENTES</p>
                <div className="candidate-large">
                  <div className="candidate-initials">{obtenerIniciales(candidato.nombre)}</div>
                  <div>
                    <h2>{candidato.nombre}</h2>
                    <p>{candidato.cargo}</p>
                    <p>{candidato.familia} · <i className="bi bi-geo-alt" /> {candidato.ubicacion}</p>
                  </div>
                </div>
                <hr />
                <ArchivoFila nombre={candidato.nombreCv} icono="bi-file-earmark-pdf-fill" />
                <p className="privacy-copy">No puedes consultar candidatos, notas técnicas ni criterios privados de evaluación.</p>
              </div>
            </div>
            <div className="col-lg-5">
              <TarjetaSeguimiento candidato={candidato} />
            </div>
          </div>
        </>
      )}
    </main>
  )
}

export default PostulacionPage