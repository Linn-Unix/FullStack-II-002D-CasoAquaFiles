import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configuración de las pruebas con Vitest.
  test: {
    environment: 'jsdom', // simula un navegador para probar componentes
    globals: true,
    setupFiles: './src/setupTests.js',
    // Las pruebas que completan formularios enteros pueden tardar más de 5 s en un PC lento.
    testTimeout: 15000,
  },
})