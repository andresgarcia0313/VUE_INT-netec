// Tienda de SESIÓN (auth): quién entró y su credencial.
// Concepto: una tienda de Pinia guarda estado GLOBAL, el que comparten varias partes de la app
// (aquí: el encabezado, el formulario de login y la guardia del enrutador leen la misma sesión).
// defineStore recibe un id único ('auth'), una función que arma la tienda y, opcional, unas opciones.
import { defineStore } from 'pinia'          // crea tiendas
import { computed, ref } from 'vue'          // piezas del capítulo 1
import { api } from '@/api.js'               // API simulada (@ = src)

// Tienda de composición: una función que arma la tienda con ref, computed y funciones
// - ref = dato (state)   - computed = getter (dato calculado)   - function = action (lo que cambia datos)
// El nombre useAuthStore empieza por "use" como todo composable: se llama para obtener la tienda.
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)                     // sesión mínima: { name, roles }; null = sin sesión
  const token = ref(null)                    // credencial: vive solo en memoria, nunca se guarda
  const isAuthenticated = computed(() => user.value !== null) // getter: ¿hay sesión?

  async function signIn(name) {              // action asíncrona: espera a la API
    const session = await api.signIn(name)   // si el nombre está vacío, lanza un error
    user.value = session.user                // guarda quién entró y sus roles
    token.value = session.token              // el token queda solo en memoria
  }

  function signOut() {                       // action: cierra la sesión
    user.value = null                        // sin usuario...
    token.value = null                       // ...y sin token
  }

  // Solo lo que se devuelve aquí forma parte de la tienda (y lo ve Vue DevTools)
  return { user, token, isAuthenticated, signIn, signOut } // lo que ven los componentes
}, {
  // persist es una opción NUESTRA: Pinia la ignora; la leerá el plugin del paso 4
  persist: { key: 'projecthub:auth:v1', paths: ['user'] }  // solo user; token queda fuera
})
