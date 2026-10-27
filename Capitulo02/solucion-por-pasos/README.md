# Capítulo 2 - Práctica 2.4: refactorizar componentes a Composition API y crear composables

<!-- lang: es-CO -->

Una carpeta por paso de la guía. Cada carpeta es un proyecto Vite completo con el código acumulado hasta ese paso y comentarios que explican el concepto de Vue usado. El paso 5 es igual en código al `ejercicio-resuelto/` del repositorio.

Para ejecutar cualquier paso: entra a la carpeta, `npm install` y `npx vite --port 5172`. Para empezar de cero las preferencias, en la consola de Chrome: `localStorage.removeItem('compacta')` y `localStorage.removeItem('vista-compacta')`.

| Paso | Carpeta | Qué se ve |
|---|---|---|
| Paso 0 | [`paso-00-preparacion`](paso-00-preparacion/) | "You did it!" y el botón flotante de las Vue DevTools. |
| Paso 1 | [`paso-01-options-api`](paso-01-options-api/) | Columna **Antes** con 5 tareas; **Vista compacta** se conserva al recargar. |
| Paso 2 | [`paso-02-composables-carga-y-buscador`](paso-02-composables-carga-y-buscador/) | Dos columnas; "pr" en **Después** deja 2 tareas ordenadas. Comprobados **Solo pendientes (3)**, **Recargar** y la rama de error. |
| Paso 3 | [`paso-03-seleccion-y-preferencia`](paso-03-seleccion-y-preferencia/) | Tras `F5`: **Vista compacta** se conserva y "Seleccionada: ninguna". |
| Paso 4 | [`paso-04-provide-y-renderless`](paso-04-provide-y-renderless/) | Igual que el paso 3, ahora con `provide`, clave `Symbol` y renderless. |
| Paso 5 | [`paso-05-comprobacion`](paso-05-comprobacion/) | Solo **Después**; `vite build` sin errores. Opcional 5.1: página en blanco con el error de `useProjectHubContext`. |

## Control de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0 | 2026-10-27 | Andrés Eduardo García Márquez | Carpetas por paso (0 a 5) con código comentado, README y captura validada en Chrome; equivalencia del paso 5 con `ejercicio-resuelto/` comprobada |
