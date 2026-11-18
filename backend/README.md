# Backend AquaFiles

## Requisitos
- Java 21
- Maven 3.9+
- MySQL 8

## Base de datos
1. Crear la base y el usuario (en MySQL Workbench, conectada como root):
   ```sql
   CREATE DATABASE aquafiles CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'aquafiles'@'localhost' IDENTIFIED BY 'cambia_esta_clave';
   GRANT ALL PRIVILEGES ON aquafiles.* TO 'aquafiles'@'localhost';
   FLUSH PRIVILEGES;
   ```
2. Copiar `.env.example` como `.env` (en PowerShell: `Copy-Item .env.example .env`) y poner en `DB_CLAVE` la misma clave del `CREATE USER`.
3. Ejecutar `AquaFilesApplication` (o `mvn spring-boot:run`). Flyway crea las tablas solo.

## Problemas comunes
- `Access denied for user 'aquafiles'`: el usuario no existe o la clave del `.env` no coincide.
- `Communications link failure`: MySQL está apagado (Servicios de Windows → MySQL80 → Iniciar).

## Variables de entorno

| Variable | Uso |
| :--- | :--- |
| `DB_URL` | URL JDBC de MySQL |
| `DB_USUARIO` | Usuario de la base de datos |
| `DB_CLAVE` | Clave de la base de datos |
| `JWT_SECRETO` | Clave privada para firmar tokens JWT |
| `JWT_EXPIRACION_MINUTOS` | Duración del token, 60 minutos por defecto |
| `CORS_ORIGENES` | Orígenes frontend separados por coma |
| `ARCHIVOS_DIRECTORIO` | Carpeta persistente para CV e informes |
| `CREAR_USUARIOS_PRUEBA` | Crear usuarios iniciales al arrancar |

`backend/.env` y todas las credenciales reales están excluidos de Git.

## Pruebas

```powershell
& "C:\Users\Felip\Downloads\apache-maven-3.10.0\bin\mvn.cmd" -f backend\pom.xml test
```

La suite debe validar la aplicación, entidades, archivos, autenticación, candidatos, evaluaciones y utilidades RUT.