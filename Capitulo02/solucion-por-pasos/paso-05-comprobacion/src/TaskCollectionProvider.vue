<!-- Renderless: no dibuja nada propio; entrega la lista y sus acciones por el slot -->
<!--
  Un slot es un hueco que el componente padre llena con su propio HTML.
  Un slot con datos (scoped slot) además le pasa valores a ese HTML: aquí lista, cargando,
  error y seleccionar. El padre los recibe con v-slot="{ lista, ... }" y decide cómo se ven.
  Así se separa QUÉ datos hay (este componente) de CÓMO se dibujan (el padre).
-->
<script setup>
import { useProjectHubContext } from './keys.js'        // composable que lee el contexto
const { visibles, cargando, error, seleccionar } = useProjectHubContext() // toma solo lo que va a entregar
</script>

<template>
  <slot :lista="visibles" :cargando :error :seleccionar /> <!-- :cargando es la forma corta de :cargando="cargando" -->
</template>
