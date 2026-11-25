import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Encabezado from '../components/Encabezado'
import FormularioPostulacion from '../components/FormularioPostulacion'
import { registrarPostulacion, subirArchivo } from '../services/candidatosApi'
import { obtenerOfertaPublicada } from '../services/ofertasService'
import { formatearFecha } from '../utils/candidatos'
import { formatearSueldo, separarEnLista } from '../utils/ofertas'

// Detalle público de una oferta (ruta "/empleos/:id") y formulario para postular.
function DetalleOfertaPage({ modoOscuro, alCambiarTema }) {
  // 1. useParams lee el ":id" de la dirección.
  const { id } = useParams()
  const [oferta, setOferta] = useState(null)
  const [error, setError] = useState('')
  const [postulando, setPostulando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const [postulacion, setPostulacion] = useState(null)

  useEffect(() => {
    obtenerOfertaPublicada(id)
      .then(setOferta)
      .catch((errorApi) => setError(errorApi.message))
  }, [id])

  // 2. Primero se registra la postulación y luego se sube el CV a su carpeta.
  async function postular(candidato) {
    setEnviando(true)
    setErrorEnvio('')
    try {
      const registrada = await registrarPostulacion(candidato)
      await subirArchivo(registrada.id, candidato.archivoCv)
      setPostulacion(registrada)
    } catch (errorApi) {
      setErrorEnvio(errorApi.message)
    } finally {
      setEnviando(false)
    }
  }

  if (error) {
    return (
      <main className="container py-5">
        <div className="empty-state">
          <i className="bi bi-briefcase" />
          <h2>Oferta no disponible</h2>
          <p>{error}</p>
          <Link className="btn btn-aqua" to="/empleos">Ver otras ofertas</Link>
        </div>
      </main>
    )
  }

  if (!oferta) return <main className="container py-5"><div className="alert alert-info" role="status">Cargando oferta...</div></main>

  // 3. Secciones de texto que se muestran como lista.
  const secciones = [
    { titulo: 'Funciones principales', texto: oferta.funciones },
    { titulo: 'Requisitos', texto: oferta.requisitos },
    { titulo: 'Beneficios', texto: oferta.beneficios },
  ]

  return (
    <main className="container py-4">
      <Encabezado titulo={oferta.cargo} subtitulo={`${oferta.familia} · ${oferta.ubicacion}`} modoOscuro={modoOscuro} alCambiarTema={alCambiarTema} />
      <Link to="/empleos" className="d-inline-block mb-3"><i className="bi bi-arrow-left" /> Volver a las ofertas</Link>

      <div className="row g-4">
        <div className="col-lg-7">
          <article className="panel p-4">
            <ul className="list-inline mb-3">
              <li className="list-inline-item badge rounded-pill badge-postulante">{oferta.modalidadEtiqueta}</li>
              <li className="list-inline-item"><i className="bi bi-cash-coin" /> {formatearSueldo(oferta.sueldoMinimo, oferta.sueldoMaximo)}</li>
              <li className="list-inline-item"><i className="bi bi-people" /> {oferta.cupos} cupo(s)</li>
              <li className="list-inline-item"><i className="bi bi-calendar-event" /> Publicada el {formatearFecha(oferta.fechaPublicacion)}</li>
            </ul>
            <h2 className="h5">Descripción</h2>
            <p>{oferta.descripcion}</p>
            {secciones.map((seccion) => (
              <section key={seccion.titulo}>
                <h2 className="h5">{seccion.titulo}</h2>
                <ul>
                  {separarEnLista(seccion.texto).map((linea) => <li key={linea}>{linea}</li>)}
                </ul>
              </section>
            ))}
          </article>
        </div>

        <div className="col-lg-5">
          {/* 4. Renderizado condicional: confirmación, formulario o botón para postular. */}
          {postulacion ? (
            <div className="panel p-4" role="status">
              <h2 className="h5 text-success"><i className="bi bi-check-circle-fill" /> ¡Postulación enviada!</h2>
              <p>Gracias, {postulacion.nombre}. Tu CV quedó guardado y el equipo de Reclutamiento revisará tus antecedentes.</p>
              <p className="mb-0">Puedes revisar el estado en <strong>Mi postulación</strong> con tu RUT.</p>
            </div>
          ) : postulando ? (
            <>
              {errorEnvio && <div className="alert alert-danger" role="alert">{errorEnvio}</div>}
              <FormularioPostulacion
                oferta={oferta}
                alEnviar={postular}
                enviando={enviando}
                etiqueta="POSTULAR"
                titulo={`Postular a ${oferta.cargo}`}
                descripcion="Completa tus datos y adjunta tu CV de prueba (PDF o Word, máx. 5 MB)."
              />
            </>
          ) : (
            <div className="panel p-4 text-center">
              <p>¿Te interesa este cargo?</p>
              <button className="btn btn-aqua btn-lg w-100" type="button" onClick={() => setPostulando(true)}>
                Postular <i className="bi bi-send" />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default DetalleOfertaPage
