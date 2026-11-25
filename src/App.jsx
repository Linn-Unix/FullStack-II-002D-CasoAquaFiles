import { useEffect, useState } from 'react'
// Routes agrupa las rutas y Route define qué página se muestra en cada dirección.
import { Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import AppNavbar from './components/AppNavbar'
import RutaProtegida from './components/RutaProtegida'
import { candidatosIniciales } from './data/candidatos'
import { ROLES } from './data/roles'
import DashboardPage from './pages/DashboardPage'
import DetalleOfertaPage from './pages/DetalleOfertaPage'
import InicioPage from './pages/InicioPage'
import LoginPage from './pages/LoginPage'
import NoEncontradaPage from './pages/NoEncontradaPage'
import OfertasAdminPage from './pages/OfertasAdminPage'
import PortalOfertasPage from './pages/PortalOfertasPage'
import PostulacionPage from './pages/PostulacionPage'
import PsicologoPage from './pages/PsicologoPage'
import SupervisorPage from './pages/SupervisorPage'
import { borrarSesion, leerSesion } from './services/sesion'
import {
  adaptarCandidato,
  actualizarCandidatoApi,
  cambiarEstado,
  consultarPostulacion,
  listarCandidatos,
  registrarPostulacion,
  subirArchivo,
} from './services/candidatosApi'
import {
  guardarEvaluacionApi,
  listarEvaluaciones,
  subirInformeApi,
} from './services/evaluacionesService'

// rolInicial permite partir con una sesión ya iniciada (se usa en las pruebas).
function App({ rolInicial = null }) {
  const location = useLocation()
  // 1. Estado principal: la lista de candidatos.
  //    Vive en App para que todas las páginas compartan los mismos datos.
  const [candidatos, setCandidatos] = useState(candidatosIniciales)

  const [evaluaciones, setEvaluaciones] = useState([])
  const [evaluacionesCargadas, setEvaluacionesCargadas] = useState(false)

  // 2. id de la postulación del usuario que entra como postulante.
  //    Si la postulación se encontró en el backend, se guarda completa en postulacionServidor.
  const [idMiPostulacion, setIdMiPostulacion] = useState(null)
  const [postulacionServidor, setPostulacionServidor] = useState(null)

  // 3. Sesión actual: el rol y el nombre de quien entró.
  //    El postulante entra sin cuenta. El personal interno entra con usuario y contraseña.
  const [rol, setRol] = useState(() => rolInicial ?? leerSesion()?.rol ?? null)
  const [nombreUsuario, setNombreUsuario] = useState(() => leerSesion()?.nombre ?? '')
  const [errorApi, setErrorApi] = useState('')

  // 4. Modo oscuro activado o no.
  const [modoOscuro, setModoOscuro] = useState(false)
  const [apiDisponible, setApiDisponible] = useState(false)

  // Solo el analista necesita la lista completa de candidatos.
  // El evaluador trae sus datos desde /evaluaciones (no tiene permiso para /candidatos).
  useEffect(() => {
    const sesion = leerSesion()
    const rutasInternas = ['/supervisor', '/dashboard']
    if (!sesion?.token || !rutasInternas.includes(location.pathname) || rol === ROLES.POSTULANTE || !rol) return

    listarCandidatos()
      .then((datos) => {
        setCandidatos(datos)
        setApiDisponible(true)
      })
      .catch((error) => {
        setApiDisponible(false)
        setErrorApi(error.message)
      })
  }, [location.pathname, rol])

  useEffect(() => {
    if (rol !== ROLES.PSICOLOGO || !leerSesion()?.token) return

    setEvaluacionesCargadas(false)
    listarEvaluaciones()
      .then((datos) => {
        setEvaluaciones(datos)
        setEvaluacionesCargadas(true)
      })
      .catch((error) => setErrorApi(error.message))
  }, [rol])

  // 5. Actualiza los datos de un candidato.
  //    map() recorre la lista y reemplaza solo el candidato con ese id.
  function actualizarCandidato(id, cambios) {
    const candidatoActual = candidatos.find((candidato) => candidato.id === id)
    const actualizado = candidatoActual ? { ...candidatoActual, ...cambios } : null
    setCandidatos((actuales) =>
      actuales.map((candidato) => (candidato.id === id ? actualizado : candidato)),
    )

    if (!leerSesion()?.token || !apiDisponible || !actualizado) return

    const operacion = cambios.estado
      ? cambiarEstado(id, cambios.estado)
      : actualizarCandidatoApi(actualizado)
    operacion
      .then((respuesta) => setCandidatos((actuales) =>
        actuales.map((candidato) => (candidato.id === id ? { ...candidato, ...respuesta } : candidato)),
      ))
      .catch((error) => setErrorApi(error.message))
  }

  async function actualizarEvaluacion(id, cambios, archivo) {
    const actual = evaluaciones.find((evaluacion) => evaluacion.id === id)

    try {
      const actualizada = archivo
        ? await subirInformeApi(id, archivo)
        : await guardarEvaluacionApi({ ...actual, ...cambios })

      setEvaluaciones((lista) =>
        lista.map((evaluacion) =>
          evaluacion.id === id ? actualizada : evaluacion,
        ),
      )
      setErrorApi('')
    } catch (error) {
      setErrorApi(error.message)
    }
  }

  // 6. Agrega una nueva postulación al inicio de la lista.
  function agregarCandidato(candidato) {
    setCandidatos((actuales) => [candidato, ...actuales])
    setIdMiPostulacion(candidato.id)

    registrarPostulacion(candidato)
      .then(async (respuesta) => {
        let actualizado = { ...candidato, ...respuesta }
        if (candidato.archivoCv && actualizado.id) {
          await subirArchivo(actualizado.id, candidato.archivoCv)
        }
        setCandidatos((actuales) => actuales.map((actual) =>
          actual.id === candidato.id ? adaptarCandidato({ ...actualizado, id: actualizado.id }) : actual,
        ))
        setIdMiPostulacion(actualizado.id)
      })
      .catch((error) => setErrorApi(error.message))
  }

  // Busca la postulación por RUT en el backend (no necesita sesión).
  async function consultarEnServidor(rut) {
    const encontrada = await consultarPostulacion(rut)
    setPostulacionServidor(encontrada)
    return encontrada
  }

  function salirDeMiPostulacion() {
    setIdMiPostulacion(null)
    setPostulacionServidor(null)
  }

  function crearSolicitud(candidato) {
    agregarCandidato(candidato)
  }

  // 7. Inicio y cierre de sesión.
  function iniciarSesion(usuario) {
    setRol(usuario.rol)
    setNombreUsuario(usuario.nombre)
    setErrorApi('')
  }

  function entrarComoPostulante() {
    setRol(ROLES.POSTULANTE)
    setNombreUsuario('')
  }

  function cerrarSesion() {
    borrarSesion()
    setRol(null)
    setNombreUsuario('')
    salirDeMiPostulacion()
  }

  const miPostulacion = postulacionServidor ?? candidatos.find((candidato) => candidato.id === idMiPostulacion)

  // Props del modo oscuro que comparten todas las páginas.
  const propsTema = { modoOscuro, alCambiarTema: () => setModoOscuro((actual) => !actual) }

  return (
    <div className={modoOscuro ? 'theme-dark' : ''}>
      <AppNavbar rol={rol} nombreUsuario={nombreUsuario} alCerrarSesion={cerrarSesion} />
      {errorApi && (
        <div className="container mt-3">
          <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
            <span><i className="bi bi-exclamation-triangle-fill" /> {errorApi}</span>
            <button className="btn-close" type="button" aria-label="Cerrar aviso" onClick={() => setErrorApi('')} />
          </div>
        </div>
      )}

      {/* 8. Rutas de la aplicación. RutaProtegida solo deja entrar al rol correspondiente. */}
      <Routes>
        <Route path="/" element={<InicioPage {...propsTema} alEntrarComoPostulante={entrarComoPostulante} />} />
        <Route path="/login" element={<LoginPage {...propsTema} alIniciarSesion={iniciarSesion} />} />
        {/* Portal público: no necesita iniciar sesión. */}
        <Route path="/empleos" element={<PortalOfertasPage {...propsTema} />} />
        <Route path="/empleos/:id" element={<DetalleOfertaPage {...propsTema} />} />
        <Route
          path="/postulacion"
          element={
            <RutaProtegida rolActual={rol} rolesPermitidos={[ROLES.POSTULANTE]}>
              <PostulacionPage
                {...propsTema}
                candidato={miPostulacion}
                candidatos={candidatos}
                alEnviar={agregarCandidato}
                alConsultar={setIdMiPostulacion}
                alConsultarServidor={consultarEnServidor}
                alSalir={salirDeMiPostulacion}
              />
            </RutaProtegida>
          }
        />
        <Route
          path="/supervisor"
          element={
            <RutaProtegida rolActual={rol} rolesPermitidos={[ROLES.SUPERVISOR]}>
              <SupervisorPage {...propsTema} candidatos={candidatos} actualizarCandidato={actualizarCandidato} alCrearSolicitud={crearSolicitud} />
            </RutaProtegida>
          }
        />
        <Route
          path="/psicologo"
          element={
            <RutaProtegida rolActual={rol} rolesPermitidos={[ROLES.PSICOLOGO]}>
              <PsicologoPage
                {...propsTema}
                candidatos={evaluacionesCargadas ? evaluaciones : candidatos}
                actualizarCandidato={actualizarEvaluacion}
              />
            </RutaProtegida>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RutaProtegida rolActual={rol} rolesPermitidos={[ROLES.SUPERVISOR]}>
              <DashboardPage {...propsTema} candidatos={candidatos} />
            </RutaProtegida>
          }
        />
        <Route
          path="/ofertas"
          element={
            <RutaProtegida rolActual={rol} rolesPermitidos={[ROLES.SUPERVISOR]}>
              <OfertasAdminPage {...propsTema} />
            </RutaProtegida>
          }
        />
        {/* "*" atrapa cualquier ruta que no exista. */}
        <Route path="*" element={<NoEncontradaPage />} />
      </Routes>
    </div>
  )
}

export default App
