// Función pura: con los mismos datos devuelve siempre el mismo resultado y no toca nada más.
// Por eso es la base de la pirámide: se prueba sola, sin Vue, sin red y en milisegundos.
export function filtrarProductos(productos, texto) {
  if (!Array.isArray(productos)) {                        // ¿llegó algo que no es una lista?
    throw new TypeError('productos debe ser una lista')  // falla pronto y con un mensaje claro
  }
  const buscado = texto.trim().toLowerCase()              // quita espacios y pasa a minúsculas
  if (!buscado) return productos                          // sin texto: todos los productos
  return productos.filter((p) => p.nombre.toLowerCase().includes(buscado)) // solo los que lo contienen
}
