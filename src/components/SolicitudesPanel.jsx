import { LISTA_ESTADOS } from '../data/candidatos'

// Tabla de solicitudes del supervisor.
// Recibe por props la lista ya filtrada y las funciones que cambian la búsqueda, el filtro y la selección.
function SolicitudesPanel({ candidatos, idSeleccionado, alSeleccionar, busqueda, alBuscar, estadoFiltro, alFiltrar }) {
  return (
    <section className="p-3">
      <div className="d-flex justify-content-end mb-2">
        {/* 1. Mostramos cuántos elementos quedaron después de aplicar los filtros. */}
        <span className="text-secondary small">{candidatos.length} resultado(s)</span>
      </div>

      {/* 2. Inputs controlados por el estado de React (SupervisorPage). */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-8">
          <label className="visually-hidden" htmlFor="buscar-solicitud">Buscar candidato</label>
          <input
            id="buscar-solicitud"
            className="form-control"
            value={busqueda}
            onChange={(evento) => alBuscar(evento.target.value)}
            placeholder="Buscar por nombre, RUT, cargo o ubicación..."
          />
        </div>
        <div className="col-12 col-md-4">
          <label className="visually-hidden" htmlFor="filtrar-estado">Filtrar por estado</label>
          <select
            id="filtrar-estado"
            className="form-select"
            value={estadoFiltro}
            onChange={(evento) => alFiltrar(evento.target.value)}
          >
            <option value="">Todos los estados</option>
            {/* 3. map() crea una opción por cada estado del proceso. */}
            {LISTA_ESTADOS.map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Si no hay resultados mostramos un mensaje. */}
      {candidatos.length === 0 ? (
        <div className="alert alert-warning mb-0">No se encontraron solicitudes.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Candidato</th>
                <th>Cargo</th>
                <th>Estado</th>
                <th className="d-none d-lg-table-cell">Ubicación</th>
              </tr>
            </thead>
            <tbody>
              {/* 5. Creamos una fila por cada candidato. key identifica cada fila. */}
              {candidatos.map((candidato) => (
                <tr
                  key={candidato.id}
                  className={candidato.id === idSeleccionado ? 'selected' : ''}
                  onClick={() => alSeleccionar(candidato.id)}
                >
                  <td><strong>{candidato.nombre}</strong><small>{candidato.rut}</small></td>
                  <td>{candidato.cargo}<small>{candidato.familia}</small></td>
                  <td><span className="badge-status">{candidato.estado}</span></td>
                  <td className="d-none d-lg-table-cell">{candidato.ubicacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default SolicitudesPanel