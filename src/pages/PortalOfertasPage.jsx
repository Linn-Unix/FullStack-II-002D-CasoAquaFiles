import { useEffect, useState } from 'react'
import Encabezado from '../components/Encabezado'
import OfertaCard from '../components/OfertaCard'
import { FAMILIAS } from '../data/candidatos'
import { MODALIDADES } from '../data/ofertas'
import { listarOfertasPublicadas } from '../services/ofertasService'

// Portal público (ruta "/empleos"): cualquier persona ve las ofertas sin iniciar sesión.
function PortalOfertasPage({ modoOscuro, alCambiarTema }) {
  // 1. "texto" es lo que se escribe; "filtros" es lo que realmente se busca en la API.
  const [texto, setTexto] = useState('')
  const [filtros, setFiltros] = useState({ busqueda: '', familia: '', modalidad: '' })
  const [ofertas, setOfertas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // 2. Cada vez que cambian los filtros, pedimos las ofertas de nuevo.
  useEffect(() => {
    let vigente = true
    listarOfertasPublicadas(filtros)
      .then((datos) => {
        if (!vigente) return
        setOfertas(datos)
        setError('')
      })
      .catch((errorApi) => vigente && setError(errorApi.message))
      .finally(() => vigente && setCargando(false))
    // Si los filtros cambian antes de que llegue la respuesta, ignoramos la respuesta antigua.
    return () => {
      vigente = false
    }
  }, [filtros])

  function cambiarFiltro(nombre, valor) {
    setCargando(true)
    setFiltros((actual) => ({ ...actual, [nombre]: valor }))
  }

  function buscar(evento) {
    evento.preventDefault()
    cambiarFiltro('busqueda', texto)
  }

  return (
    <main className="container py-4">
      <Encabezado
        titulo="Trabaja en AquaChile"
        subtitulo="Revisa las oportunidades laborales abiertas y postula en línea."
        modoOscuro={modoOscuro}
        alCambiarTema={alCambiarTema}
      />

      <form className="panel p-3 mb-3" onSubmit={buscar} role="search">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-6">
            <label className="form-label fw-bold w-100">
              Buscar por cargo o palabra clave
              <input className="form-control" value={texto} onChange={(evento) => setTexto(evento.target.value)} placeholder="Ej. técnico" />
            </label>
          </div>
          <div className="col-8 col-md-4">
            <label className="form-label fw-bold w-100">
              Modalidad
              <select className="form-select" value={filtros.modalidad} onChange={(evento) => cambiarFiltro('modalidad', evento.target.value)}>
                <option value="">Todas</option>
                {MODALIDADES.map((modalidad) => <option key={modalidad.valor} value={modalidad.valor}>{modalidad.texto}</option>)}
              </select>
            </label>
          </div>
          <div className="col-4 col-md-2">
            <button className="btn btn-aqua w-100 mb-3" type="submit">Buscar <i className="bi bi-search" /></button>
          </div>
        </div>

        {/* 3. Filtro por categoría con botones. aria-pressed indica cuál está activo. */}
        <div className="d-flex flex-wrap gap-2" aria-label="Categorías">
          {['', ...FAMILIAS].map((familia) => (
            <button
              key={familia || 'todas'}
              type="button"
              className={filtros.familia === familia ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline-primary'}
              aria-pressed={filtros.familia === familia}
              onClick={() => cambiarFiltro('familia', familia)}
            >
              {familia || 'Todas las categorías'}
            </button>
          ))}
        </div>
      </form>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {cargando && <div className="alert alert-info" role="status">Buscando ofertas...</div>}

      {!cargando && !error && (
        <>
          <p>{ofertas.length} oferta(s) encontrada(s)</p>
          {ofertas.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-briefcase" />
              <h2>No hay ofertas con esos filtros</h2>
              <p>Prueba con otra categoría o palabra clave.</p>
            </div>
          ) : (
            <section className="row g-3">
              {ofertas.map((oferta) => <OfertaCard key={oferta.id} oferta={oferta} />)}
            </section>
          )}
        </>
      )}
    </main>
  )
}

export default PortalOfertasPage
