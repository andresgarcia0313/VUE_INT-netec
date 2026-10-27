<!--
  LoginView.vue: pantalla pública de ingreso (/login).
  Lee ?redirect= de la dirección (lo puso la guardia) para devolver a la persona
  a la página que intentaba abrir antes de pedirle sesión.
-->
<script setup>
import { ref } from 'vue'                            // datos reactivos del formulario
// useRoute(): la ruta ACTUAL (path, params, query). useRouter(): el enrutador para navegar.
import { useRoute, useRouter } from 'vue-router'     // la ruta actual y el enrutador
import { useSesion } from '../sesion'                // el composable de sesión

const route = useRoute()                             // para leer ?redirect= de la dirección
const router = useRouter()                           // para navegar al terminar
const { entrar } = useSesion()                       // acción de iniciar sesión
const correo = ref('user@projecthub.dev')            // valor inicial para probar rápido
const error = ref('')                                // mensaje si el ingreso falla

async function ingresar() {                          // se ejecuta al enviar el formulario
  error.value = ''                                   // limpia el error anterior
  try {
    await entrar(correo.value)                       // espera la respuesta simulada
    await router.replace(route.query.redirect || { name: 'dashboard' }) // vuelve a donde iba; replace no deja el ingreso en el historial
  } catch (e) {
    error.value = e.message                          // muestra por qué falló
  }
}
</script>

<template>
  <main>
    <h1>Ingresar a ProjectHub</h1>
    <!-- .prevent evita que el navegador recargue la página al enviar -->
    <form @submit.prevent="ingresar">
      <label for="correo">Correo</label>
      <!-- v-model.trim enlaza el campo con la ref correo en ambos sentidos y quita espacios -->
      <input id="correo" v-model.trim="correo" type="email" required />
      <button type="submit">Entrar</button>
      <!-- role="alert" hace que el lector de pantalla lea el error -->
      <p v-if="error" role="alert">{{ error }}</p>
    </form>
    <p>Cuentas de prueba: user@projecthub.dev y admin@projecthub.dev</p>
  </main>
</template>
