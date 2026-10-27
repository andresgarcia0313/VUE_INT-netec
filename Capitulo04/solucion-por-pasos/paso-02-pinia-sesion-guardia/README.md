# Capítulo 4 - Paso 2. Pinia, sesión y guardia

<!-- lang: es-CO -->

Proyecto Vite completo con el código acumulado hasta este paso de la Práctica 4.4 (ProjectHub con Pinia). Los comentarios del código explican cada concepto.

## Qué cambió

Nuevos: `src/api.js`, `src/stores/auth.js`, `src/views/LoginView.vue`, `src/views/ProjectsView.vue` (provisional). Reemplazados: `src/main.js`, `src/router/index.js`, `src/App.vue`.

## Concepto

Una tienda de composición (`defineStore` con una función): `ref` es el dato, `computed` el getter y cada función una action. La guardia `beforeEach` pide la tienda de sesión dentro de la función, porque Pinia se instala antes que el enrutador. `storeToRefs` saca datos de la tienda sin perder la reactividad. El nombre escrito en el formulario es estado local, no va a la tienda.

## Cómo ejecutar

```bash
npm install              # instala las dependencias (una vez por carpeta)
npx vite --port 5174     # como en la guía; también sirve npm run dev (puerto 5173)
```

Abre `http://localhost:5174/proyectos` en Chrome.

## Qué debes ver

Según la guía: la guardia te lleva a `/login?redirect=/proyectos`. Pulsa **Entrar** con el nombre vacío: aparece `Escribe tu nombre para entrar`. Escribe `Ana` y pulsa **Entrar**: llegas a **Proyectos** y el encabezado dice `Ana (editor)`. [...] Vuelves al formulario: la tienda vive en memoria y la recarga la borra.

![Ana dentro de `/proyectos` con `Ana (editor)` y **Salir**.](captura.png)

*Ana dentro de `/proyectos` con `Ana (editor)` y **Salir**.*

![Entrar con el nombre vacío, en `/login?redirect=/proyectos`](captura-nombre-vacio.png)

*Entrar con el nombre vacío, en `/login?redirect=/proyectos`.*

![Tras `F5` vuelve al formulario: la sesión vivía solo en memoria](captura-f5.png)

*Tras `F5` vuelve al formulario: la sesión vivía solo en memoria.*
