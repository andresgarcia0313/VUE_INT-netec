// https://on.cypress.io/api
// E2E de ejemplo de create-vue: abre la aplicación en un navegador real y busca el título.
// Se borra en el paso 7, porque el catálogo ya no dice "You did it!".

describe('My First Test', () => {
  it('visits the app root url', () => {
    cy.visit('/')                       // abre baseUrl de cypress.config.js
    cy.contains('h1', 'You did it!')    // espera a que aparezca un h1 con ese texto
  })
})
