import { useMemo, useState } from 'react'
import CandidatoCard from '../components/CandidatoCard'
import Encabezado from '../components/Encabezado'
import FichaSupervisor from '../components/FichaSupervisor'
import FormularioPostulacion from '../components/FormularioPostulacion'
import IndicadorCard from '../components/IndicadorCard'
import SolicitudesPanel from '../components/SolicitudesPanel'
import { ESTADOS } from '../data/candidatos'
import { contarPorEstado, filtrarCandidatos } from '../utils/candidatos'

// Página del supervisor técnico (ruta "/supervisor").
// Recibe por props la lista de candidatos y la función para actualizarlos.
function SupervisorPage({ candidatos, actualizarCandidato, alCrearSolicitud, modoOscuro, alCambiarTema }) {
  // 1. Estados de esta página: texto buscado, filtros y candidato seleccionado.
  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [centroFiltro, setCentroFiltro] = useState('')
  const [idSeleccionado, setIdSeleccionado] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mensaje, setMensaje] = useState('')

  function registrarSolicitud(candidato) {
    alCrearSolicitud(candidato)
    setIdSeleccionado(candidato.id)
    setMostrarFormulario(false)
    setMensaje(`Solicitud creada para ${candidato.nombre}.`)
  }

  // 2. useMemo recalcula la lista filtrada solo cuando cambian candidatos, búsqueda o filtros.
  const filtrados = useMemo(
    () => filtrarCandidatos(candidatos, busqueda, estadoFiltro, centroFiltro),
    [candidatos, busqueda, estadoFiltro, centroFiltro],
  )

  // 3. Candidato seleccionado. Si no hay ninguno, usamos el primero de la lista.
  const seleccionado = candidatos.find((candidato) => candidato.id === idSeleccionado) ?? filtrados[0]
  const pendientes = contarPorEstado(candidatos, ESTADOS.REVISION)

  // Las postulaciones nuevas se agregan al inicio de la lista, así que las 3 primeras son las más recientes.
  const recientes = candidatos.slice(0, 3)

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
        titulo="Panel de Reclutamiento"
        subtitulo="Gestión técnica, dossiers y derivaciones."
        modoOscuro={modoOscuro}
        alCambiarTema={alCambiarTema}
      />

      <div className="privilege-banner">
        <i className="bi bi-shield-check" />
        <div>
          <strong>Acceso de Analista de Reclutamiento</strong>
          <small>
            {pendientes > 0
              ? `Tienes ${pendientes} postulación(es) pendiente(s) de revisión técnica.`
              : 'No hay postulaciones pendientes de revisión técnica.'}
          </small>
        </div>
      </div>

      {mensaje && (
        <div className="alert alert-success d-flex justify-content-between align-items-center" role="status">
          <span><i className="bi bi-check-circle-fill" /> {mensaje}</span>
          <button className="btn-close" type="button" aria-label="Cerrar mensaje" onClick={() => setMensaje('')} />
        </div>
      )}

      <div className="d-flex justify-content-end mb-4">
        <button className="btn btn-aqua" type="button" onClick={() => setMostrarFormulario((actual) => !actual)}>
          <i className="bi bi-plus-lg" /> {mostrarFormulario ? 'Cerrar formulario' : 'Nueva solicitud'}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="mb-4">
          <FormularioPostulacion
            alEnviar={registrarSolicitud}
            etiqueta="NUEVA SOLICITUD"
            titulo="Registrar candidato y solicitud de evaluación"
            descripcion="Completa los datos del candidato. La solicitud se crea con la fecha de hoy y en revisión técnica."
            textoBoton="Registrar solicitud"
          />
        </div>
      )}

      <section className="row g-3 mb-4">
        {indicadores.map((indicador) => (
          <IndicadorCard key={indicador.titulo} valor={indicador.valor} titulo={indicador.titulo} />
        ))}
      </section>

      <section className="mb-4">
        <p className="tag mb-1">ÚLTIMAS POSTULACIONES</p>
        <h2 className="h4 mb-3">Postulaciones recientes</h2>
        <div className="row g-3">
          {recientes.map((candidato) => (
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
              centroFiltro={centroFiltro}
              alFiltrarCentro={setCentroFiltro}
            />
          </div>
        </div>
        <div className="col-lg-4">
          {/* key reinicia la ficha (y su edición) cada vez que se selecciona otro candidato. */}
          <FichaSupervisor key={seleccionado?.id} candidato={seleccionado} actualizarCandidato={actualizarCandidato} />
        </div>
      </div>
    </main>
  )
}

export default SupervisorPage