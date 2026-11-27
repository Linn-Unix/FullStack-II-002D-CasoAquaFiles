import BotonRol from '../components/BotonRol'
import BotonTema from '../components/BotonTema'
import logoAquaChile from '../assets/aquachile-logo.png'

// Página de inicio (ruta "/").
// El postulante entra directo. El personal de AquaChile debe iniciar sesión.
function InicioPage({ modoOscuro, alCambiarTema, alEntrarComoPostulante }) {
  return (
    <main className="role-screen">
      <BotonTema className="role-theme-toggle" modoOscuro={modoOscuro} alCambiar={alCambiarTema} />
      <section className="role-card">
        <div className="home-branding">
          <img className="home-branding-logo" src={logoAquaChile} alt="Logo de AquaChile" />
          <p className="tag">AquaFiles · Gestión Laboral</p>
        </div>
        <h1>Gestión Laboral</h1>
        <p className="lead">¿Cómo quieres ingresar?</p>
        <div className="role-options three-roles">
          <BotonRol
            ruta="/empleos"
            icono="bi-briefcase"
            titulo="Ofertas laborales"
            texto="Revisa las oportunidades abiertas y envía tu CV. No necesitas cuenta."
          />
          <BotonRol
            ruta="/postulacion"
            icono="bi-person-badge"
            titulo="Postulante / Candidato"
            texto="Consulta el estado de tu postulación con tu RUT."
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
