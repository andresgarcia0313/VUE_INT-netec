<!-- App.vue: componente raíz. RouterLink cambia la dirección sin recargar la página y
     RouterView muestra la vista que corresponde a la ruta actual. -->
<template>
  <h1>Catálogo Pro</h1>
  <!-- aria-label nombra el menú para los lectores de pantalla -->
  <nav aria-label="Principal">
    <RouterLink to="/">Inicio</RouterLink> |
    <RouterLink to="/catalogo">Catálogo</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>
