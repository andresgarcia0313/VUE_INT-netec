<!-- InicioVista.vue: vista de la ruta /. El botón lanza un error a propósito para comprobar
     en el paso 3 que app.config.errorHandler lo atrapa y lo registra. -->
<script setup>
// Lanza un error para comprobar en el paso 3 que la observabilidad lo registra
function simularError() {
  throw new Error('Error de prueba desde Inicio')
}
</script>

<template>
  <h2>Inicio</h2>
  <button type="button" @click="simularError">Simular error</button>
</template>
