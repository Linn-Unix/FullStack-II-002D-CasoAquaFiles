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
| `CREAR_USUARIOS_PRUEBA` | Crear usuarios y ofertas de ejemplo al arrancar |

`backend/.env` y todas las credenciales reales están excluidos de Git.

## Swagger

Con el backend encendido: http://localhost:8080/swagger-ui.html. Para probar rutas internas, usa `POST /api/v1/auth/login`, copia el `token` y pégalo en **Authorize**.

## Pruebas y cobertura

```bash
mvn test      # 47 pruebas + reporte en target/site/jacoco/index.html
mvn verify    # además exige 85 % de líneas cubiertas
```

Las pruebas usan el perfil `test` con **H2 en memoria** (`src/test/resources/application-test.yml`), así que **no necesitan MySQL**.

> En Windows, si `mvn` no se reconoce, agrega la carpeta `bin` de Maven a la variable PATH, o ejecuta las pruebas con el botón ▶ de IntelliJ sobre `src/test`.