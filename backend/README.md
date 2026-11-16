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