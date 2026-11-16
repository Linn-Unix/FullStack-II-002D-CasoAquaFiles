import EstadoBadge from './EstadoBadge'

function CandidatoCard({ nombre, cargo, estado }) {
  return (
    <div className="col-12 col-md-6 col-xl-4">
      <div className="card h-100 candidate-card">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h3 className="h5 mb-1">{nombre}</h3>
            <p className="text-secondary mb-0 small">{cargo}</p>
          </div>
          <div className="text-end">
            <EstadoBadge estado={estado} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CandidatoCard