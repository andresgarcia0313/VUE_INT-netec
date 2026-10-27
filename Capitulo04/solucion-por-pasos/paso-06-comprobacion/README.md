# Capítulo 4 - Paso 6. Comprobación

<!-- lang: es-CO -->

Proyecto Vite completo con el código acumulado hasta este paso de la Práctica 4.4 (ProjectHub con Pinia). Los comentarios del código explican cada concepto.

## Qué cambió

Ningún archivo nuevo: es el proyecto terminado, igual en código a `ejercicio-resuelto/` (solo cambian los comentarios).

## Concepto

Las cinco comprobaciones juntan todo el capítulo: cinco tiendas, una sola copia por dato (`byId`), persistencia selectiva sin credenciales, errores centralizados y la guardia leyendo la tienda de sesión.

## Cómo ejecutar

```bash
npm install              # instala las dependencias (una vez por carpeta)
npx vite --port 5174     # como en la guía; también sirve npm run dev (puerto 5173)
```

Abre `http://localhost:5174/proyectos` en Chrome.

## Qué debes ver

Según la guía: Cinco tiendas: `auth`, `ui`, `apiStatus`, `projects` y `tasks` | El título de pendientes cambia | Tema, filtro y sesión siguen; no hay `token`, `toast` ni errores guardados | `Errores registrados` sube y aparece el aviso | **Salir** y abrir `/proyectos`: la guardia te lleva de nuevo al formulario.

![Así se ve al terminar: Ana (editor) con **Salir**, **Cambiar tema**, **Mostrar**, **Simular error**, `Semáforo de proyectos: success - Errores registrados: 0` y dos proyectos.](captura.png)

*Así se ve al terminar: Ana (editor) con **Salir**, **Cambiar tema**, **Mostrar**, **Simular error**, `Semáforo de proyectos: success - Errores registrados: 0` y dos proyectos.*

![**Salir** y abrir `/proyectos`: la guardia lleva a `/login?redirect=/proyectos`](captura-salir.png)

***Salir** y abrir `/proyectos`: la guardia lleva a `/login?redirect=/proyectos`.*
