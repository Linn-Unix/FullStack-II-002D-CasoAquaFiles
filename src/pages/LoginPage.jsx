import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BotonTema from '../components/BotonTema'
import { RUTA_INICIAL } from '../data/usuarios'
import { iniciarSesionApi } from '../services/authService'

// Página de inicio de sesión (ruta "/login") para el personal de AquaChile.
// "alIniciarSesion" guarda en App el usuario que entró.
function LoginPage({ modoOscuro, alCambiarTema, alIniciarSesion }) {
  // 1. Estados del formulario: lo que se escribe y el mensaje de error.
  const [datos, setDatos] = useState({ usuario: '', clave: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  // 2. useNavigate permite cambiar de página desde el código.
  const navegar = useNavigate()

  // 3. Cada cambio actualiza solo el campo que se está escribiendo.
  function cambiarCampo(evento) {
    const { name, value } = evento.target
    setDatos((actual) => ({ ...actual, [name]: value }))
    setError('')
  }

  // 4. Al enviar: validamos los campos y luego preguntamos al backend.
  async function enviar(evento) {
    evento.preventDefault()

    if (!datos.usuario.trim() || !datos.clave) {
      setError('Ingresa tu usuario y tu contraseña.')
      return
    }

    setCargando(true)
    try {
      const sesion = await iniciarSesionApi(datos.usuario, datos.clave)
      alIniciarSesion(sesion)
      navegar(RUTA_INICIAL[sesion.rol])
    } catch (errorApi) {
      setError(errorApi.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="role-screen">
      <BotonTema className="role-theme-toggle" modoOscuro={modoOscuro} alCambiar={alCambiarTema} />
      <section className="role-card login-card">
        <p className="tag">AquaChile · Personal interno</p>
        <h1>Iniciar sesión</h1>
        <p className="lead">Acceso solo para el equipo de Reclutamiento y los profesionales evaluadores.</p>

        <form className="login-form" onSubmit={enviar} noValidate>
          <label className="form-label fw-bold w-100">
            Usuario
            <input name="usuario" className="form-control" value={datos.usuario} onChange={cambiarCampo} autoComplete="username" />
          </label>

          <label className="form-label fw-bold w-100">
            Contraseña
            <input name="clave" type="password" className="form-control" value={datos.clave} onChange={cambiarCampo} autoComplete="current-password" />
          </label>

          {/* 6. Renderizado condicional: el error solo aparece si existe. */}
          {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

          <button className="btn btn-aqua w-100" type="submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : <>Ingresar <i className="bi bi-box-arrow-in-right" /></>}
          </button>
        </form>

        <Link className="d-inline-block mt-3" to="/">Volver al inicio</Link>
      </section>
    </main>
  )
}

export default LoginPage
