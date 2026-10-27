<script setup>
// App.vue: el componente raíz. Dibuja el encabezado y, debajo, la vista de la ruta actual.
// Concepto: storeToRefs. Si haces const { user } = auth, user queda como una copia SIN reactividad
// y deja de actualizarse. storeToRefs convierte los datos y getters de la tienda en refs conectados.
// Las actions (funciones) no necesitan storeToRefs: se llaman directo, auth.signOut().
import { storeToRefs } from 'pinia'              // saca datos de una tienda sin perder la conexión
import { useRouter } from 'vue-router'           // para navegar desde código
import { useAuthStore } from '@/stores/auth.js'  // la tienda de sesión

const auth = useAuthStore()                      // la misma tienda que consulta la guardia
const { user } = storeToRefs(auth)               // lo que se lee, con storeToRefs
const router = useRouter()                       // el enrutador

function logout() {
  auth.signOut()                                 // lo que se llama, directo desde la tienda
  router.push({ name: 'login' })                 // de vuelta al formulario
}
</script>

<template>
  <header>
    <h1>ProjectHub</h1>
    <!-- Solo con sesión: nombre, roles y el botón Salir -->
    <p v-if="user">
      {{ user.name }} ({{ user.roles.join(', ') }})
      <button type="button" @click="logout">Salir</button>
    </p>
  </header>
  <main>
    <!-- RouterView: aquí se dibuja la vista de la ruta actual (login o proyectos) -->
    <RouterView />
  </main>
</template>

<style>
/* Estilos: cópialos tal cual, no son el tema de hoy */
/* El tema oscuro se activa cuando la tienda ui pone data-theme="dark" en <html> (paso 3) */
:root { font-family: system-ui, sans-serif; background: #ffffff; color: #1a1a1a; }
:root[data-theme='dark'] { background: #1a1a1a; color: #f2f2f2; }
body { margin: 0 auto; max-width: 720px; padding: 1rem; }
[role='alert'] { border: 2px solid #b00020; padding: 0.5rem; }
</style>
