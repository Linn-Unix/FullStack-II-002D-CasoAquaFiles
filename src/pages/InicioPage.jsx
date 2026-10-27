import BotonRol from '../components/BotonRol'
import BotonTema from '../components/BotonTema'

// Página de inicio (ruta "/").
// El postulante entra directo. El personal de AquaChile debe iniciar sesión.
function InicioPage({ modoOscuro, alCambiarTema, alEntrarComoPostulante }) {
  return (
    <main className="role-screen">
      <BotonTema className="role-theme-toggle" modoOscuro={modoOscuro} alCambiar={alCambiarTema} />
      <section className="role-card">
        <p className="tag">AquaChile · Gestión Laboral</p>
        <h1>Gestión Laboral</h1>
        <p className="lead">¿Cómo quieres ingresar?</p>
        <div className="role-options">
          <BotonRol
            ruta="/postulacion"
            icono="bi-person-badge"
            titulo="Postulante / Candidato"
            texto="Registrar mis datos, adjuntar CV y consultar mi postulación."
            alElegir={alEntrarComoPostulante}
          />
          <BotonRol
            ruta="/login"
            icono="bi-shield-lock"
            titulo="Personal AquaChile"
            texto="Analistas de reclutamiento y profesionales evaluadores. Requiere usuario y contraseña."
          />
        </div>
        <p className="role-note">
          <i className="bi bi-lock-fill" /> La información interna del proceso solo la ve el personal con sesión iniciada.
        </p>
      </section>
    </main>
  )
}

export default InicioPage
