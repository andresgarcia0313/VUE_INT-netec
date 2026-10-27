// Los 12 productos del catálogo. En una aplicación real llegarían del servidor. Cópialo tal cual.
// Es un arreglo de JavaScript normal, sin reactividad: App.vue lo copia dentro de un ref (o shallowRef)
// para que Vue lo vigile y vuelva a dibujar cuando cambie.
export const productosIniciales = [
  { id: 1, nombre: 'Cámara web', precio: 180000 }, { id: 2, nombre: 'Teclado', precio: 150000 },
  { id: 3, nombre: 'Mouse inalámbrico', precio: 90000 }, { id: 4, nombre: 'Monitor 24 pulgadas', precio: 720000 },
  { id: 5, nombre: 'Audífonos', precio: 210000 }, { id: 6, nombre: 'Micrófono', precio: 260000 },
  { id: 7, nombre: 'Base para portátil', precio: 85000 }, { id: 8, nombre: 'Disco externo', precio: 340000 },
  { id: 9, nombre: 'Memoria USB', precio: 45000 }, { id: 10, nombre: 'Lámpara de escritorio', precio: 120000 },
  { id: 11, nombre: 'Silla ergonómica', precio: 950000 }, { id: 12, nombre: 'Cable HDMI', precio: 30000 }
]
