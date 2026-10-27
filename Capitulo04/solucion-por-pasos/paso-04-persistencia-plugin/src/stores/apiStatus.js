// Tienda de ESTADO DE LA API (apiStatus): cuántas peticiones van en curso y qué errores hubo.
// Concepto: centralizar la carga y los errores. En vez de que cada tienda o vista maneje su propio
// "cargando..." y su propio mensaje de error, toda llamada a la API pasa por track().
import { defineStore } from 'pinia'          // crea tiendas
import { computed, ref } from 'vue'          // piezas del capítulo 1
import { useUiStore } from './ui.js'         // dependencia en una sola dirección: apiStatus -> ui

export const useApiStatusStore = defineStore('apiStatus', () => {
  const pending = ref(0)                     // cuántas peticiones van en curso
  const errors = ref([])                     // todos los errores de la API, en un solo lugar
  const isBusy = computed(() => pending.value > 0) // getter: ¿hay alguna petición en curso?

  // request es una FUNCIÓN que hace la llamada (por ejemplo () => api.getTasks()):
  // así track decide cuándo ejecutarla y puede rodearla con try, catch y finally.
  async function track(label, request) {     // envuelve cualquier llamada a la API
    pending.value++                          // una petición más en curso
    try {
      return await request()                 // espera la respuesta y la devuelve tal cual
    } catch (error) {
      errors.value.push({ label, message: error.message }) // la anota en el registro central
      // Una tienda puede usar otra: se pide con su use...() dentro de la action
      useUiStore().notify(`No se pudo ${label}: ${error.message}`) // y avisa a la persona
      throw error                            // quien llamó también se entera
    } finally {
      pending.value--                        // pase lo que pase, una menos en curso
    }
  }

  return { pending, errors, isBusy, track }
})
