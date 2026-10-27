# Práctica 8.4: diseñar y desplegar una aplicación escalable con pipeline automatizado

<!-- lang: es-CO -->
<!-- {% raw %} -->

| Campo | Valor |
|---|---|
| Duración | 43 minutos |
| Complejidad | Media |
| Nivel de Bloom | Crear |

## De qué trata

Vas a reorganizar Catálogo Pro en un monorepo (un solo repositorio con varias aplicaciones y paquetes) y a publicarlo con una pipeline (canalización automática que revisa, construye y publica). La app pasa a `apps/web`, con un paquete de interfaz compartido, observabilidad mínima, imagen Docker con Nginx y GitHub Actions. Para no depender de tu proyecto anterior, partes de una carpeta vacía y armas una versión mínima de Catálogo Pro.

Al terminar tendrás cuatro resultados a la vista: `✓ built` del monorepo, eventos `[catalogo-observability]` en la consola, el contenedor `healthy` y el flujo de CI en `completed success`.

## Objetivos

- Separar el código en `apps/` y `packages/` con pnpm workspaces, con dependencias en un solo sentido.
- Compartir un componente por su puerta de entrada (`index.js`) y una configuración de pruebas común.
- Registrar navegaciones, errores y la versión desplegada en la consola y en `localStorage`.
- Construir una imagen Docker de dos etapas con `/health` y rutas de Vue que no dan 404.
- Automatizar pruebas y compilación con GitHub Actions y publicar la imagen con su versión y su SHA (identificador del commit).

## Conceptos que usas

Monorepo, `pnpm-workspace.yaml`, `workspace:*` y puerta de entrada `index.js` (8.1); variables `VITE_`, Dockerfile de dos etapas, `.dockerignore`, Nginx con `try_files`, GitHub Actions, `--frozen-lockfile`, etiquetas `v1.0.0` y ghcr.io (8.2); `app.config.errorHandler` y rollback (8.3); create-vue con `--router` y el atajo `@` hacia `src` (capítulos 0 y 1); `beforeEach` y `afterEach` de Vue Router (capítulo 3); `describe`, `it` y `expect` de Vitest (capítulo 7).

**Repaso del capítulo 7:** la prueba de Vitest que escribes en el paso 1 es la misma que después corre la pipeline en cada cambio.

## Antes de empezar

- Node.js 24 LTS (validado con 24.22.0), Git, Chrome y Docker Desktop abierto.
- Cuenta de GitHub y GitHub CLI (`gh`, la herramienta de GitHub para la terminal) con sesión iniciada. Sin ella llegas hasta el paso 4 y el 5 lo ves en el equipo del instructor.
- Los comandos sirven igual en PowerShell y en bash, salvo donde se indica.

## Preparación (4 minutos)

1. Instala pnpm, el gestor de paquetes que entiende monorepos, en la versión del curso, y comprueba las herramientas:

   ```bash
   npm install -g pnpm@9.15.4
   pnpm --version
   docker version
   gh auth status
   ```

   **Qué debes ver:** `9.15.4`, una sección `Server` en `docker version` y `Logged in to github.com`.

   Si en `Token scopes` de `gh auth status` no aparece `workflow`, dale ese permiso ahora; sin él, GitHub rechaza el `push` del paso 5 porque trae archivos de `.github/workflows`:

   ```bash
   gh auth refresh -s workflow
   ```

2. En **otra** terminal, deja descargando las imágenes base mientras avanzas:

   ```bash
   docker pull node:24.22.0-alpine
   docker pull nginx:1.27.3-alpine
   ```

3. En la primera terminal, crea tu carpeta vacía, entra y arranca Git con la rama `main`:

   ```bash
   mkdir catalogo-platform
   cd catalogo-platform
   git init -b main
   ```

## Paso 1. Monorepo y paquetes compartidos (10 minutos)

**Qué vas a hacer y por qué:** la raíz solo coordina. Lo reutilizable vive en `packages/`: `@catalogo/ui` expone un componente solo por `src/index.js` y `@catalogo/config` guarda las reglas de prueba comunes. Las dependencias van en un solo sentido: `web` usa `ui`, `ui` usa `config`, nunca al revés.

1. En la raíz, crea `package.json`. `packageManager` fija pnpm (una sola fuente de verdad: la leen Docker y GitHub); `--filter` ejecuta en un paquete y `-r` en todos:

   ```json
   {
     "name": "catalogo-platform",
     "version": "1.0.0",
     "private": true,
     "packageManager": "pnpm@9.15.4",
     "scripts": {
       "dev": "pnpm --filter @catalogo/web dev",
       "test": "pnpm -r --if-present test",
       "build": "pnpm --filter @catalogo/web build"
     }
   }
   ```

2. Crea `pnpm-workspace.yaml` y `.gitignore` (este último, con lo que se regenera y no se sube).

   `pnpm-workspace.yaml`:

   ```yaml
   # cada carpeta dentro de apps/ y packages/ es un paquete del monorepo
   packages:
     - "apps/*"
     - "packages/*"
   ```

   `.gitignore`:

   ```text
   node_modules
   dist
   ```

3. El paquete de configuración.

   `packages/config/package.json`:

   ```json
   {
     "name": "@catalogo/config",
     "version": "1.0.0",
     "private": true,
     "type": "module",
     "exports": { "./vitest": "./vitest.config.js" }
   }
   ```

   `packages/config/vitest.config.js`:

   ```js
   // Reglas de prueba comunes a todos los paquetes
   export default {
     test: {
       include: ['src/**/*.test.js'], // dónde viven las pruebas
       reporters: ['verbose'] // muestra el nombre de cada prueba
     }
   }
   ```

4. El paquete de interfaz: `packages/ui/package.json`. `exports` es la puerta de entrada (de fuera no se puede importar otro archivo) y `workspace:*` enlaza el paquete hermano en lugar de descargarlo:

   ```json
   {
     "name": "@catalogo/ui",
     "version": "1.0.0",
     "private": true,
     "type": "module",
     "exports": { ".": "./src/index.js" },
     "scripts": { "test": "vitest run" },
     "peerDependencies": { "vue": "^3.5.0" },
     "devDependencies": {
       "@catalogo/config": "workspace:*",
       "vitest": "3.0.9",
       "vue": "3.5.13"
     }
   }
   ```

   `packages/ui/vitest.config.js`:

   ```js
   export { default } from '@catalogo/config/vitest' // reutiliza las reglas compartidas
   ```

5. La lógica y su prueba, como en el capítulo 7.

   `packages/ui/src/estado.js`:

   ```js
   const ETIQUETAS = { activo: 'Activo', agotado: 'Agotado', pendiente: 'Pendiente' }

   // Traduce el código del estado a la palabra que ve el usuario
   export function etiquetaDeEstado(estado) {
     return ETIQUETAS[estado] ?? 'Desconocido' // ?? da un valor de respaldo
   }
   ```

   `packages/ui/src/estado.test.js`:

   ```js
   import { describe, it, expect } from 'vitest'
   import { etiquetaDeEstado } from './estado.js'

   describe('etiquetaDeEstado', () => {
     it('traduce un estado conocido', () => {
       expect(etiquetaDeEstado('agotado')).toBe('Agotado')
     })
     it('avisa cuando no conoce el estado', () => {
       expect(etiquetaDeEstado('xyz')).toBe('Desconocido')
     })
   })
   ```

6. El componente y la puerta de entrada.

   `packages/ui/src/EtiquetaEstado.vue` (los estilos, cópialos tal cual):

   ```vue
   <script setup>
   import { computed } from 'vue'
   import { etiquetaDeEstado } from './estado.js'

   const props = defineProps({ estado: { type: String, required: true } })
   const texto = computed(() => etiquetaDeEstado(props.estado)) // se recalcula si cambia el estado
   </script>

   <template>
     <span class="etiqueta" :data-estado="estado">{{ texto }}</span>
   </template>

   <style scoped>
   .etiqueta { padding: 0.1rem 0.5rem; border-radius: 999px; font-weight: 700; background: #e5e7eb; color: #111827; }
   .etiqueta[data-estado='activo'] { background: #dcfce7; color: #166534; }
   .etiqueta[data-estado='agotado'] { background: #fee2e2; color: #991b1b; }
   </style>
   ```

   `packages/ui/src/index.js`:

   ```js
   // Puerta de entrada pública: las apps importan solo desde aquí
   export { default as EtiquetaEstado } from './EtiquetaEstado.vue'
   export { etiquetaDeEstado } from './estado.js'
   ```

7. **Primero, predice:** `pnpm test` en la raíz, ¿en cuántos paquetes corre pruebas? Ejecuta:

   ```bash
   pnpm install
   pnpm test
   ```

   **Qué debes ver:** `Scope: all 3 workspace projects` al instalar; después las dos pruebas con `✓` y `Tests  2 passed (2)`. Solo `ui` tiene script `test`; `--if-present` salta los demás.

## Paso 2. La app web consume el paquete (8 minutos)

**Qué vas a hacer y por qué:** la app vive en `apps/web` y usa `ui` solo por su puerta de entrada, sin rutas internas.

1. Crea la app con create-vue, la herramienta oficial de Vue (la misma de `npm create vue@latest` del capítulo 0), en una versión fija que funciona con Node 20, 22 y 24. Se lanza **dentro** de `apps/` porque create-vue usa el nombre de la carpeta como nombre del paquete y uno con `/` le haría preguntar. Los comandos son iguales en Windows (PowerShell), macOS y Linux:

   ```bash
   mkdir apps
   cd apps
   npx --yes create-vue@3.16.4 web --bare --router
   cd ..
   ```

   `--router` agrega Vue Router y `src/router/index.js`; `--bare` deja el proyecto mínimo, sin componentes de ejemplo. Escribe las opciones sin `--` delante del nombre: PowerShell se lo come. create-vue solo copia archivos y no instala nada, así que no mezcla npm con pnpm: la instalación la hace pnpm en el punto 6. **No ejecutes** el `npm install` que sugiere al final.

   Mira lo que trajo `apps/web`: `index.html`, `vite.config.js` (Vite 6 con el atajo `@` hacia `src` y las Vue DevTools), `jsconfig.json`, `public/favicon.ico`, `.vscode/`, `.gitignore` y `README.md` se quedan sin cambios. `src/main.js` también se queda por ahora: ya crea la app, le suma el enrutador y la dibuja en `#app` (lo amplías en el paso 3). Reemplazas `package.json`, `src/router/index.js` y `src/App.vue`, y no borras nada.

2. Reemplaza `apps/web/package.json` completo. El nombre `@catalogo/web` es el que usa `--filter`; las versiones van fijas para que todos instalen lo mismo, y `vite-plugin-vue-devtools` se queda porque lo usa el `vite.config.js` que trajo create-vue:

   ```json
   {
     "name": "@catalogo/web",
     "version": "1.0.0",
     "private": true,
     "type": "module",
     "scripts": {
       "dev": "vite --host 127.0.0.1 --port 5178 --strictPort",
       "build": "vite build"
     },
     "dependencies": {
       "@catalogo/ui": "workspace:*",
       "vue": "3.5.13",
       "vue-router": "4.5.0"
     },
     "devDependencies": {
       "@vitejs/plugin-vue": "5.2.3",
       "vite": "~6.4.0",
       "vite-plugin-vue-devtools": "7.7.2"
     }
   }
   ```

3. Reemplaza `apps/web/src/router/index.js` completo (create-vue lo trae con la lista de rutas vacía):

   ```js
   import { createRouter, createWebHistory } from 'vue-router'
   import InicioVista from '@/vistas/InicioVista.vue' // @ es el atajo a src/ que trae vite.config.js
   import CatalogoVista from '@/vistas/CatalogoVista.vue'

   const router = createRouter({
     history: createWebHistory(import.meta.env.BASE_URL), // URL limpias como /catalogo: Nginx tendrá que entenderlas
     routes: [
       { path: '/', component: InicioVista },
       { path: '/catalogo', component: CatalogoVista }
     ]
   })

   export default router // main.js lo importa con import router from './router'
   ```

4. Las dos vistas. Inicio trae un botón que falla a propósito, para el paso 3; Catálogo trae datos de ejemplo (cópialos tal cual).

   `apps/web/src/vistas/InicioVista.vue`:

   ```vue
   <script setup>
   // Lanza un error para comprobar en el paso 3 que la observabilidad lo registra
   function simularError() {
     throw new Error('Error de prueba desde Inicio')
   }
   </script>

   <template>
     <h2>Inicio</h2>
     <button type="button" @click="simularError">Simular error</button>
   </template>
   ```

   `apps/web/src/vistas/CatalogoVista.vue`:

   ```vue
   <script setup>
   import { EtiquetaEstado } from '@catalogo/ui' // nunca '@catalogo/ui/src/...'

   const productos = [
     { id: 1, nombre: 'Teclado', estado: 'activo' },
     { id: 2, nombre: 'Monitor', estado: 'agotado' },
     { id: 3, nombre: 'Ratón', estado: 'pendiente' }
   ]
   </script>

   <template>
     <h2>Catálogo</h2>
     <ul>
       <li v-for="producto in productos" :key="producto.id">
         {{ producto.nombre }} <EtiquetaEstado :estado="producto.estado" />
       </li>
     </ul>
   </template>
   ```

5. Reemplaza `apps/web/src/App.vue` completo (create-vue lo trae con un solo `<h1>You did it!</h1>`):

   ```vue
   <template>
     <h1>Catálogo Pro</h1>
     <!-- aria-label nombra el menú para los lectores de pantalla -->
     <nav aria-label="Principal">
       <RouterLink to="/">Inicio</RouterLink> |
       <RouterLink to="/catalogo">Catálogo</RouterLink>
     </nav>
     <main>
       <RouterView />
     </main>
   </template>
   ```

6. **Primero, predice:** la app importa un `.vue` que vive fuera de ella, en `packages/ui`. ¿Compilará? Instala y compila desde la raíz:

   ```bash
   pnpm install
   pnpm build
   ```

   **Qué debes ver:** `✓ built in` y unos segundos. Vite siguió el enlace de `workspace:*` hasta `packages/ui` y compiló el componente como si fuera de la app.

## Paso 3. Observabilidad y versión en el navegador (6 minutos)

**Qué vas a hacer y por qué:** en producción el silencio no prueba nada. Este módulo anota cada navegación con su duración, cada error que Vue atrapa y la versión desplegada, en la consola y en `localStorage` (el almacén del navegador que sobrevive a una recarga).

1. Crea `apps/web/src/observabilidad.js`:

   ```js
   const CLAVE = 'catalogo-platform:observability' // nombre del registro en localStorage
   const MAXIMO = 50 // solo los últimos 50 eventos, para no llenar el navegador
   const version = import.meta.env.VITE_APP_VERSION ?? 'desarrollo' // la pone el build de Docker

   function reportar(type, datos) {
     const evento = { type, version, timestamp: new Date().toISOString(), ...datos }
     console.info('[catalogo-observability]', evento) // se ve en la consola
     const guardados = JSON.parse(localStorage.getItem(CLAVE) ?? '[]') // lo que ya había
     localStorage.setItem(CLAVE, JSON.stringify([...guardados, evento].slice(-MAXIMO))) // agrega y recorta
   }

   export function instalarObservabilidad(app, router) {
     let inicio = 0
     router.beforeEach(() => { inicio = performance.now() }) // arranca el cronómetro al salir
     router.afterEach((to, from) => { // al llegar, reporta cuánto tardó
       reportar('navigation', { from: from.fullPath, to: to.fullPath, durationMs: Math.round(performance.now() - inicio) })
     })
     app.config.errorHandler = (error, instancia, info) => { // todo error que Vue atrapa pasa por aquí
       reportar('error', { message: error.message, info })
     }
   }
   ```

2. Reemplaza `apps/web/src/main.js` completo (el que trajo create-vue más dos líneas) para instalarlo **antes** de montar, así no se pierde la primera navegación:

   ```js
   import { createApp } from 'vue'
   import App from './App.vue'
   import router from './router'
   import { instalarObservabilidad } from './observabilidad.js' // nuevo

   const app = createApp(App)
   instalarObservabilidad(app, router) // nuevo: engancha el enrutador y el manejador de errores

   app.use(router)

   app.mount('#app')
   ```

3. **Primero, predice:** ¿qué `version` dirá el evento en desarrollo? Arranca y abre `http://127.0.0.1:5178` en Chrome con la consola abierta (F12):

   ```bash
   pnpm dev
   ```

   Pulsa **Catálogo**, luego **Inicio** y luego **Simular error**. En la consola escribe:

   ```js
   JSON.parse(localStorage.getItem('catalogo-platform:observability'))
   ```

   **Qué debes ver:** eventos `[catalogo-observability]` con `type: "navigation"`, `from`, `to`, `durationMs` y `version: "desarrollo"` (nadie fijó la versión; en el paso 4 la pone Docker), un evento `type: "error"` con el mensaje de prueba y, en Catálogo, las etiquetas de colores. Detén el servidor con Ctrl+C.

## Paso 4. Imagen Docker con Nginx, salud y versión (8 minutos)

**Qué vas a hacer y por qué:** se compila una vez y se promueve la misma imagen. La primera etapa compila con Node.js; la segunda lleva solo Nginx y lo compilado.

1. En la raíz, crea `nginx.conf` y `.dockerignore` (este evita copiar lo que se regenera).

   `nginx.conf`:

   ```nginx
   server {
     listen 80;
     root /usr/share/nginx/html;
     index index.html;
     # ruta de salud: la consulta Docker para saber si el contenedor está sano
     location = /health {
       default_type text/plain;
       return 200 "ok\n";
     }
     # archivos con huella en el nombre: el navegador los guarda un año
     location /assets/ {
       add_header Cache-Control "public, max-age=31536000, immutable";
     }
     # cualquier otra ruta, como /catalogo, la resuelve Vue Router desde index.html
     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

   `.dockerignore`:

   ```text
   **/node_modules
   **/dist
   .git
   ```

2. Crea `Dockerfile` (en un Dockerfile el comentario va en su propia línea):

   ```dockerfile
   # Etapa 1, build: Node.js instala y compila
   FROM node:24.22.0-alpine AS build
   # carpeta de trabajo dentro de la imagen
   WORKDIR /app
   # versión que llega con --build-arg; Vite la publica como VITE_APP_VERSION
   ARG APP_VERSION=desarrollo
   ENV VITE_APP_VERSION=$APP_VERSION
   # copia el monorepo (.dockerignore excluye node_modules y dist)
   COPY . .
   # activa pnpm en la versión de packageManager e instala justo lo del bloqueo
   RUN corepack enable && pnpm install --frozen-lockfile
   # compila la app web: deja apps/web/dist
   RUN pnpm --filter @catalogo/web build
   # Etapa 2: solo Nginx y lo compilado
   FROM nginx:1.27.3-alpine
   # cada etapa empieza de cero, por eso el ARG se declara otra vez
   ARG APP_VERSION=desarrollo
   # etiqueta estándar para saber qué versión corre
   LABEL org.opencontainers.image.version=$APP_VERSION
   # configuración con /health y try_files
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   # trae dist/ desde la etapa 1
   COPY --from=build /app/apps/web/dist /usr/share/nginx/html
   # cada 10 s Docker pregunta por /health; tres fallos seguidos = unhealthy
   HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1
   ```

3. **Primero, predice:** si pides `/catalogo` directo al servidor, sin pasar por Inicio, ¿responde 200 o 404? Construye, arranca, espera unos 15 segundos y consulta (en PowerShell escribe `curl.exe` en lugar de `curl`):

   ```bash
   docker build --build-arg APP_VERSION=1.0.0 -t catalogo-platform:1.0.0 .
   docker run -d --name catalogo-platform -p 8088:80 catalogo-platform:1.0.0
   docker inspect --format "{{.State.Health.Status}}" catalogo-platform
   curl -i http://127.0.0.1:8088/health
   curl -I http://127.0.0.1:8088/catalogo
   ```

   **Qué debes ver:** `healthy` (si dice `starting`, repite el `docker inspect` en 10 segundos), `HTTP/1.1 200 OK` con `ok` en `/health` y `200 OK` en `/catalogo` gracias a `try_files`. En Chrome, `http://127.0.0.1:8088/catalogo` muestra en la consola `version: "1.0.0"`.

## Paso 5. Pipeline de CI y release en GitHub Actions (6 minutos)

**Qué vas a hacer y por qué:** la pipeline vuelve obligatorio lo que hiciste a mano. `ci.yml` revisa cada cambio en `main`; `release.yml` publica la imagen al subir una etiqueta.

1. Crea los dos flujos. Los `run:` corren en la máquina Linux de GitHub con bash, no con PowerShell, aunque tú trabajes en Windows: por eso `release.yml` usa sintaxis de bash como `${GITHUB_REPOSITORY,,}` (pasa a minúsculas), `${GITHUB_REF_NAME#v}` (quita la `v` inicial) y `${GITHUB_SHA::12}` (toma los primeros 12 caracteres).

   `.github/workflows/ci.yml`:

   ```yaml
   name: CI
   on:
     push:
       branches: [main]                        # cada cambio que llega a main
     pull_request:
       branches: [main]                        # y cada propuesta de cambio
   jobs:
     calidad:
       runs-on: ubuntu-latest                  # máquina Linux de GitHub
       steps:
         - uses: actions/checkout@v4           # descarga el código
         - uses: pnpm/action-setup@v4          # primero pnpm: lee la versión de packageManager
         - uses: actions/setup-node@v4         # después Node.js
           with:
             node-version: 24.22.0
             cache: pnpm                       # reutiliza descargas; necesita pnpm ya instalado
         - run: pnpm install --frozen-lockfile # instala justo lo del bloqueo
         - run: pnpm test                      # las pruebas del paso 1
         - run: pnpm build                     # compila la SPA
   ```

   `.github/workflows/release.yml`:

   ```yaml
   name: Release
   on:
     push:
       tags: ['v*.*.*']                        # solo al subir una etiqueta como v1.0.0
   permissions:
     contents: read
     packages: write                           # sin esto, ghcr.io rechaza la publicación
   jobs:
     imagen:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: docker/login-action@v3        # entra a ghcr.io con el token automático
           with:
             registry: ghcr.io
             username: ${{ github.actor }}
             password: ${{ secrets.GITHUB_TOKEN }}
         - name: Construir y publicar con versión y SHA
           run: |
             IMAGEN=ghcr.io/${GITHUB_REPOSITORY,,}   # dueño/repositorio en minúsculas
             VERSION=${GITHUB_REF_NAME#v}             # v1.0.0 pasa a 1.0.0
             SHA=${GITHUB_SHA::12}                    # 12 caracteres del commit
             docker build --build-arg APP_VERSION="$VERSION" -t "$IMAGEN:$VERSION" -t "$IMAGEN:$SHA" .
             docker push --all-tags "$IMAGEN"
   ```

2. **Primero, predice:** al subir a `main`, ¿corre también Release? Guarda, crea tu repositorio privado y súbelo:

   ```bash
   git add .
   git commit -m "feat: plataforma de catalogo"
   gh repo create catalogo-platform --private --source=. --remote=origin --push
   gh run list --limit 2
   ```

3. No esperes a que CI termine: los dos flujos corren en paralelo en GitHub. Publica ya la versión con una etiqueta:

   ```bash
   git tag -a v1.0.0 -m "Version 1.0.0"
   git push origin v1.0.0
   gh run list --limit 3
   ```

   **Qué debes ver:** el primer `gh run list` muestra solo CI, porque Release espera una etiqueta. El segundo muestra CI y Release en `in_progress` o `queued`; repite `gh run list --limit 3` cada minuto hasta ver los dos en `completed  success` (unos 2 a 3 minutos). En **Packages** de tu perfil de GitHub aparece `catalogo-platform` con las etiquetas `1.0.0` y el SHA de 12 caracteres.

## Paso opcional: rollback por etiqueta (3 minutos)

Volver atrás es pedir la imagen anterior por su nombre, sin recompilar. Simula una versión 1.1.0 y regresa a la 1.0.0:

```bash
docker build --build-arg APP_VERSION=1.1.0 -t catalogo-platform:1.1.0 .
docker rm -f catalogo-platform
docker run -d --name catalogo-platform -p 8088:80 catalogo-platform:1.1.0
docker rm -f catalogo-platform
docker run -d --name catalogo-platform -p 8088:80 catalogo-platform:1.0.0
docker inspect --format "{{.Config.Labels}}" catalogo-platform
```

**Qué debes ver:** entre las etiquetas, `org.opencontainers.image.version:1.0.0`. El segundo `docker build` tardó casi lo mismo que el primero: al cambiar `APP_VERSION` cambia el `ENV` de la etapa 1, y desde ahí Docker repite `COPY` e `install`; solo reutiliza las imágenes base. El rollback, en cambio, fue inmediato: no compiló nada, solo arrancó la imagen 1.0.0 que ya existía.

## Resultado esperado

- Monorepo con `apps/web`, `packages/ui` y `packages/config`; `pnpm build` termina con `✓ built in`.
- Consola con eventos `[catalogo-observability]` de navegación y error, con la versión.
- Contenedor `healthy`: `/health` y `/catalogo` responden 200.
- CI en `completed success` y la imagen publicada con las etiquetas `1.0.0` y SHA.

## Laboratorio resuelto

La carpeta [`ejercicio-resuelto/`](https://github.com/netec-mx/VUE_INT/tree/main/Capitulo08/ejercicio-resuelto) de este capítulo tiene el proyecto terminado, igual al que construyes con esta guía. Úsalo para comparar al final o si te atascas: lo que se aprende está en escribirlo tú.

La carpeta [`solucion-por-pasos/`](solucion-por-pasos/) tiene el proyecto como queda al terminar cada paso, con comentarios que explican cada concepto y la captura de lo que debes ver. Sirve para mostrar en clase un paso sin construir los anteriores.

```bash
cd ejercicio-resuelto
npm install -g pnpm@9.15.4   # instala pnpm en la versión del curso (si ya lo hiciste en la Preparación, sáltalo)
pnpm install                 # instala las dependencias de todo el monorrepositorio
pnpm dev                     # arranca la aplicación en http://127.0.0.1:5178
```

## Problemas frecuentes

| Mensaje | Causa y arreglo |
|---|---|
| `pnpm.ps1 cannot be loaded because running scripts is disabled on this system` | PowerShell bloquea scripts. Ejecuta `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` o escribe `pnpm.cmd`. |
| `Port 5178 is already in use` | Otro servidor ocupa el puerto. Ciérralo con Ctrl+C en su terminal. |
| `Bind for 0.0.0.0:8088 failed: port is already allocated` o `/health` responde algo que no es `ok` | Otro programa usa el puerto 8088 en tu equipo. Borra el contenedor con `docker rm -f catalogo-platform` y arráncalo con otro puerto, por ejemplo `-p 8089:80`, y usa ese puerto en `curl` y en Chrome. |
| create-vue pregunta `Package name:` o falla con `ERR_TTY_INIT_FAILED` | Lo lanzaste con `apps/web` como nombre: con `/` no es un nombre de paquete válido. Borra la carpeta si se creó, entra a `apps` y ejecuta `npx --yes create-vue@3.16.4 web --bare --router`. |
| Avisos `EBADENGINE` o `Vite requires Node.js version ...` | Usaste `create-vue@latest`: las versiones nuevas traen Vite 7 y piden un Node.js más reciente que el del aula. Crea la app otra vez con `create-vue@3.16.4`. |
| `Failed to resolve import "@catalogo/ui"` | Agregaste la dependencia y no corriste `pnpm install`. |
| `Missing "./src/estado.js" specifier in "@catalogo/ui" package` | Importaste una ruta interna. Importa desde `@catalogo/ui`. |
| `Error: Cannot find matching keyid` al ejecutar `pnpm` | Corriste `corepack enable` con un Node.js 22 anterior a 22.14: su Corepack trae llaves de firma viejas y no puede bajar pnpm. Ejecuta `corepack disable pnpm` y luego `npm install -g pnpm@9.15.4`. |
| `ERR_PNPM_OUTDATED_LOCKFILE` al construir la imagen | Cambiaste un `package.json` sin actualizar el bloqueo. Corre `pnpm install` y vuelve a construir. |
| `failed to connect to the docker API` o `error during connect` | Docker Desktop está cerrado. Ábrelo y espera *Engine running*. |
| `WARN GET https://registry.npmjs.org/... error (ETIMEDOUT)` durante `docker build` | La red del contenedor va lenta. pnpm reintenta solo; espera a ver `Done in`. Si falla del todo, repite el `docker build`. |
| `/catalogo` devuelve `404 Not Found` en el contenedor | Falta `try_files` o no se copió `nginx.conf`. Revisa el `COPY` de la etapa 2 y reconstruye. |
| `Author identity unknown` al hacer commit | `git config --global user.name "Tu Nombre"` y `git config --global user.email "tu@correo"`. |
| `refusing to allow an OAuth App to create or update workflow ... without workflow scope` | Tu sesión de `gh` no puede subir flujos. Ejecuta `gh auth refresh -s workflow` y repite el `git push`. |
| `Unable to locate executable file: pnpm` en GitHub | `setup-node` quedó antes de `pnpm/action-setup`. Invierte el orden. |
| `denied: installation not allowed` o `permission_denied: write_package` | Falta `packages: write` en `permissions` de `release.yml`. |

Con `pnpm dev` corriendo, al guardar un archivo Vite recarga en caliente y la pantalla puede volver a Inicio; los eventos de `localStorage` se conservan.

## Limpieza (1 minuto)

```bash
docker rm -f catalogo-platform
docker rmi catalogo-platform:1.0.0 catalogo-platform:1.1.0
```

Si no hiciste el paso opcional, quita `catalogo-platform:1.1.0` del segundo comando. Si no quieres conservar el repositorio en GitHub, bórralo desde **Settings > Delete this repository**.

## Ejercicios de reserva

**Básico.** Agrega el estado `descontinuado` (texto `Descontinuado`) y una prueba que lo compruebe.

<details markdown="1"><summary>Solución</summary>

En `estado.js`, suma `descontinuado: 'Descontinuado'` a `ETIQUETAS`. En `estado.test.js`, dentro del `describe`:

```js
it('traduce descontinuado', () => {
  expect(etiquetaDeEstado('descontinuado')).toBe('Descontinuado')
})
```

</details>

**Medio.** Haz que la imagen no reinstale dependencias cuando solo cambia el código.

<details markdown="1"><summary>Solución</summary>

En la etapa 1, reemplaza `COPY . .` y el `RUN corepack ...` por:

```dockerfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/ui/package.json packages/ui/
COPY packages/config/package.json packages/config/
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
```

</details>

**Avanzado.** En `ci.yml`, guarda la carpeta compilada como artefacto `web-dist` para que un despliegue la descargue sin recompilar.

<details markdown="1"><summary>Solución</summary>

Al final de los `steps` del trabajo `calidad`:

```yaml
      - uses: actions/upload-artifact@v4
        with:
          name: web-dist
          path: apps/web/dist
```

</details>

Cada archivo que escribes aparece completo una sola vez. `apps/web/src/main.js` sale de create-vue y su versión final es la del paso 3. `index.html`, `vite.config.js`, `jsconfig.json`, `public/favicon.ico`, `.gitignore`, `README.md` y `.vscode/` de `apps/web` salen de create-vue sin cambios.

## Recursos

- Espacios de trabajo de pnpm: https://pnpm.io/workspaces
- Variables y modos de Vite: https://vite.dev/guide/env-and-mode
- Sintaxis de GitHub Actions: https://docs.github.com/es/actions
- Manejador global de errores de Vue: https://vuejs.org/api/application.html#app-config-errorhandler

## Control de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 2.0 | 2026-10-16 | Andrés Eduardo García Márquez | Guía reescrita desde carpeta vacía con todo el código; validada por CLI en Windows 11 y Linux; puerto 8088 para el contenedor; `npm install -g pnpm@9.15.4` en lugar de `corepack enable` en el equipo |
| 2.1 | 2026-10-17 | Andrés Eduardo García Márquez | `apps/web` se crea con create-vue, la herramienta oficial que enseñan los manuales: `npx --yes create-vue@3.16.4 web --bare --router` dentro de `apps/` (con `apps/web` como nombre pregunta el nombre del paquete); el enrutador pasa a `src/router/index.js` con el atajo `@`; `main.js` de create-vue se conserva en el paso 2; nada se borra; `ejercicio-resuelto/` rehecho siguiendo la guía; validada paso a paso en Windows 11, incluido `docker build`, y con la pasada final en Linux |

<!-- {% endraw %} -->
