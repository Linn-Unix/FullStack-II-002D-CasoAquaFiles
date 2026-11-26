# Guía de despliegue de AquaFiles

| Parte | Servicio | Plan |
| :--- | :--- | :--- |
| Frontend (React) | **Vercel** | Gratis |
| Backend (Spring Boot) | **Render** (Docker) | Gratis |
| Base de datos (MySQL) | **Aiven for MySQL** | Gratis |
| IA | **Groq** | Gratis (con límite de consultas por minuto) |
| Agenda | Google Calendar | Gratis |

> Revisen los límites actuales de cada plan gratuito antes de la presentación: cambian con frecuencia.

---

## 1. Base de datos en Aiven

1. Crear una cuenta en https://aiven.io y un servicio **MySQL** con el plan **Free**.
2. Esperar a que el servicio quede en estado *Running* y abrir **Connection information**. Anotar: **Host**, **Port**, **User** (normalmente `avnadmin`), **Password** y **Database name** (normalmente `defaultdb`).
3. Armar la URL JDBC (Aiven exige SSL):

```text
jdbc:mysql://HOST:PORT/defaultdb?sslMode=REQUIRED&serverTimezone=America/Santiago
```

No hay que crear tablas: Flyway aplica las migraciones `V1` a `V6` cuando el backend arranca por primera vez.

## 2. Backend en Render

El repositorio trae `backend/Dockerfile` y `render.yaml`.

1. En https://render.com: **New → Blueprint** y elegir el repositorio `Linn-Unix/FullStack-II-002D-CasoAquaFiles` (rama `main`).
2. Render lee `render.yaml` y pide las variables marcadas para completar:

| Variable | Valor |
| :--- | :--- |
| `DB_URL` | La URL JDBC del paso 1 |
| `DB_USUARIO` | `avnadmin` (o el usuario de Aiven) |
| `DB_CLAVE` | La contraseña de Aiven |
| `CORS_ORIGENES` | La URL de Vercel, por ejemplo `https://full-stack-ii-002-d-caso-aqua-files.vercel.app` (sin `/` al final) |
| `GROQ_API_KEY` | La clave de https://console.groq.com (opcional: sin ella, la IA queda desactivada) |

`JWT_SECRETO` la genera Render automáticamente. `CREAR_USUARIOS_PRUEBA=true` crea los usuarios y las ofertas ficticias.

3. Esperar el primer despliegue (5 a 10 minutos: Docker compila con Maven). Al terminar, Render entrega una URL como `https://aquafiles-backend.onrender.com`.
4. Comprobar:
   - `https://aquafiles-backend.onrender.com/api/v1/verificacion` responde.
   - `https://aquafiles-backend.onrender.com/swagger-ui.html` abre Swagger.

> **Alternativa sin Blueprint:** New → Web Service → Docker, con *Dockerfile Path* `./backend/Dockerfile`, *Docker Build Context* `./backend` y las mismas variables. *Health Check Path*: `/api/v1/verificacion`.

## 3. Frontend en Vercel

1. En el proyecto de Vercel: **Settings → Environment Variables**.
2. Agregar:

| Variable | Valor |
| :--- | :--- |
| `VITE_API_URL` | `https://aquafiles-backend.onrender.com/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | El ID de cliente de Google (opcional) |

3. **Deployments → Redeploy**. Las variables `VITE_` se leen al compilar, así que hay que volver a desplegar después de cambiarlas.

`vercel.json` ya redirige las rutas (`/empleos`, `/supervisor`, etc.) a la aplicación.

## 4. Google Calendar (opcional)

En Google Cloud Console → **Credenciales** → el ID de cliente OAuth → **Orígenes de JavaScript autorizados**, agregar la URL de Vercel. La API de Google Calendar debe estar habilitada en el proyecto.

## 5. Verificación después de desplegar

1. Abrir la página de Vercel → **Ofertas laborales**: aparecen las ofertas de ejemplo.
2. Postular a una oferta con un CV PDF de prueba.
3. Iniciar sesión como `analista` / `aqua123`: aparece la postulación; descargar el CV; **Analizar CV con IA**.
4. Aprobar y derivar con responsable.
5. Iniciar sesión como `evaluador` / `aqua123`: agendar, guardar el resultado y subir el informe.
6. Sin sesión, abrir `/supervisor`: "Acceso restringido".

## 6. Limitaciones del plan gratuito (explicarlas en la presentación)

| Limitación | Efecto | Cómo manejarla en la demo |
| :--- | :--- | :--- |
| Render se "duerme" tras ~15 min sin uso | La primera petición tarda cerca de 1 minuto | Abrir la página unos minutos antes de presentar |
| Render gratis **no tiene disco persistente** | Los CV se borran al redesplegar o cuando el servicio se duerme | Postular y descargar el CV en vivo; no redesplegar justo antes. En producción: disco persistente de Render (pagado) o un servicio de archivos como S3 |
| `autoDeploy: false` | Un push a GitHub no redespliega solo | Redesplegar a mano desde Render cuando se quiera actualizar |
| Límite gratuito de Groq | Con muchas consultas seguidas, la IA pide esperar un minuto | Analizar un solo CV en la demo; el resto del sistema funciona igual |

Si no hay backend público disponible, la demostración se hace en local (ver [Documento técnico](DOCUMENTO_TECNICO.md#11-ejecución-local-y-despliegue)) y se justifica la limitación, como permite la pauta.

## 7. Variables del backend (referencia)

| Variable | Ejemplo | Observación |
| :--- | :--- | :--- |
| `DB_URL` | `jdbc:mysql://host:port/defaultdb?sslMode=REQUIRED&...` | URL de Aiven |
| `DB_USUARIO` | `avnadmin` | |
| `DB_CLAVE` | (secreta) | Nunca subir a Git |
| `JWT_SECRETO` | (generada por Render) | Mínimo 32 caracteres y estable |
| `CORS_ORIGENES` | `https://tu-app.vercel.app` | Sin barra final |
| `ARCHIVOS_DIRECTORIO` | `/app/uploads` | Ya definida en el `Dockerfile` |
| `GROQ_API_KEY` | (secreta, empieza con `gsk_`) | Opcional |
| `GROQ_MODELO` | `qwen/qwen3.8-27b` | |
| `CREAR_USUARIOS_PRUEBA` | `true` | Poner `false` en un ambiente real |
| `PORT` | (lo pone Render) | El backend lo lee solo |

## 8. Antes de cada despliegue

```bash
npm run coverage
npm run lint
npm run build
mvn -f backend/pom.xml verify
```

No modificar migraciones ya aplicadas. Los cambios de base de datos van en una migración nueva (`V7` en adelante).
