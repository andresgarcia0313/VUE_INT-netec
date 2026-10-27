<!-- CatalogoVista.vue: vista de la ruta /catalogo. Usa el componente compartido EtiquetaEstado,
     importado por la puerta de entrada del paquete @catalogo/ui (packages/ui/src/index.js). -->
<script setup>
import { EtiquetaEstado } from '@catalogo/ui' // nunca '@catalogo/ui/src/...'

const productos = [
  { id: 1, nombre: 'Teclado', estado: 'activo' },
  { id: 2, nombre: 'Monitor', estado: 'agotado' },
  { id: 3, nombre: 'Ratón', estado: 'pendiente' }
]
</script>

<template>
  <h2>Catálogo</h2>
  <ul>
    <!-- v-for dibuja una fila por producto; :key ayuda a Vue a reconocer cada fila -->
    <li v-for="producto in productos" :key="producto.id">
      {{ producto.nombre }} <EtiquetaEstado :estado="producto.estado" />
    </li>
  </ul>
</template>
