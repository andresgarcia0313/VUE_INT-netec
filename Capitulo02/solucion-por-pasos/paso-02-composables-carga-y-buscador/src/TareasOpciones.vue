<!-- Punto de partida en Options API: cada tarea del componente queda repartida por tipo de código -->
<!--
  Options API (interfaz de opciones): el componente es un objeto con secciones fijas
  (data, computed, watch, mounted...). El código se agrupa por TIPO y no por TAREA:
  la carga vive en data y en mounted; la preferencia, en data y en watch.
  Dentro de las opciones se llega a los datos con this.
-->
<script>
import { pedirTareas } from './datos.js'                // la carga simulada

export default {
  // data() devuelve el estado inicial; Vue lo vuelve reactivo (vigilado).
  data() {                                              // 1. DATOS de todas las tareas, juntos
    return {
      tareas: [],                                       // carga: la lista que llega
      cargando: true,                                   // carga: bandera de espera
      texto: '',                                        // buscador: lo que se escribe
      compacta: localStorage.getItem('compacta') === 'true' // preferencia: lee lo guardado antes
    }
  },
  // computed: valores calculados que Vue guarda y recalcula solo si cambia lo que usan.
  computed: {                                           // 2. CÁLCULOS
    visibles() {                                        // buscador: filtra por texto
      const buscado = this.texto.toLowerCase()          // this: así se llega a los datos en Options API
      return this.tareas.filter((t) => t.titulo.toLowerCase().includes(buscado)) // deja las que coinciden
    }
  },
  // watch: ejecuta un efecto (algo que pasa afuera, como guardar) cuando un dato cambia.
  watch: {                                              // 3. EFECTOS
    compacta(nuevo) {                                   // preferencia: se ejecuta cuando cambia
      localStorage.setItem('compacta', String(nuevo))   // preferencia: la guarda en el navegador
    }
  },
  // mounted: hook (gancho) del ciclo de vida que Vue llama cuando el componente ya está en la página.
  async mounted() {                                     // 4. HOOKS: cuando el componente aparece
    this.tareas = await pedirTareas()                   // carga: pide las tareas y espera
    this.cargando = false                               // carga: termina la espera
  }
}
</script>

<template>
  <!-- :class="{ compacta }" agrega la clase compacta solo si el dato compacta es true -->
  <section :class="{ compacta }">
    <h2>Antes: Options API</h2>
    <!-- v-model une la caja de texto (o la casilla) con un dato en los dos sentidos -->
    <input v-model="texto" aria-label="Buscar tarea" placeholder="Buscar..." />
    <label><input type="checkbox" v-model="compacta" /> Vista compacta</label>
    <!-- v-if / v-else: dibuja uno u otro bloque según la condición -->
    <p v-if="cargando">Cargando...</p>
    <ul v-else>
      <li v-for="t in visibles" :key="t.id">{{ t.hecha ? '✔' : '○' }} {{ t.titulo }}</li>
    </ul>
  </section>
</template>
