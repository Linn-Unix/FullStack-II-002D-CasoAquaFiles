import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { candidatosApi, loginApi, simularApi } from './test/simularApi'
import { ROLES } from './data/roles'
import { guardarSesion } from './services/sesion'

// MemoryRouter simula el navegador en las pruebas y permite partir en cualquier ruta.
// "rol" permite entrar con un rol ya elegido.
function renderizarApp(ruta = '/', rol = null) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App rolInicial={rol} />
    </MemoryRouter>,
  )
}

// Inicia sesión como personal interno desde el formulario de "/login".
async function iniciarSesion(usuario, nombreUsuario) {
  simularApi({
    'POST /auth/login': loginApi(nombreUsuario),
  })
  await usuario.click(screen.getByRole('link', { name: /personal aquachile/i }))
  await usuario.type(screen.getByLabelText('Usuario'), nombreUsuario)
  await usuario.type(screen.getByLabelText('Contraseña'), 'aqua123')
  await usuario.click(screen.getByRole('button', { name: /ingresar/i }))
}

function prepararSesionApi(rol = ROLES.SUPERVISOR) {
  vi.stubEnv('PROD', true)
  guardarSesion({
    token: 'token-de-prueba',
    usuario: 'usuario-prueba',
    nombre: 'Usuario de prueba',
    rol,
  })
}

describe('Navegación con React Router', () => {
  it('el inicio muestra el acceso del postulante y del personal', () => {
    renderizarApp('/')
    expect(screen.getByRole('link', { name: /postulante/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /personal aquachile/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /analista de reclutamiento/i })).not.toBeInTheDocument()
  })

  it('el analista inicia sesión y llega a su panel', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/')
    await iniciarSesion(usuario, 'analista')
    expect(await screen.findByRole('heading', { name: 'Panel de Reclutamiento' })).toBeInTheDocument()
    expect(screen.getByText(/rosa martínez/i)).toBeInTheDocument()
  })

  it('no inicia sesión con una contraseña incorrecta', async () => {
    const usuario = userEvent.setup()
    simularApi({
      'POST /auth/login': {
        status: 401,
        cuerpo: {
          mensaje: 'Usuario o contraseña incorrectos.',
        },
      },
    })
    renderizarApp('/login')
    await usuario.type(screen.getByLabelText('Usuario'), 'analista')
    await usuario.type(screen.getByLabelText('Contraseña'), '1234')
    await usuario.click(screen.getByRole('button', { name: /ingresar/i }))
    expect(screen.getByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos.')
  })

  it('muestra un error si el backend está apagado', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('Failed to fetch')
    }))
    const usuario = userEvent.setup()
    renderizarApp('/login')
    await usuario.type(screen.getByLabelText('Usuario'), 'analista')
    await usuario.type(screen.getByLabelText('Contraseña'), 'aqua123')
    await usuario.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo conectar/i)
  })

  it('navega desde el menú del navbar', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/', ROLES.PSICOLOGO)
    const menu = screen.getByRole('navigation')
    await usuario.click(within(menu).getByRole('link', { name: 'Evaluaciones' }))
    expect(screen.getByRole('heading', { name: 'Panel de Evaluaciones' })).toBeInTheDocument()
  })

  it('el menú solo muestra la pantalla del rol actual', () => {
    renderizarApp('/postulacion', ROLES.POSTULANTE)
    const menu = screen.getByRole('navigation')
    expect(within(menu).getByRole('link', { name: 'Mi postulación' })).toBeInTheDocument()
    expect(within(menu).queryByRole('link', { name: 'Reclutamiento' })).not.toBeInTheDocument()
    expect(within(menu).queryByRole('link', { name: 'Evaluaciones' })).not.toBeInTheDocument()
  })

  it('sin iniciar sesión se puede abrir "Mi postulación", pero el analista no la ve', () => {
    renderizarApp('/postulacion')
    expect(screen.getByRole('heading', { name: 'Mi postulación' })).toBeInTheDocument()
    cleanup()
    renderizarApp('/postulacion', ROLES.SUPERVISOR)
    expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeInTheDocument()
  })

  it('el postulante no puede entrar al panel del supervisor', () => {
    renderizarApp('/supervisor', ROLES.POSTULANTE)
    expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Panel del Supervisor' })).not.toBeInTheDocument()
  })

  it('el postulante no puede entrar al panel psicolaboral', () => {
    renderizarApp('/psicologo', ROLES.POSTULANTE)
    expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeInTheDocument()
    expect(screen.queryByText(/dossiers recibidos/i)).not.toBeInTheDocument()
  })

  it('sin iniciar sesión no se puede entrar al panel del analista', () => {
    renderizarApp('/supervisor')
    expect(screen.getByText(/debes iniciar sesión/i)).toBeInTheDocument()
  })

  it('el analista llega al dashboard desde el menú', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/supervisor', ROLES.SUPERVISOR)
    const menu = screen.getByRole('navigation')
    await usuario.click(within(menu).getByRole('link', { name: 'Dashboard' }))
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('muestra la página 404 en una ruta que no existe', () => {
    renderizarApp('/no-existe')
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument()
  })
})

describe('Flujo del proceso', () => {
  it('el supervisor crea una nueva solicitud', async () => {
    const fetchFalso = simularApi({
      'POST /postulaciones': {
        cuerpo: { id: 99 },
      },
      'POST /postulaciones/99/cv': {
        cuerpo: {},
      },
    })
    const usuario = userEvent.setup()
    renderizarApp('/supervisor', ROLES.SUPERVISOR)

    await usuario.click(screen.getByRole('button', { name: /nueva solicitud/i }))
    await usuario.type(screen.getByLabelText(/nombre completo/i), 'Andrea Muñoz')
    await usuario.type(screen.getByLabelText(/^rut$/i), '12.345.678-5')
    await usuario.type(screen.getByLabelText(/correo electrónico/i), 'andrea@correo.cl')
    await usuario.type(screen.getByLabelText(/teléfono/i), '+56 9 1234 5678')
    await usuario.type(screen.getByLabelText(/cargo al que postula/i), 'Técnico Acuícola')
    await usuario.upload(screen.getByLabelText(/adjuntar cv/i), new File(['cv'], 'cv_andrea.pdf', { type: 'application/pdf' }))
    await usuario.click(screen.getByRole('button', { name: /registrar solicitud/i }))

    expect(screen.getByRole('status')).toHaveTextContent('Solicitud creada para Andrea Muñoz.')
    expect(screen.getByRole('row', { name: /andrea muñoz/i })).toBeInTheDocument()
    await waitFor(() => {
      expect(fetchFalso).toHaveBeenCalledWith(
        expect.stringContaining('/postulaciones'),
        expect.objectContaining({ method: 'POST' }),
      )
    })
  })

  it('el supervisor filtra por estado', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/supervisor', ROLES.SUPERVISOR)

    await usuario.selectOptions(screen.getByLabelText(/filtrar por estado/i), 'En revisión técnica')

    expect(screen.getByRole('row', { name: /camila rojas/i })).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /juanito pérez/i })).not.toBeInTheDocument()
    expect(screen.getByText('1 resultado(s)')).toBeInTheDocument()
  })

  it('el supervisor filtra por centro de costos', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/supervisor', ROLES.SUPERVISOR)

    await usuario.selectOptions(screen.getByLabelText(/filtrar por centro de costos/i), 'Mantención')

    expect(screen.getByRole('row', { name: /juanito pérez/i })).toBeInTheDocument()
    expect(screen.getByText('1 resultado(s)')).toBeInTheDocument()
  })

  it('el supervisor edita el cargo de un candidato', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/supervisor', ROLES.SUPERVISOR)

    await usuario.click(screen.getByRole('row', { name: /camila rojas/i }))
    await usuario.click(screen.getByRole('button', { name: /editar datos/i }))
    await usuario.clear(screen.getByLabelText('Cargo'))
    await usuario.type(screen.getByLabelText('Cargo'), 'Jefe de Centro')
    await usuario.click(screen.getByRole('button', { name: /guardar cambios/i }))

    const fila = screen.getByRole('row', { name: /camila rojas/i })
    expect(within(fila).getByText('Jefe de Centro')).toBeInTheDocument()
  })

  it('no guarda un cargo demasiado corto', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/supervisor', ROLES.SUPERVISOR)

    await usuario.click(screen.getByRole('row', { name: /camila rojas/i }))
    await usuario.click(screen.getByRole('button', { name: /editar datos/i }))
    await usuario.clear(screen.getByLabelText('Cargo'))
    await usuario.type(screen.getByLabelText('Cargo'), 'AB')
    await usuario.click(screen.getByRole('button', { name: /guardar cambios/i }))

    expect(screen.getByText(/al menos 3 caracteres/i)).toBeInTheDocument()
  })

  it('el psicólogo ve las observaciones del supervisor', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/supervisor', ROLES.SUPERVISOR)

    await usuario.click(screen.getByRole('row', { name: /pedro soto/i }))
    await usuario.type(screen.getByLabelText(/observaciones técnicas/i), 'Buen manejo de equipos')
    await usuario.click(screen.getByRole('button', { name: /guardar observaciones/i }))
    await usuario.selectOptions(screen.getByLabelText(/profesional responsable/i), 'Ps. Ana Fuentes')
    await usuario.click(screen.getByRole('button', { name: /derivar al evaluador/i }))
    await usuario.click(screen.getByRole('button', { name: /cerrar sesión/i }))
    await iniciarSesion(usuario, 'evaluador')
    await screen.findByRole('button', { name: /pedro soto/i })
    await usuario.click(screen.getByRole('button', { name: /pedro soto/i }))

    expect(screen.getByText('Buen manejo de equipos')).toBeInTheDocument()
  })

  it('el postulante consulta su estado con el RUT', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/postulacion', ROLES.POSTULANTE)

    await usuario.type(screen.getByLabelText(/rut de tu postulación/i), '19.876.543-0')
    await usuario.click(screen.getByRole('button', { name: /consultar/i }))

    expect(screen.getByRole('heading', { name: 'Hola, Camila Rojas' })).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: /salir/i }))
    expect(screen.getByRole('heading', { name: 'Ingresa tus antecedentes' })).toBeInTheDocument()
  })

  it('el postulante no ve las decisiones internas de RR. HH.', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/postulacion', ROLES.POSTULANTE)

    // Valentina está "Aprobado técnicamente", pero ella solo debe ver "En revisión técnica".
    await usuario.type(screen.getByLabelText(/rut de tu postulación/i), '20.456.789-1')
    await usuario.click(screen.getByRole('button', { name: /consultar/i }))

    expect(screen.getAllByText('En revisión técnica').length).toBeGreaterThan(0)
    expect(screen.queryByText('Aprobado técnicamente')).not.toBeInTheDocument()
  })

  it('el postulante no ve las observaciones técnicas', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/postulacion', ROLES.POSTULANTE)

    await usuario.type(screen.getByLabelText(/rut de tu postulación/i), '15.678.432-K')
    await usuario.click(screen.getByRole('button', { name: /consultar/i }))

    expect(screen.getAllByText('Proceso finalizado').length).toBeGreaterThan(0)
    expect(screen.queryByText(/experiencia sólida/i)).not.toBeInTheDocument()
  })

  it('el postulante ve la fecha de su entrevista', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/postulacion', ROLES.POSTULANTE)

    await usuario.type(screen.getByLabelText(/rut de tu postulación/i), '18.923.456-2')
    await usuario.click(screen.getByRole('button', { name: /consultar/i }))

    expect(screen.getByText(/28-10-2026/)).toBeInTheDocument()
  })

  it('el supervisor rechaza a un candidato en revisión', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/supervisor', ROLES.SUPERVISOR)

    await usuario.click(screen.getByRole('row', { name: /camila rojas/i }))
    await usuario.click(screen.getByRole('button', { name: /rechazar/i }))

    expect(screen.getByText(/etapa técnica cerrada/i)).toBeInTheDocument()
  })

  it('el supervisor deriva un candidato y el psicólogo lo recibe', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/supervisor', ROLES.SUPERVISOR)

    await usuario.click(screen.getByRole('row', { name: /pedro soto/i }))
    await usuario.selectOptions(screen.getByLabelText(/profesional responsable/i), 'Ps. Ana Fuentes')
    await usuario.click(screen.getByRole('button', { name: /derivar al evaluador/i }))
    await usuario.click(screen.getByRole('button', { name: /cerrar sesión/i }))
    await iniciarSesion(usuario, 'evaluador')

    expect(await screen.findByRole('button', { name: /pedro soto/i })).toBeInTheDocument()
  })

  it('el psicólogo registra el resultado y las observaciones de evaluación', async () => {
    const usuario = userEvent.setup()
    renderizarApp('/psicologo', ROLES.PSICOLOGO)

    await usuario.click(screen.getByRole('button', { name: /maría gonzález/i }))
    await usuario.selectOptions(screen.getByLabelText(/resultado de la evaluación/i), 'Recomendable con observaciones')
    await usuario.type(screen.getByLabelText(/observaciones de la evaluación/i), 'Requiere seguimiento durante la adaptación.')
    await usuario.click(screen.getByRole('button', { name: /guardar evaluación/i }))

    expect(screen.getByText('Evaluación guardada')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Recomendable con observaciones')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Requiere seguimiento durante la adaptación.')).toBeInTheDocument()
  })
})

describe('Analista con datos de la API', () => {
  it('carga los candidatos del backend', async () => {
    prepararSesionApi()
    simularApi({
      'GET /candidatos': { cuerpo: candidatosApi },
    })
    renderizarApp('/supervisor', ROLES.SUPERVISOR)

    expect(await screen.findAllByText('Juanito Pérez')).not.toHaveLength(0)
  })

  it('aprueba a un candidato y actualiza su estado', async () => {
    prepararSesionApi()
    const enRevision = candidatosApi.find((candidato) => candidato.estado === 'REVISION')
    const fetchFalso = simularApi({
      'GET /candidatos': { cuerpo: [enRevision] },
      [`PATCH /candidatos/${enRevision.id}/aprobar`]: {
        cuerpo: { ...enRevision, estado: 'APROBADO' },
      },
    })
    const usuario = userEvent.setup()
    renderizarApp('/supervisor', ROLES.SUPERVISOR)

    await usuario.click(await screen.findByRole('button', { name: /aprobar etapa técnica/i }))

    expect(await screen.findByRole('button', { name: /derivar al evaluador/i })).toBeInTheDocument()
    await waitFor(() => {
      expect(fetchFalso).toHaveBeenCalledWith(
        expect.stringContaining(`/candidatos/${enRevision.id}/aprobar`),
        expect.objectContaining({ method: 'PATCH' }),
      )
    })
  })

  it('el evaluador con sesión solo ve las evaluaciones del backend', async () => {
    prepararSesionApi(ROLES.PSICOLOGO)
    simularApi({
      'GET /evaluaciones': {
        cuerpo: [{ id: 1, candidatoId: 3, nombre: 'Tomás Fuentes', rut: '12.345.678-5', correo: 'tomas@correo.cl', cargo: 'Técnico Acuícola', estado: 'DERIVADO' }],
      },
    })
    renderizarApp('/psicologo', ROLES.PSICOLOGO)

    expect(await screen.findByRole('button', { name: /tomás fuentes/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /juanito pérez/i })).not.toBeInTheDocument()
  })

  it('al cerrar sesión no quedan las evaluaciones del evaluador anterior', async () => {
    prepararSesionApi(ROLES.PSICOLOGO)
    simularApi({
      'GET /evaluaciones': {
        cuerpo: [{ id: 1, candidatoId: 3, nombre: 'Tomás Fuentes', rut: '12.345.678-5', cargo: 'Técnico Acuícola', estado: 'DERIVADO' }],
      },
    })
    const usuario = userEvent.setup()
    renderizarApp('/psicologo', ROLES.PSICOLOGO)
    expect(await screen.findByRole('button', { name: /tomás fuentes/i })).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: /cerrar sesión/i }))
    // Las evaluaciones del nuevo evaluador quedan "cargando" (la petición nunca responde):
    // en ese momento no deben verse las del evaluador anterior.
    const fetchFalso = simularApi({ 'POST /auth/login': loginApi('evaluador') })
    vi.stubGlobal('fetch', (url, opciones) => (url.endsWith('/evaluaciones') ? new Promise(() => {}) : fetchFalso(url, opciones)))
    await usuario.click(screen.getByRole('link', { name: /personal aquachile/i }))
    await usuario.type(screen.getByLabelText('Usuario'), 'evaluador')
    await usuario.type(screen.getByLabelText('Contraseña'), 'aqua123')
    await usuario.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByRole('heading', { name: 'Panel de Evaluaciones' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /tomás fuentes/i })).not.toBeInTheDocument()
  })

  it('deriva con el responsable elegido de la lista de evaluadores', async () => {
    prepararSesionApi()
    const aprobado = { ...candidatosApi.find((candidato) => candidato.estado === 'REVISION'), estado: 'APROBADO' }
    const fetchFalso = simularApi({
      'GET /candidatos': { cuerpo: [aprobado] },
      'GET /usuarios/evaluadores': { cuerpo: ['Andrea Vidal', 'Luis Herrera'] },
      [`PATCH /candidatos/${aprobado.id}/derivar`]: {
        cuerpo: { ...aprobado, estado: 'DERIVADO', responsable: 'Luis Herrera' },
      },
    })
    const usuario = userEvent.setup()
    renderizarApp('/supervisor', ROLES.SUPERVISOR)

    const derivar = await screen.findByRole('button', { name: /derivar al evaluador/i })
    expect(derivar).toBeDisabled()
    await screen.findByRole('option', { name: 'Luis Herrera' })
    await usuario.selectOptions(screen.getByLabelText(/profesional responsable/i), 'Luis Herrera')
    await usuario.click(derivar)

    expect(await screen.findByText('Luis Herrera', { selector: 'strong' })).toBeInTheDocument()
    const envio = fetchFalso.mock.calls.find(([url]) => url.endsWith('/derivar'))
    expect(JSON.parse(envio[1].body)).toEqual({ responsable: 'Luis Herrera' })
  })
})

