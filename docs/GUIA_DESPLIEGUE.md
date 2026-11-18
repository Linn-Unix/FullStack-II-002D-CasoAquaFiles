# Guía de despliegue de AquaFiles

## Arquitectura

- Frontend: React/Vite desplegado en Vercel.
- Backend: Spring Boot 3 desplegado en un servidor con Java 21 y Maven.
- Base de datos: MySQL 8.
- Archivos: carpeta persistente configurada por `ARCHIVOS_DIRECTORIO`.

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
| `PORT` | `8080` | Solo si el proveedor lo requiere |

## Configuración del frontend

Definir `VITE_API_URL` con la URL pública del backend:

```text
VITE_API_URL=https://api.tu-dominio.cl/api/v1
```

En Vercel:

1. Framework preset: `Vite`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Variable: `VITE_API_URL`.
5. Configurar el backend para permitir el dominio de Vercel en `CORS_ORIGENES`.

## Base de datos

Crear la base antes del primer arranque. Flyway aplica las migraciones V1 a V4 automáticamente.

No modificar migraciones ya desplegadas. Crear una nueva migración V5 o superior para cambios futuros.

## Archivos

La ruta configurada en `ARCHIVOS_DIRECTORIO` debe existir y estar disponible después de reinicios. El almacenamiento local no es apropiado para proveedores sin disco persistente.

## Verificación

Antes de desplegar:

```powershell
npm run test:run
npm run lint
npm run build
& "C:\Users\Felip\Downloads\apache-maven-3.10.0\bin\mvn.cmd" -f backend\pom.xml test
```

Después del despliegue:

1. Abrir `/api/v1/verificacion`.
2. Iniciar sesión como analista.
3. Crear y filtrar una solicitud.
4. Derivar al evaluador.
5. Iniciar sesión como evaluador y agendar.
6. Subir CV e informe.
7. Confirmar respuestas `401` y `403` fuera de permisos.
