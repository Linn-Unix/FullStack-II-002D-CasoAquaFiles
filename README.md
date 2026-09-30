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

## Despliegue en Vercel

El proyecto incluye `vercel.json` con la configuración de Vite. Para publicarlo:

**Demo publicada:** [AquaFiles en Vercel](https://full-stack-ii-002-d-caso-aqua-files.vercel.app/)

1. Sube este repositorio a GitHub.
2. Entra a [vercel.com](https://vercel.com/) y selecciona **Add New Project**.
3. Importa el repositorio y conserva la configuración detectada:
        - Framework: `Vite`
        - Build Command: `npm run build`
        - Output Directory: `dist`
4. Presiona **Deploy**.

Cada nuevo push a la rama conectada generará un despliegue automáticamente.

## Roles y permisos

### Postulante / Candidato

El candidato inicia su propia postulación desde el formulario público:

- Registrar datos personales y correo.
- Seleccionar familia de cargo y ubicación.
- Indicar el cargo al que postula.
- Adjuntar su CV en PDF o Word.
- Consultar el estado de su propia candidatura.

No puede ver otros candidatos, el dashboard interno, las notas técnicas ni modificar estados.

### Supervisor Técnico / Analista de Selección

El supervisor tiene acceso a la gestión completa del proceso:

- Ver todos los candidatos registrados.
- Buscar candidatos por nombre, cargo o ubicación.
- Consultar currículum y descriptor de cargo.
- Evaluar la etapa técnica y aprobar candidatos.
- Revisar indicadores de candidatos en revisión, aprobados y finalizados.
- Consultar el resumen de candidatos que aprobaron el filtro técnico.
- Derivar el dossier y avisar al psicólogo.
- No redactar ni alterar el informe psicolaboral definitivo.

### Psicólogo/a / Contraparte de Selección

El psicólogo trabaja únicamente con candidatos aprobados técnicamente y derivados por el supervisor:

- Consultar el dossier técnico y CV.
- Agendar la entrevista psicolaboral.
- Subir el informe psicolaboral final.
- Marcar la tarea como `Proceso Finalizado`.
- No modificar la calificación técnica ni eliminar candidatos del pipeline.

## Pantallas

1. **Inicio por rol:** permite ingresar como Postulante, Supervisor o Psicólogo.
2. **Postulación del candidato:** formulario de datos personales, cargo, ubicación, familia y CV.
3. **Panel del supervisor:** tabla general, ficha técnica, indicadores y derivación de dossiers.
4. **Panel psicolaboral:** listado de candidatos aprobados, agenda e informe final.
5. **Seguimiento del candidato:** estado privado de la candidatura y documento propio.

## Flujo principal

1. El candidato registra sus datos y adjunta su CV.
2. La postulación queda en `En revisión técnica`.
3. El supervisor revisa el dossier y evalúa la etapa técnica.
4. Si aprueba, el candidato queda en `Aprobado técnicamente`.
5. El supervisor selecciona `Derivar y avisar`.
6. El psicólogo agenda la entrevista y el estado pasa a `Agendado`.
7. El psicólogo sube el informe final y marca `Proceso Finalizado`.

```text
En revisión técnica
        ↓
Aprobado técnicamente
        ↓
Agendado
        ↓
Proceso Finalizado
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
