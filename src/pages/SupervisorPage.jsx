import { useMemo, useState } from 'react'
import CandidatoCard from '../components/CandidatoCard'
import Encabezado from '../components/Encabezado'
import FichaSupervisor from '../components/FichaSupervisor'
import IndicadorCard from '../components/IndicadorCard'
import SolicitudesPanel from '../components/SolicitudesPanel'
import { ESTADOS } from '../data/candidatos'
import { contarPorEstado, filtrarCandidatos } from '../utils/candidatos'

// Página del supervisor técnico (ruta "/supervisor").
// Recibe por props la lista de candidatos y la función para actualizarlos.
function SupervisorPage({ candidatos, actualizarCandidato, modoOscuro, alCambiarTema }) {
  // 1. Estados de esta página: texto buscado, estado filtrado y candidato seleccionado.
  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [idSeleccionado, setIdSeleccionado] = useState(null)

  // 2. useMemo recalcula la lista filtrada solo cuando cambian candidatos, búsqueda o filtro.
  const filtrados = useMemo(
    () => filtrarCandidatos(candidatos, busqueda, estadoFiltro),
    [candidatos, busqueda, estadoFiltro],
  )

  // 3. Candidato seleccionado. Si no hay ninguno, usamos el primero de la lista.
  const seleccionado = candidatos.find((candidato) => candidato.id === idSeleccionado) ?? filtrados[0]
  const pendientes = contarPorEstado(candidatos, ESTADOS.REVISION)

  // 4. Indicadores calculados a partir de los datos (se actualizan solos).
  const indicadores = [
    { titulo: 'Candidatos', valor: candidatos.length },
    { titulo: 'En revisión', valor: pendientes },
    { titulo: 'Con el psicólogo', valor: contarPorEstado(candidatos, ESTADOS.DERIVADO) + contarPorEstado(candidatos, ESTADOS.AGENDADO) },
    { titulo: 'Finalizados', valor: contarPorEstado(candidatos, ESTADOS.FINALIZADO) },
  ]

  return (
    <main className="container py-4">
      <Encabezado
        titulo="Panel del Supervisor"
        subtitulo="Gestión técnica, dossiers y derivaciones."
        modoOscuro={modoOscuro}
        alCambiarTema={alCambiarTema}
      />

      <div className="privilege-banner">
        <i className="bi bi-shield-check" />
        <div>
          <strong>Acceso de Supervisor Técnico</strong>
          <small>
            {pendientes > 0
              ? `Tienes ${pendientes} postulación(es) pendiente(s) de revisión técnica.`
              : 'No hay postulaciones pendientes de revisión técnica.'}
          </small>
        </div>
      </div>

      <section className="row g-3 mb-4">
        {indicadores.map((indicador) => (
          <IndicadorCard key={indicador.titulo} valor={indicador.valor} titulo={indicador.titulo} />
        ))}
      </section>

      <section className="mb-4">
        <p className="tag mb-1">CANDIDATOS DESTACADOS</p>
        <h2 className="h4 mb-3">Vista rápida del equipo</h2>
        <div className="row g-3">
          {candidatos.map((candidato) => (
            <CandidatoCard key={candidato.id} nombre={candidato.nombre} cargo={candidato.cargo} estado={candidato.estado} />
          ))}
        </div>
      </section>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>Gestión de solicitudes</h2>
                <p>Busca, filtra y selecciona un candidato para ver su ficha.</p>
              </div>
            </div>
            {/* 5. Enviamos a la tabla los datos y las funciones para cambiar los estados. */}
            <SolicitudesPanel
              candidatos={filtrados}
              idSeleccionado={seleccionado?.id}
              alSeleccionar={setIdSeleccionado}
              busqueda={busqueda}
              alBuscar={setBusqueda}
              estadoFiltro={estadoFiltro}
              alFiltrar={setEstadoFiltro}
            />
          </div>
        </div>
        <div className="col-lg-4">
          <FichaSupervisor candidato={seleccionado} actualizarCandidato={actualizarCandidato} />
        </div>
      </div>
    </main>
  )
}

export default SupervisorPage