# Guía de despliegue de AquaFiles

## Arquitectura

- Frontend: React/Vite desplegado en Vercel.
- Backend: Spring Boot 3 desplegado en un servidor con Java 21 y Maven.
- Base de datos: MySQL 8.
- Archivos: carpeta persistente configurada por `ARCHIVOS_DIRECTORIO` (una subcarpeta por postulante).
- Google Calendar: lo llama directamente el navegador del evaluador con su cuenta de Google.

## Variables del backend

Configurar estos valores en el proveedor del backend:

| Variable | Ejemplo | Observación |
| :--- | :--- | :--- |
| `DB_URL` | `jdbc:mysql://host:3306/aquafiles?...` | URL externa de MySQL |
| `DB_USUARIO` | `aquafiles` | Usuario con permisos sobre la base |
| `DB_CLAVE` | `clave-secreta` | Nunca subir a Git |
| `JWT_SECRETO` | clave aleatoria de al menos 32 caracteres | Debe permanecer estable |
| `CORS_ORIGENES` | `https://tu-app.vercel.app` | Sin barra final |
| `ARCHIVOS_DIRECTORIO` | `/datos/aquafiles/uploads` | Ruta persistente y con permisos de escritura |
| `CREAR_USUARIOS_PRUEBA` | `false` | Desactivar en producción |
| `CLAVE_USUARIOS_PRUEBA` | `aqua123` | Solo si se crean usuarios de prueba |
| `PORT` | `8080` | Solo si el proveedor lo requiere |

## Configuración del frontend

Definir `VITE_API_URL` con la URL pública del backend y, para agendar en Google Calendar, `VITE_GOOGLE_CLIENT_ID`:

```text
VITE_API_URL=https://api.tu-dominio.cl/api/v1
VITE_GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```

En Google Cloud Console, agrega la URL de Vercel en **Orígenes de JavaScript autorizados** del ID de cliente OAuth.

En Vercel:

1. Framework preset: `Vite`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Variables: `VITE_API_URL` y `VITE_GOOGLE_CLIENT_ID`.
5. Configurar el backend para permitir el dominio de Vercel en `CORS_ORIGENES`.

## Base de datos

Crear la base antes del primer arranque. Flyway aplica las migraciones V1 a V6 automáticamente.

No modificar migraciones ya desplegadas. Crear una nueva migración V7 o superior para cambios futuros.

## Archivos

La ruta configurada en `ARCHIVOS_DIRECTORIO` debe estar disponible después de reinicios. Dentro, el backend crea una carpeta por postulante (`nombre-del-postulante-ID`). En Render, usa un *Persistent Disk* montado (por ejemplo en `/datos`) y define `ARCHIVOS_DIRECTORIO=/datos/uploads`; en Railway, un *Volume*. Un proveedor sin disco persistente pierde los CV al reiniciar.

## Opciones recomendadas (planes gratuitos o con créditos)

| Parte | Opción | Nota |
| :--- | :--- | :--- |
| Frontend | Vercel | Ya configurado con `vercel.json` |
| Backend | Render (Web Service, Java 21) o Railway | Build: `mvn -f backend/pom.xml -DskipTests package` · Start: `java -jar backend/target/aquafiles-backend-0.0.1-SNAPSHOT.jar` |
| Base de datos | Railway MySQL o Aiven for MySQL | Copiar la URL JDBC a `DB_URL` |

Revisa los límites del plan gratuito antes de la presentación (horas de uso, suspensión por inactividad y tamaño del disco). Si no hay backend público disponible, la demostración se hace en local y se justifica la limitación.

## Verificación

Antes de desplegar:

```bash
npm run coverage
npm run lint
npm run build
mvn -f backend/pom.xml verify
```

Después del despliegue:

1. Abrir `/api/v1/verificacion`.
2. Iniciar sesión como analista.
3. Crear y publicar una oferta; verla en `/empleos` sin sesión.
4. Postular a la oferta con un CV de prueba.
5. Aprobar y derivar con responsable.
6. Iniciar sesión como evaluador, agendar, guardar el resultado y subir el informe.
7. Confirmar respuestas `401` y `403` fuera de permisos.
8. Abrir `/swagger-ui.html`.
