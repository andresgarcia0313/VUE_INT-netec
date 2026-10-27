<!--
  App.vue: componente raíz. Ya no dibuja contenido propio: delega todo al enrutador.
  <RouterView> es un "hueco" que Vue Router llena con el componente de la ruta actual.
  Al cambiar la dirección, cambia lo que aparece aquí sin recargar la página (SPA).
-->
<template>
  <!-- RouterView raíz: aquí el enrutador dibuja la pantalla de la ruta actual -->
  <RouterView />
</template>
