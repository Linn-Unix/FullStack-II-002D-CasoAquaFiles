import { useEffect, useState } from 'react'
import Encabezado from '../components/Encabezado'
import IndicadorCard from '../components/IndicadorCard'
import { obtenerResumen } from '../services/dashboardService'
import { formatearFecha, obtenerEtapa } from '../utils/candidatos'

function DashboardPage({ candidatos, modoOscuro, alCambiarTema }) {
  // 1. Tres estados para la petición: datos, cargando y error.
  const [resumen, setResumen] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // 2. Pedimos el resumen al abrir la página y cuando cambia el estado de algún candidato.
  //    "firma" resume los candidatos en un texto: si no cambia, no se vuelve a pedir.
  const firma = candidatos.map((candidato) => `${candidato.id}:${candidato.estado}`).join(',')

  useEffect(() => {
    obtenerResumen()
      .then((datos) => {
        setResumen(datos)
        setError('')
      })
      .catch((errorApi) => setError(errorApi.message))
      .finally(() => setCargando(false))
  }, [firma])

  // 3. Etapas a partir de los estados (misma regla que obtenerEtapa).
  const porEstado = resumen?.porEstado ?? {}
  const pendientes = porEstado.REVISION ?? 0
  const finalizadas = (porEstado.FINALIZADO ?? 0) + (porEstado.RECHAZADO ?? 0)
  const total = resumen?.total ?? 0

  const indicadores = [
    { id: 1, valor: total, titulo: 'Candidatos' },
    { id: 2, valor: pendientes, titulo: 'Pendientes' },
    { id: 3, valor: total - pendientes - finalizadas, titulo: 'En proceso' },
    { id: 4, valor: finalizadas, titulo: 'Finalizadas' },
  ]

  // Object.entries convierte {"Operaciones": 4} en [["Operaciones", 4]]
  const porFamilia = Object.entries(resumen?.porFamilia ?? {})
  const porUbicacion = Object.entries(resumen?.porUbicacion ?? {})

  function mostrarDias(valor) {
    return valor === null || valor === undefined ? 'Sin datos' : `${valor} días`
  }

  return (
    <main className="container py-4">
      <Encabezado
        titulo="Dashboard"
        subtitulo="Resumen general del proceso de evaluación psicolaboral."
        modoOscuro={modoOscuro}
        alCambiarTema={alCambiarTema}
      />

      {/* 4. Mensajes de carga y de error */}
      {cargando && <div className="alert alert-info" role="status">Cargando indicadores...</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {resumen && (
        <>
          <section className="row g-3 mb-4">
            {indicadores.map((indicador) => (
              <IndicadorCard key={indicador.id} valor={indicador.valor} titulo={indicador.titulo} />
            ))}
          </section>

          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="panel p-3 h-100">
                <h2 className="h5">Solicitudes por familia de cargo</h2>
                <ul className="list-group list-group-flush">
                  {porFamilia.map(([familia, cantidad]) => (
                    <li key={familia} className="list-group-item d-flex justify-content-between">
                      {familia}
                      <span className="badge rounded-pill badge-postulante">{cantidad}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-md-4">
              <div className="panel p-3 h-100">
                <h2 className="h5">Solicitudes por ubicación</h2>
                <ul className="list-group list-group-flush">
                  {porUbicacion.map(([ubicacion, cantidad]) => (
                    <li key={ubicacion} className="list-group-item d-flex justify-content-between">
                      {ubicacion}
                      <span className="badge rounded-pill badge-postulante">{cantidad}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-md-4">
              <div className="panel p-3 h-100">
                <h2 className="h5">Tiempos promedio</h2>
                <p className="mb-1">Hasta la derivación: <strong>{mostrarDias(resumen.promedioDiasHastaDerivacion)}</strong></p>
                <p className="mb-0">Hasta el cierre: <strong>{mostrarDias(resumen.promedioDiasHastaFinalizacion)}</strong></p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 5. La tabla de solicitudes sigue usando la lista que ya cargó App (rama 13). */}
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
    </main>
  )
}

export default DashboardPage