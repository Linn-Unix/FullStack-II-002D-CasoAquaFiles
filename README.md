# AquaFiles

MVP frontend para centralizar la gestión de candidatos y evaluaciones psicolaborales de AquaChile.

El proyecto está basado en el ejemplo entregado para FullStack II y representa el flujo:

**Supervisor Técnico → Filtro técnico → Derivación al psicólogo → Evaluación psicolaboral → Resultado**

## Objetivo

AquaFiles reemplaza el uso de planillas y herramientas fragmentadas por una vista centralizada para registrar candidatos, consultar sus antecedentes, actualizar estados y derivar los perfiles aprobados técnicamente al psicólogo.

## Tecnologías

- React
- JavaScript y JSX
- Vite
- Bootstrap 5
- Bootstrap Icons
- CSS

## Estructura principal

```text
src/
├── App.jsx       # Pantallas, roles, flujo y componentes del MVP
├── App.css       # Estilos de AquaFiles y diseño responsive
├── index.css     # Estilos globales
└── main.jsx      # Entrada principal de React y Bootstrap
```

## Inicio del proyecto

Instalar dependencias:

```bash
npm install
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Luego abrir la URL mostrada por Vite, normalmente:

```text
http://localhost:5173/
```

Si ese puerto está ocupado, Vite utilizará otro, por ejemplo `http://localhost:5174/`.

## Roles y permisos

### Supervisor Técnico

El supervisor tiene acceso a la gestión completa del proceso:

- Ver todos los candidatos registrados.
- Buscar candidatos por nombre, cargo o ubicación.
- Consultar currículum y descriptor de cargo.
- Crear nuevas solicitudes.
- Avanzar el estado de un candidato.
- Revisar indicadores de candidatos pendientes, en proceso y finalizados.
- Consultar el resumen de candidatos que aprobaron el filtro técnico.
- Avisar al psicólogo que existen candidatos listos para evaluación psicolaboral.

### Postulante / Candidato

El candidato tiene acceso únicamente a su propia información:

- Consultar su currículum.
- Ver su cargo y ubicación registrados.
- Revisar el estado actual de su proceso.
- Consultar el avance de las etapas del proceso.

El candidato no puede ver la tabla general ni los datos, currículums o estados de otros candidatos.

## Flujo principal

1. El supervisor realiza el filtro o entrevista técnica.
2. Si el candidato aprueba, el supervisor crea una solicitud en AquaFiles.
3. El candidato queda registrado como `Evaluación recibida`.
4. El supervisor puede revisar el resumen de aprobados técnicamente.
5. El supervisor selecciona `Avisar al psicólogo`.
6. El psicólogo puede continuar con la entrevista psicolaboral.
7. El proceso avanza por las siguientes etapas:

```text
Evaluación recibida
        ↓
Entrevista agendada
        ↓
Entrevista realizada
        ↓
Informe enviado
```

## Cómo probar el MVP

1. Ejecutar `npm run dev`.
2. En la pantalla inicial, seleccionar `Supervisor Técnico`.
3. Crear una solicitud usando `Nueva solicitud`.
4. Seleccionar un candidato en la tabla.
5. Avanzar su estado desde el expediente.
6. Presionar `Avisar al psicólogo` en el resumen de aprobados.
7. Volver a la pantalla inicial con `Cambiar rol`.
8. Seleccionar `Postulante / Candidato`.
9. Verificar que solo aparece el expediente y el estado del candidato, sin acceso a la tabla general.

## Comandos disponibles

```bash
npm run dev       # Inicia el entorno de desarrollo
npm run build     # Genera la versión de producción
npm run lint      # Revisa el código con Oxlint
npm run preview   # Previsualiza la compilación de producción
```

## Estado del proyecto

Este es un MVP frontend. Los datos y los roles están simulados en memoria para la demostración académica. No existe todavía autenticación real ni backend conectado.

Para una versión productiva se debería agregar:

- Inicio de sesión real.
- Autorización de permisos desde el backend.
- Base de datos de candidatos.
- Almacenamiento seguro de currículums e informes.
- Notificaciones reales al psicólogo.
- Registro de auditoría de cambios.
