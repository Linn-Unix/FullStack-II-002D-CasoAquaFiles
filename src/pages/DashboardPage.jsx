import Encabezado from '../components/Encabezado'
import IndicadorCard from '../components/IndicadorCard'
import { FAMILIAS } from '../data/candidatos'
import { formatearFecha, obtenerEtapa } from '../utils/candidatos'

function DashboardPage({ candidatos, modoOscuro, alCambiarTema }) {
  function contarEtapa(etapa) {
    return candidatos.filter((candidato) => obtenerEtapa(candidato.estado) === etapa).length
  }

  const indicadores = [
    { id: 1, valor: candidatos.length, titulo: 'Candidatos' },
    { id: 2, valor: contarEtapa('Pendiente'), titulo: 'Pendientes' },
    { id: 3, valor: contarEtapa('En proceso'), titulo: 'En proceso' },
    { id: 4, valor: contarEtapa('Finalizada'), titulo: 'Finalizadas' },
  ]

  const porFamilia = FAMILIAS.map((familia) => ({
    familia,
    total: candidatos.filter((candidato) => candidato.familia === familia).length,
  }))

  return (
    <main className="container py-4">
      <Encabezado
        titulo="Dashboard"
        subtitulo="Resumen general del proceso de evaluación psicolaboral."
        modoOscuro={modoOscuro}
        alCambiarTema={alCambiarTema}
      />
      <div className="privilege-banner">
        <i className="bi bi-bar-chart" />
        <div>
          <strong>Resumen del proceso</strong>
          <small>Indicadores generales y etapa de cada solicitud: Pendiente, En proceso o Finalizada.</small>
        </div>
      </div>
      <section className="row g-3 mb-4">
        {indicadores.map((indicador) => (
          <IndicadorCard key={indicador.id} valor={indicador.valor} titulo={indicador.titulo} />
        ))}
      </section>
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="panel p-3 h-100">
            <h2 className="h5">Solicitudes por familia de cargo</h2>
            <ul className="list-group list-group-flush">
              {porFamilia.map((fila) => (
                <li key={fila.familia} className="list-group-item d-flex justify-content-between">
                  {fila.familia}
                  <span className="badge rounded-pill badge-postulante">{fila.total}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="panel">
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr><th>Candidato</th><th>Cargo</th><th>Etapa</th><th className="d-none d-md-table-cell">Responsable</th><th className="d-none d-md-table-cell">Solicitud</th></tr>
                </thead>
                <tbody>
                  {candidatos.map((candidato) => (
                    <tr key={candidato.id}>
                      <td>{candidato.nombre}</td>
                      <td>{candidato.cargo}</td>
                      <td>{obtenerEtapa(candidato.estado)}</td>
                      <td className="d-none d-md-table-cell">{candidato.responsable || 'Sin asignar'}</td>
                      <td className="d-none d-md-table-cell">{formatearFecha(candidato.fechaSolicitud)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default DashboardPage
