// cypress.config.js: configuración de Cypress, que prueba la aplicación de extremo a extremo (E2E)
// en un navegador real. Así lo deja create-vue; en el paso 7 cambia el puerto.
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}', // qué archivos son pruebas E2E
    baseUrl: 'http://localhost:4173',                          // dirección que abre cy.visit('/')
  },
})
