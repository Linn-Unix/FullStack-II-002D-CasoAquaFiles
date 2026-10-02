function CandidatoCard({ nombre, cargo, estado }) {
  return (
    <div className="col-12 col-md-6 col-xl-4">
      <div className="card h-100 candidate-card">
        <div className="card-body">
          <h3 className="h5">{nombre}</h3>
          <p className="text-secondary mb-2">{cargo}</p>
          <span className="badge text-bg-secondary">{estado}</span>
        </div>
      </div>
    </div>
  )
}

export default CandidatoCard