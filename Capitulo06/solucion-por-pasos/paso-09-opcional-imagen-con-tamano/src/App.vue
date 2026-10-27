<!--
  App.vue: el marco de Catálogo Pro. El encabezado se queda fijo y <RouterView /> cambia según la ruta.
  RouterLink dibuja un enlace que navega sin recargar la página (es una SPA, aplicación de una sola página).
  Paso opcional. Concepto: una imagen con width y height declarados reserva su espacio antes de
  descargarse, así la página no "salta" (Lighthouse lo mide como CLS). No lleva loading="lazy" porque
  está arriba y se ve al entrar: lazy es para imágenes debajo del borde de la pantalla.
-->
<template>
  <header>
    <img src="/favicon.ico" alt="" width="28" height="28" />   <!-- width y height reservan el espacio: la página no salta -->
    <strong>Catálogo Pro</strong>
    <!-- aria-label nombra el menú para los lectores de pantalla -->
    <nav aria-label="Principal">
      <RouterLink to="/">Catálogo</RouterLink>
      <RouterLink to="/reportes">Reportes</RouterLink>
      <RouterLink to="/admin">Administración</RouterLink>
    </nav>
  </header>
  <!-- RouterView dibuja la vista de la ruta actual -->
  <main><RouterView /></main>
</template>

<style>
body { margin: 0; font-family: system-ui, sans-serif; color: #1a1a1a; background: #fff; }
header { display: flex; gap: 1.5rem; align-items: center; padding: 0.75rem 1rem; background: #1e3a5f; color: #fff; }
nav { display: flex; gap: 1rem; }
nav a { color: #fff; }
main { padding: 1rem; }
</style>
