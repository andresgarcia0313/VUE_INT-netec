<!--
  ChunkRecoveryView.vue: pantalla de rescate (/chunk-recovery?target=...).
  router.onError la muestra cuando falla la descarga de un fragmento (chunk), por ejemplo
  porque se publicó una versión nueva y el archivo viejo ya no existe en el servidor.
-->
<script setup>
import { useRoute } from 'vue-router'                // para leer ?target= de la dirección

const route = useRoute()                             // la ruta actual

function recargar() {                                // acción del botón Recargar
  const destino = String(route.query.target || '/')  // la página que no se pudo abrir
  // Seguridad: solo se acepta un destino del mismo origen, para no redirigir a sitios externos.
  const url = new URL(destino, window.location.origin)  // dirección completa, como la entiende el navegador
  const interno = url.origin === window.location.origin // solo direcciones de esta aplicación
  window.location.assign(interno ? url.pathname + url.search + url.hash : '/') // recarga completa: trae la versión publicada
}
</script>

<template>
  <main>
    <h1>No se pudo cargar esta parte de la aplicación</h1>
    <p>Puede que se haya publicado una versión nueva. Recarga para traerla.</p>
    <button type="button" @click="recargar">Recargar</button>
  </main>
</template>
