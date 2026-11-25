import { useCallback, useEffect, useState } from 'react'
import Encabezado from '../components/Encabezado'
import FormularioOferta from '../components/FormularioOferta'
import {
  actualizarOferta,
  crearOferta,
  despublicarOferta,
  eliminarOferta,
  listarOfertas,
  publicarOferta,
} from '../services/ofertasService'
import { formatearFecha } from '../utils/candidatos'
import { formatearSueldo } from '../utils/ofertas'

// Página del analista (ruta "/ofertas"): administrar las ofertas laborales.
function OfertasAdminPage({ modoOscuro, alCambiarTema }) {
  // 1. Estados: la lista, el formulario abierto (null = cerrado) y los mensajes.
  const [ofertas, setOfertas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  // 2. Trae las ofertas desde la API.
  const cargar = useCallback(() => {
    return listarOfertas()
      .then((datos) => setOfertas(datos))
      .catch((errorApi) => setError(errorApi.message))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  // 3. Ejecuta una acción de la API, muestra el aviso y vuelve a cargar la lista.
  async function ejecutar(accion, mensaje) {
    setError('')
    try {
      await accion()
      setAviso(mensaje)
      await cargar()
      return true
    } catch (errorApi) {
      setError(errorApi.message)
      return false
    }
  }

  async function guardar(datos) {
    setGuardando(true)
    const esNueva = editando === 'nueva'
    const listo = await ejecutar(
      () => (esNueva ? crearOferta(datos) : actualizarOferta(editando.id, datos)),
      esNueva ? `Oferta "${datos.cargo}" creada. Publícala para que aparezca en el portal.` : `Oferta "${datos.cargo}" actualizada.`,
    )
    setGuardando(false)
    if (listo) setEditando(null)
  }

  function cambiarPublicacion(oferta) {
    return oferta.publicada
      ? ejecutar(() => despublicarOferta(oferta.id), `"${oferta.cargo}" ya no se muestra en el portal.`)
      : ejecutar(() => publicarOferta(oferta.id), `"${oferta.cargo}" publicada en el portal.`)
  }

  function eliminar(oferta) {
    if (!window.confirm(`¿Eliminar la oferta "${oferta.cargo}"?`)) return
    ejecutar(() => eliminarOferta(oferta.id), `Oferta "${oferta.cargo}" eliminada.`)
  }

  const publicadas = ofertas.filter((oferta) => oferta.publicada).length

  return (
    <main className="container py-4">
      <Encabezado
        titulo="Ofertas laborales"
        subtitulo="Crea, edita y publica las ofertas que verán los postulantes."
        modoOscuro={modoOscuro}
        alCambiarTema={alCambiarTema}
      />

      {aviso && <div className="alert alert-success" role="status">{aviso}</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
        <p className="mb-0">{ofertas.length} oferta(s) · {publicadas} publicada(s)</p>
        {!editando && (
          <button className="btn btn-aqua" type="button" onClick={() => { setAviso(''); setEditando('nueva') }}>
            <i className="bi bi-plus-lg" /> Nueva oferta
          </button>
        )}
      </div>

      {/* 4. Renderizado condicional: el formulario solo aparece al crear o editar. */}
      {editando && (
        <FormularioOferta
          key={editando === 'nueva' ? 'nueva' : editando.id}
          oferta={editando === 'nueva' ? null : editando}
          alGuardar={guardar}
          alCancelar={() => setEditando(null)}
          guardando={guardando}
        />
      )}

      {cargando ? (
        <div className="alert alert-info" role="status">Cargando ofertas...</div>
      ) : (
        <div className="panel">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Cargo</th>
                  <th className="d-none d-md-table-cell">Categoría</th>
                  <th className="d-none d-lg-table-cell">Modalidad</th>
                  <th className="d-none d-lg-table-cell">Sueldo</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ofertas.map((oferta) => (
                  <tr key={oferta.id}>
                    <td>
                      <strong>{oferta.cargo}</strong>
                      <small className="d-block">{oferta.ubicacion} · {oferta.cupos} cupo(s)</small>
                    </td>
                    <td className="d-none d-md-table-cell">{oferta.familia}</td>
                    <td className="d-none d-lg-table-cell">{oferta.modalidadEtiqueta}</td>
                    <td className="d-none d-lg-table-cell">{formatearSueldo(oferta.sueldoMinimo, oferta.sueldoMaximo)}</td>
                    <td>
                      {oferta.publicada ? (
                        <span className="badge text-bg-success">Publicada{oferta.fechaPublicacion ? ` · ${formatearFecha(oferta.fechaPublicacion)}` : ''}</span>
                      ) : (
                        <span className="badge text-bg-secondary">Borrador</span>
                      )}
                    </td>
                    <td className="text-end text-nowrap">
                      <button className="btn btn-sm btn-outline-secondary me-1" type="button" onClick={() => { setAviso(''); setEditando(oferta) }} aria-label={`Editar ${oferta.cargo}`}>
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn btn-sm btn-outline-primary me-1" type="button" onClick={() => cambiarPublicacion(oferta)}>
                        {oferta.publicada ? 'Despublicar' : 'Publicar'}
                      </button>
                      <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => eliminar(oferta)} aria-label={`Eliminar ${oferta.cargo}`}>
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
                {ofertas.length === 0 && (
                  <tr><td colSpan="6" className="text-center">Todavía no hay ofertas. Crea la primera con "Nueva oferta".</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}

export default OfertasAdminPage
