# Cifra 1.0 en Vercel

La aplicación usa TanStack Start y Nitro. El contenido y los borradores están disponibles para visitantes. Para ejecutar código se necesita una sesión de GitHub. El progreso y los borradores se guardan en el navegador. Neon contiene las cuentas, sesiones y reservas del ejecutor.

## Preparar Preview

1. Importa el repositorio en un proyecto personal de Vercel Hobby. Selecciona Node.js 24 y conserva los comandos del repositorio.
2. Crea una rama de Neon dedicada a Preview. Configura su cadena de conexión como `DATABASE_URL` únicamente en Preview.
3. Crea una OAuth App en la configuración de desarrollador de GitHub. Usa una URL estable de Preview y añade `https://<preview>/api/auth/callback/github` a las redirecciones autorizadas.
4. Añade las variables de Preview. Activa OIDC en el proyecto de Vercel para que el servidor pueda crear sandboxes sin almacenar un token permanente.

| Variable | Valor |
| --- | --- |
| `VITE_CIFRA_PUBLIC` | `1` |
| `VITE_AUTH_ENABLED` | `true` |
| `DATABASE_URL` | Conexión de la rama de Neon para este entorno |
| `BETTER_AUTH_URL` | Origen HTTPS exacto de este entorno, sin ruta |
| `BETTER_AUTH_SECRET` | Secreto distinto por entorno, de al menos 32 bytes aleatorios |
| `GITHUB_CLIENT_ID` | ID OAuth del cliente web de GitHub |
| `GITHUB_CLIENT_SECRET` | Secreto OAuth del cliente web |
| `CIFRA_SANDBOX_SNAPSHOT` | ID devuelto por el aprovisionamiento |
| `CIFRA_EJECUCION_PAUSADA` | Opcional. `1` pausa el ejecutor tras redesplegar |

[Configurar GitHub](https://better-auth.com/docs/authentication/github) · [Autenticación de Vercel Sandbox](https://vercel.com/docs/sandbox/concepts/authentication)

## Aprovisionar el ejecutor

Desde el proyecto enlazado con `vercel link`, carga las credenciales OIDC de Vercel en la sesión local. Una opción es descargar las variables con `vercel env pull .env.local` y ejecutar Node con ese archivo. Guarda los secretos fuera de Git.

```sh
node --env-file=.env.local scripts/cifra-sandbox/provision.mjs
```

El script instala las herramientas y los supervisores en la imagen gestionada de Node.js 24 sobre Ubuntu, bloquea su salida a Internet y devuelve el ID del snapshot. Añade el ID a Preview y crea el despliegue con `vercel` desde el directorio enlazado. Repite el aprovisionamiento cada vez que cambies los toolchains o los archivos de `scripts/cifra-sandbox`. Conserva el snapshot anterior hasta verificar el nuevo. Vigila el espacio de almacenamiento de snapshots en Vercel.

El servidor crea una microVM efímera por ejecución admitida. El proceso de la persona usuaria se ejecuta con un usuario separado y sin credenciales. El supervisor limita el tiempo y captura hasta 64 KiB de salida por proceso. La microVM limita los recursos totales. Cifra reserva hasta 10 ejecuciones por cuenta cada 24 horas, 250 globales cada 30 días y tres simultáneas. Las cifras de Vercel también se aplican a las pruebas de infraestructura que usan el SDK directamente.

[Cuotas de Vercel Sandbox](https://vercel.com/docs/sandbox/pricing) · [Snapshots](https://vercel.com/docs/sandbox/concepts/snapshots)

## Validar y publicar

- Ejecuta `npm test`, `npm run typecheck`, `npm run check:auth` con el servidor local activo y `npm run build:dev`. El build de Vercel ejecuta las migraciones de la base configurada. Las migraciones de autenticación y cuota se registran en `_migrations`.
- Con el snapshot de Preview, ejecuta el control por runtime con `node --env-file=.env.local --experimental-strip-types scripts/cifra-sandbox/matriz.mjs --smoke`. Quita `--smoke` para los 165 pares de control. Para probar sin Vercel, usa `--local --lenguajes=javascript,typescript,python,rust,go,c,cpp` con los compiladores locales disponibles.
- Abre Preview en un navegador. Comprueba que una visita sin sesión puede escribir, pero recibe un aviso al ejecutar. Entra con GitHub, comprueba que el borrador sigue disponible y ejecuta una muestra de cada lenguaje, incluidos Rust, SQLite y la tarjeta HTML/CSS. En el reto de suma, verifica que Ejecutar muestra los ejemplos y que Enviar añade casos ocultos. Prueba también la defensa, el puente a Estudio y el selector móvil.
- Crea las variables de producción con otro secreto, otro cliente OAuth y otra rama de Neon. Autoriza la URL de producción en GitHub. Publica el build verificado con `vercel --prod`.
- Ante un fallo del ejecutor, activa `CIFRA_EJECUCION_PAUSADA=1` y redespliega. Si necesitas revertir la interfaz, recupera el despliegue anterior desde Vercel. Conserva las migraciones ya aplicadas y el snapshot anterior mientras verificas la recuperación.
