// Arma los .zip de la entrega: frontend y backend por separado.
// Usa "git archive", que solo incluye los archivos guardados en git: así quedan fuera
// node_modules, target, dist, uploads y los .env con claves (todos están en .gitignore).
// Uso: npm run empaquetar  →  crea la carpeta "entrega/" con los dos .zip.
import { execFileSync } from 'node:child_process'
import { mkdirSync, statSync } from 'node:fs'

// 1. Avisamos si hay cambios sin commit: esos cambios NO quedarían en el zip.
const pendientes = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()
if (pendientes) {
  console.warn('⚠️  Hay cambios sin commit. El zip usa la última versión guardada en git (HEAD).')
}

mkdirSync('entrega', { recursive: true })

// 2. Frontend: todo menos la carpeta backend/. Backend: solo backend/.
const paquetes = [
  { archivo: 'entrega/AquaFiles-frontend.zip', rutas: ['.', ':(exclude)backend'] },
  { archivo: 'entrega/AquaFiles-backend.zip', rutas: ['backend'] },
]

for (const { archivo, rutas } of paquetes) {
  execFileSync('git', ['archive', '--format=zip', `--output=${archivo}`, 'HEAD', '--', ...rutas])
  const kb = Math.round(statSync(archivo).size / 1024)
  console.log(`✅ ${archivo} (${kb} KB)`)
}

// 3. Revisión final: ningún archivo de claves (.env) dentro de los zip.
for (const { archivo, rutas } of paquetes) {
  const nombres = execFileSync('git', ['ls-files', '--', ...rutas], { encoding: 'utf8' }).split('\n')
  const conClaves = nombres.filter((nombre) => /(^|\/)\.env(\.local|\.production\.local)?$/.test(nombre))
  if (conClaves.length > 0) {
    console.error(`❌ ${archivo} contiene archivos con claves: ${conClaves.join(', ')}. Sácalos de git.`)
    process.exitCode = 1
  }
}
