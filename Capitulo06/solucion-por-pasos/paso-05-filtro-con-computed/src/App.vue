<!--
  App.vue: el marco de Catálogo Pro. El encabezado se queda fijo y <RouterView /> cambia según la ruta.
  RouterLink dibuja un enlace que navega sin recargar la página (es una SPA, aplicación de una sola página).
-->
<template>
  <header>
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
