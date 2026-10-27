<script setup>
// LoginView: el formulario para iniciar sesión (ruta /login).
// Concepto: estado LOCAL frente a estado GLOBAL. Lo que solo usa este formulario (lo que se escribe,
// el mensaje de error) va en ref locales; la sesión, que la usan varias partes, va en la tienda auth.
import { ref } from 'vue'                         // estado local del formulario
import { useRoute, useRouter } from 'vue-router'  // la ruta actual y el enrutador
import { useAuthStore } from '@/stores/auth.js'   // la tienda de sesión

const auth = useAuthStore()                       // estado global: la sesión
const route = useRoute()                          // para leer ?redirect=...
const router = useRouter()                        // para navegar al entrar
const name = ref('')                              // estado LOCAL: solo lo usa este formulario
const error = ref('')                             // también local: el mensaje del formulario

async function submit() {
  error.value = ''                                // borra el mensaje anterior
  try {
    await auth.signIn(name.value)                 // la tienda habla con la API
    router.push(route.query.redirect ?? '/proyectos') // vuelve adonde quería ir (capítulo 3)
  } catch (e) {
    error.value = e.message                       // muestra por qué no pudo entrar
  }
}
</script>

<template>
  <!-- @submit.prevent: llama a submit y evita que el navegador recargue la página al enviar -->
  <form @submit.prevent="submit">
    <h2>Iniciar sesión</h2>
    <!-- v-model: enlace en dos sentidos entre el campo y el ref name -->
    <label>Nombre <input v-model="name" autocomplete="username" /></label>
    <button type="submit">Entrar</button>
    <!-- v-if: el párrafo solo existe si hay mensaje; role="alert" hace que el lector de pantalla lo anuncie -->
    <p v-if="error" role="alert">{{ error }}</p>
  </form>
</template>
