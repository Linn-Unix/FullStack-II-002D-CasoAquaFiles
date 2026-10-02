function SolicitudesPanel({ solicitudes, selectedId, onSelect, search, setSearch }) {
  return (
    <section className="mt-4">
      <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
        <div>
          <p className="tag mb-1">SEGUIMIENTO DEL PIPELINE</p>
          <h2 className="h4 mb-0">Solicitudes recientes</h2>
        </div>
        <button className="btn btn-primary" type="button">
          Nueva solicitud
        </button>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-8">
          <label className="visually-hidden" htmlFor="buscar-solicitud">Buscar candidato</label>
          <input id="buscar-solicitud" className="form-control" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar candidato..." />
        </div>
        <div className="col-12 col-md-4">
          <label className="visually-hidden" htmlFor="filtrar-estado">Filtrar por estado</label>
          <select id="filtrar-estado" className="form-select" defaultValue="">
            <option value="">Todos los estados</option>
            <option>Pendiente</option>
            <option>En proceso</option>
            <option>Finalizada</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Candidato</th>
              <th>Cargo</th>
              <th>Estado</th>
              <th className="d-none d-lg-table-cell">Responsable</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((solicitud) => (
              <tr
                key={solicitud.id}
                className={solicitud.id === selectedId ? 'selected' : ''}
                onClick={() => onSelect(solicitud.id)}
              >
                <td><strong>{solicitud.candidato}</strong><small>{solicitud.ubicacion}</small></td>
                <td>{solicitud.cargo}<small>{solicitud.familia}</small></td>
                <td><span className="badge-status">{solicitud.estado}</span></td>
                <td className="d-none d-lg-table-cell">{solicitud.responsable}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default SolicitudesPanel