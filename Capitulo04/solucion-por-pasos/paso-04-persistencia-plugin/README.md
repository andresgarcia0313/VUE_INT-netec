# Capítulo 4 - Paso 4. Persistencia con plugin

<!-- lang: es-CO -->

Proyecto Vite completo con el código acumulado hasta este paso de la Práctica 4.4 (ProjectHub con Pinia). Los comentarios del código explican cada concepto.

## Qué cambió

Nuevo: `src/plugins/persist.js`. Cambiado: `src/main.js` (import de `persistPlugin` y `pinia.use(persistPlugin)`).

## Concepto

Un plugin de Pinia es una función que Pinia llama una vez por cada tienda que nace, con la tienda y sus opciones. Este lee la opción `persist` que declaran `auth` y `ui`: al nacer hidrata la tienda con `$patch` y con `$subscribe` guarda en `localStorage` solo las claves de `paths`. `detached: true` mantiene la suscripción aunque se desmonte el componente.

## Cómo ejecutar

```bash
npm install              # instala las dependencias (una vez por carpeta)
npx vite --port 5174     # como en la guía; también sirve npm run dev (puerto 5173)
```

Abre `http://localhost:5174/proyectos` en Chrome.

## Qué debes ver

Según la guía: sigues dentro como `Ana`, con el tema oscuro y el filtro **Pendientes**. Si había un aviso, desapareció: `toast` no se guarda. [...] Responde `'{"user":{"name":"Ana","roles":["editor"]}}'`: no hay token. `localStorage.getItem('projecthub:ui:v1')` responde `'{"theme":"dark","filter":"pendientes"}'`, sin `toast`.

![Después de `F5`: Ana, tema oscuro, filtro Pendientes, sin aviso; el panel muestra los dos `localStorage.getItem(...)` sin token ni toast.](captura.png)

*Después de `F5`: Ana, tema oscuro, filtro Pendientes, sin aviso; el panel muestra los dos `localStorage.getItem(...)` sin token ni toast.*

![Antes de `F5`: oscuro, Pendientes y un aviso de error](captura-antes-f5.png)

*Antes de `F5`: oscuro, Pendientes y un aviso de error.*
