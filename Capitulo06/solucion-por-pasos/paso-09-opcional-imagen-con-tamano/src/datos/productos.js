// Datos de ejemplo: cópialo tal cual, no es el tema de hoy
// Concepto: 2.000 productos son suficientes para que dibujarlos todos se note en la medida.
// La función pedirProductos imita una API (capítulo 5): devuelve una promesa que se cumple en 300 ms.
const TIPOS = ['Audio', 'Cómputo', 'Hogar', 'Oficina']         // cuatro tipos de producto que se repiten
const productos = Array.from({ length: 2000 }, (_, i) => ({    // crea 2.000 productos
  id: i + 1,                                                   // identificador único: 1, 2, 3...
  nombre: `Producto ${i + 1}`,                                 // nombre visible
  tipo: TIPOS[i % 4],                                          // % es el residuo: reparte en los 4 tipos
  precio: 10 + ((i * 37) % 490),                               // precio entre 10 y 499 dólares
  stock: 5 + ((i * 13) % 45)                                   // unidades disponibles
}))

// Repaso del capítulo 5: simula una API REST que responde en 300 ms
export function pedirProductos() {
  return new Promise((resolver) =>                             // promesa: el resultado llega después
    setTimeout(() => resolver([...productos]), 300))           // [...] entrega una copia, no la lista original
}
