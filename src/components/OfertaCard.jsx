import { Link } from 'react-router-dom'
import { formatearFecha } from '../utils/candidatos'
import { formatearSueldo } from '../utils/ofertas'

// Tarjeta de una oferta en el portal público. Recibe la oferta por props.
function OfertaCard({ oferta }) {
  return (
    <div className="col-12 col-md-6 col-xl-4">
      <article className="panel oferta-card h-100">
        <span className="badge rounded-pill badge-postulante mb-2">{oferta.familia}</span>
        <h3 className="h5">{oferta.cargo}</h3>
        <p className="mb-1"><i className="bi bi-geo-alt" /> {oferta.ubicacion} · {oferta.modalidadEtiqueta}</p>
        <p className="mb-1"><i className="bi bi-cash-coin" /> {formatearSueldo(oferta.sueldoMinimo, oferta.sueldoMaximo)}</p>
        <p className="small text-body-secondary">Publicada el {formatearFecha(oferta.fechaPublicacion)} · {oferta.cupos} cupo(s)</p>
        <Link className="btn btn-outline-primary btn-sm mt-auto" to={`/empleos/${oferta.id}`}>
          Ver detalle <span className="visually-hidden">de {oferta.cargo}</span> <i className="bi bi-arrow-right" />
        </Link>
      </article>
    </div>
  )
}

export default OfertaCard
