// src/main.js: arranca MSW y después monta Vue
// Concepto: MSW (Mock Service Worker) registra un Service Worker, un programa que el navegador
// pone entre la página y la red. Cada petición pasa por él y, si coincide con un handler,
// MSW responde como si fuera el servidor. Por eso hay que esperar a que arranque ANTES de montar
// Vue: si Vue pide datos primero, esa petición se va a la red real y falla.
import { createApp } from 'vue'          // crea la aplicación
import { createPinia } from 'pinia'      // el almacén de estado del capítulo 4
import App from './App.vue'              // el componente raíz

async function start() {                 // async: dentro se puede esperar con await
  // import.meta.env.DEV vale true solo con el servidor de desarrollo de Vite (npm run dev o npx vite);
  // en la compilación de producción vale false y este bloque ni siquiera entra al paquete final.
  if (import.meta.env.DEV) {             // solo en desarrollo, nunca en producción
    // import() dinámico: descarga el módulo solo cuando se ejecuta esta línea (y devuelve una promesa)
    const { setupWorker } = await import('msw/browser')     // trae MSW solo si hace falta
    const { handlers } = await import('./mocks/handlers')   // las respuestas simuladas
    // start: registra el trabajador; lo que no simula pasa a la red real
    await setupWorker(...handlers).start({ onUnhandledRequest: 'bypass' })
  }
  // Encadenado: createApp(App) crea la app, .use instala Pinia y .mount la dibuja en <div id="app">
  createApp(App).use(createPinia()).mount('#app')   // monta Vue cuando MSW ya escucha
}

start()                                  // ejecuta el arranque
