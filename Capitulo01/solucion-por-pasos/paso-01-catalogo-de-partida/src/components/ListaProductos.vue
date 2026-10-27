<!--
  ListaProductos.vue: buscador y una tarjeta por producto.
  Versión de partida (paso 1): el filtro es una función normal que la plantilla llama
  en cada dibujo. Funciona, pero repite el cálculo aunque la búsqueda no cambie.
-->
<script setup>
// Lista: buscador y una tarjeta por producto
import { ref, inject, onUpdated } from 'vue'          // onUpdated avisa después de cada redibujo
import TarjetaProducto from './TarjetaProducto.vue'
import { contar } from '../medicion.js'               // contadores del panel

// inject(clave) recibe lo que un componente de más arriba ofreció con provide(clave, ...).
const { productos, favoritos } = inject('catalogo')  // recibe lo que App compartió con provide
const consulta = ref('')                              // texto del buscador: solo lo usa la lista

// Función normal: Vue no guarda su resultado. Cada vez que la plantilla se dibuja, la llama otra vez.
function filtrar() {                                  // productos cuyo nombre contiene el texto buscado
  contar('filtro')                                    // cuenta cada cálculo del filtro
  const texto = consulta.value.trim().toLowerCase()   // trim quita espacios a los lados; toLowerCase pasa a minúsculas
  if (!texto) return productos.value                  // sin texto: todos los productos
  return productos.value.filter((p) => p.nombre.toLowerCase().includes(texto))
}

// onUpdated es un hook (gancho) del ciclo de vida: Vue lo llama cada vez que este componente
// termina de volver a dibujarse. Aquí sirve para contar los redibujos de la lista.
onUpdated(() => contar('lista'))                      // cuenta cada vez que la lista se vuelve a dibujar
</script>

<template>
  <label for="buscar">Buscar producto</label>
  <!-- v-model une la caja de texto con consulta: lo que escribes la cambia -->
  <input id="buscar" v-model="consulta" type="search" placeholder="Ejemplo: cable" />
  <p>Favoritos: {{ favoritos.length }} de {{ productos.length }} productos</p>
  <ul class="lista">
    <!-- filtrar() se ejecuta otra vez cada vez que la lista se dibuja -->
    <!-- v-for repite el <li> por cada producto; :key le da a Vue un id estable para reconocer cada fila -->
    <li v-for="producto in filtrar()" :key="producto.id">
      <!-- :producto (forma corta de v-bind:producto) le pasa el objeto a la tarjeta como prop -->
      <TarjetaProducto :producto="producto" />
    </li>
  </ul>
</template>
