<!--
  ProjectHubLayout.vue: componente de la ruta PADRE /app (layout o marco).
  Dibuja lo común (encabezado y menú) y, en su propio <RouterView>, la ruta HIJA
  (/app/dashboard, /app/projects, /app/tasks/:taskId). Eso son las rutas anidadas.
-->
<script setup>
// useRouter() devuelve el enrutador para navegar desde código (navegación programática).
import { useRouter } from 'vue-router'          // para navegar desde el código
import { useSesion } from '../sesion'           // el composable de sesión

const router = useRouter()                      // el enrutador de la aplicación
const { usuario, salir } = useSesion()          // quién está dentro y cómo salir

function cerrarSesion() {                       // acción del botón Cerrar sesión
  salir()                                       // borra el usuario
  // push agrega una entrada al historial; navegar por name evita escribir direcciones a mano.
  router.push({ name: 'login' })                // navega por nombre, no por dirección
}
</script>

<template>
  <header>
    <strong>ProjectHub</strong>
    <!-- Solo se muestra cuando alguien inició sesión -->
    <span v-if="usuario"> - {{ usuario.nombre }} ({{ usuario.rol }})
      <button type="button" @click="cerrarSesion">Cerrar sesión</button>
    </span>
  </header>
  <nav aria-label="Navegación principal">
    <!-- RouterLink dibuja un <a> que navega sin recargar la página; :to recibe un objeto con el name de la ruta -->
    <!-- Cada enlace apunta a una ruta por su nombre -->
    <RouterLink :to="{ name: 'dashboard' }">Tablero</RouterLink> |
    <RouterLink :to="{ name: 'projects' }">Proyectos</RouterLink> |
    <!-- params llena el segmento dinámico :taskId de la ruta task-detail -->
    <RouterLink :to="{ name: 'task-detail', params: { taskId: 'task-202' } }">Tarea 202</RouterLink>
    <!-- Ocultar el enlace es comodidad; la que protege /admin es la guardia -->
    <span v-if="usuario?.rol === 'admin'"> | <RouterLink :to="{ name: 'admin' }">Administración</RouterLink></span>
  </nav>
  <main>
    <!-- RouterView anidado: aquí se dibujan las rutas hijas de /app -->
    <RouterView />
  </main>
</template>
