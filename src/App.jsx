import { useState } from 'react'
// Routes agrupa las rutas y Route define qué página se muestra en cada dirección.
import { Route, Routes } from 'react-router-dom'
import './App.css'
import AppNavbar from './components/AppNavbar'
import RutaProtegida from './components/RutaProtegida'
import { candidatosIniciales } from './data/candidatos'
import { ROLES } from './data/roles'
import DashboardPage from './pages/DashboardPage'
import InicioPage from './pages/InicioPage'
import NoEncontradaPage from './pages/NoEncontradaPage'
import PostulacionPage from './pages/PostulacionPage'
import PsicologoPage from './pages/PsicologoPage'
import SupervisorPage from './pages/SupervisorPage'

// rolInicial permite partir con un rol ya elegido (se usa en las pruebas).
function App({ rolInicial = null }) {
  // 1. Estado principal: la lista de candidatos.
  //    Vive en App para que todas las páginas compartan los mismos datos.
  const [candidatos, setCandidatos] = useState(candidatosIniciales)

  // 2. id de la postulación del usuario que entra como postulante.
  const [idMiPostulacion, setIdMiPostulacion] = useState(null)
  const [rol, setRol] = useState(rolInicial)

  // 3. Modo oscuro activado o no.
  const [modoOscuro, setModoOscuro] = useState(false)

  // 4. Actualiza los datos de un candidato.
  //    map() recorre la lista y reemplaza solo el candidato con ese id.
  function actualizarCandidato(id, cambios) {
    setCandidatos((actuales) =>
      actuales.map((candidato) => (candidato.id === id ? { ...candidato, ...cambios } : candidato)),
    )
  }

  // 5. Agrega una nueva postulación al inicio de la lista.
  function agregarCandidato(candidato) {
    setCandidatos((actuales) => [candidato, ...actuales])
    setIdMiPostulacion(candidato.id)
  }

  function crearSolicitud(candidato) {
    setCandidatos((actuales) => [candidato, ...actuales])
  }

  const miPostulacion = candidatos.find((candidato) => candidato.id === idMiPostulacion)

  // Props del modo oscuro que comparten todas las páginas.
  const propsTema = { modoOscuro, alCambiarTema: () => setModoOscuro((actual) => !actual) }

  return (
    <div className={modoOscuro ? 'theme-dark' : ''}>
      <AppNavbar rol={rol} />

      {/* 6. Rutas de la aplicación. RutaProtegida solo deja entrar al rol correspondiente. */}
      <Routes>
        <Route path="/" element={<InicioPage {...propsTema} alElegirRol={setRol} />} />
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
                alSalir={() => setIdMiPostulacion(null)}
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
              <PsicologoPage {...propsTema} candidatos={candidatos} actualizarCandidato={actualizarCandidato} />
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
        {/* "*" atrapa cualquier ruta que no exista. */}
        <Route path="*" element={<NoEncontradaPage />} />
      </Routes>
    </div>
  )
}

export default App
