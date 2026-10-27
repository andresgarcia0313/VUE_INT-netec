// Tienda de INTERFAZ (ui): preferencias de la persona (tema y filtro) y el aviso momentáneo (toast).
// Concepto: una tienda por DOMINIO. Lo visual va aquí y no mezclado con la sesión o con los datos de la API.
// Esta tienda no usa ninguna otra: está en la base de las dependencias (apiStatus y tasks la usan a ella).
import { defineStore } from 'pinia'          // crea tiendas
import { ref, watch } from 'vue'             // piezas del capítulo 1

export const useUiStore = defineStore('ui', () => {
  const theme = ref('light')                 // preferencia: 'light' u 'dark'
  const filter = ref('todas')                // preferencia: 'todas', 'pendientes' o 'hechas'
  const toast = ref('')                      // aviso momentáneo: NO se guarda

  function toggleTheme() {                   // action: alterna claro y oscuro
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function notify(message) {                 // action: muestra (o borra, con '') un aviso
    toast.value = message
  }

  // efecto secundario: cada vez que cambia el tema, lo aplica a la página
  // watch observa un ref y ejecuta la función cuando cambia; immediate: true la ejecuta también al nacer
  watch(theme, (value) => { document.documentElement.dataset.theme = value }, { immediate: true })

  return { theme, filter, toast, toggleTheme, notify }
}, {
  // Política de persistencia: la leerá el plugin del paso 4. Solo lo que eligió la persona.
  persist: { key: 'projecthub:ui:v1', paths: ['theme', 'filter'] } // toast queda fuera a propósito
})
