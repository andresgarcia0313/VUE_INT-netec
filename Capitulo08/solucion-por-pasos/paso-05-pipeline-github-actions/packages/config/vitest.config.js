// Reglas de prueba comunes a todos los paquetes
// Viven en un paquete propio (@catalogo/config) para que cada paquete las reutilice y no las copie.
export default {
  test: {
    include: ['src/**/*.test.js'], // dónde viven las pruebas
    reporters: ['verbose'] // muestra el nombre de cada prueba
  }
}
