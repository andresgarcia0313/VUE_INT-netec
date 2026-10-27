<!--
  AdminView.vue: ruta /admin, protegida con meta: { requiresAuth: true, roles: ['admin'] }.
  Desde el paso 3 se carga con () => import(): Vite la deja en su propio archivo .js.
-->
<template>
  <main>
    <h1>Administración</h1>
    <p>Esta vista viaja en su propio archivo: solo la descarga quien entra aquí.</p>
    <RouterLink :to="{ name: 'dashboard' }">Volver al tablero</RouterLink>
  </main>
</template>
