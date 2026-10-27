import { useState } from 'react'
// Routes agrupa las rutas y Route define qué página se muestra en cada dirección.
import { Route, Routes } from 'react-router-dom'
import './App.css'
import AppNavbar from './components/AppNavbar'
import { candidatosIniciales } from './data/candidatos'
import InicioPage from './pages/InicioPage'
import NoEncontradaPage from './pages/NoEncontradaPage'
import PostulacionPage from './pages/PostulacionPage'
import PsicologoPage from './pages/PsicologoPage'
import SupervisorPage from './pages/SupervisorPage'

function App() {
  // 1. Estado principal: la lista de candidatos.
  //    Vive en App para que todas las páginas compartan los mismos datos.
  const [candidatos, setCandidatos] = useState(candidatosIniciales)

  // 2. id de la postulación del usuario que entra como postulante.
  const [idMiPostulacion, setIdMiPostulacion] = useState(null)

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
      <AppNavbar />

      {/* 6. Rutas de la aplicación: cada dirección muestra una página distinta. */}
      <Routes>
        <Route path="/" element={<InicioPage {...propsTema} />} />
        <Route
          path="/postulacion"
          element={<PostulacionPage {...propsTema} candidato={miPostulacion} alEnviar={agregarCandidato} />}
        />
        <Route
          path="/supervisor"
          element={          <SupervisorPage
            {...propsTema}
            candidatos={candidatos}
            actualizarCandidato={actualizarCandidato}
            alCrearSolicitud={crearSolicitud}
          />}
        />
        <Route
          path="/psicologo"
          element={<PsicologoPage {...propsTema} candidatos={candidatos} actualizarCandidato={actualizarCandidato} />}
        />
        {/* "*" atrapa cualquier ruta que no exista. */}
        <Route path="*" element={<NoEncontradaPage />} />
      </Routes>
    </div>
  )
}

export default App