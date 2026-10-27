<!--
  NotFoundView.vue: la dibuja la ruta comodín '/:pathMatch(.*)*',
  que atrapa cualquier dirección que no coincide con otra ruta (error 404 de la SPA).
-->
<template>
  <main>
    <h1>Página no encontrada</h1>
    <p>Esa dirección no existe en ProjectHub.</p>
    <RouterLink :to="{ name: 'dashboard' }">Ir al tablero</RouterLink>
  </main>
</template>
