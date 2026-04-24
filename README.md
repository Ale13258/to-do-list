# TodoApp — Ionic + Angular + Cordova

Aplicación de lista de tareas para la prueba técnica: CRUD local, categorías y filtro detrás de **Firebase Remote Config**, empaquetado con **Cordova** para Android e iOS.

## Requisitos

- **Node.js** `>=20 <27` y **npm** `>=10` (ver [`package.json`](package.json) → `engines`).
- **Android**: Android Studio, SDK y un AVD o dispositivo con depuración USB.
- **iOS** (solo macOS): **Xcode completo** (no basta con Command Line Tools). Sin Xcode, `cordova prepare ios` / `cordova run ios` fallan al invocar `xcodebuild`.

## Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/) y añade una app Web.
2. Copia las credenciales en:
   - [`src/environments/environment.ts`](src/environments/environment.ts) (desarrollo).
   - [`src/environments/environment.prod.ts`](src/environments/environment.prod.ts) (producción; el build reemplaza el archivo según `angular.json`).
3. Plantillas sin secretos: [`src/environments/environment.example.ts`](src/environments/environment.example.ts) y [`src/environments/environment.prod.example.ts`](src/environments/environment.prod.example.ts).

### Remote Config (feature flag)

En Firebase → Remote Config, crea un parámetro:

| Parámetro                    | Tipo   | Valor por defecto sugerido |
|-----------------------------|--------|----------------------------|
| `feature_todo_categories`   | string | `true` o `false`           |

- `true`: se muestran categorías al crear tareas y el filtro por categoría.
- `false`: las tareas se guardan con categoría interna `General`; la UI de categorías se oculta.

Los valores por defecto offline están en `remoteConfigDefaults` del environment.

## Instalación

```bash
npm install
```

## Desarrollo en navegador

```bash
npm start
# o: npx ng serve
```

Abre la URL que indique la consola (por defecto `http://localhost:4200`).

## Cordova: emulador / dispositivo

1. Genera el bundle web en `www` y sincroniza la plataforma:
   ```bash
   npm run build:cordova:android
   # o iOS en Mac con Xcode:
   npm run build:cordova:ios
   ```
2. La primera vez, si faltan plataformas en local:
   ```bash
   npx cordova platform add android
   npx cordova platform add ios
   ```
3. Ejecutar en hardware/emulador:
   ```bash
   npm run cordova:run:android
   npm run cordova:run:ios
   ```
4. **Live reload** (dev server + Cordova):
   ```bash
   npm run cordova:serve:android
   npm run cordova:serve:ios
   ```
   Requiere emulador o dispositivo ya detectado por `adb` / Xcode.

## Builds de entrega (APK / IPA)

### Android (APK/AAB release)

1. `npm run build:prod && npx cordova build android --release`
2. Firma el APK/AAB con tu keystore (no subas el keystore al repositorio público).
3. Ubicación habitual del artefacto: `platforms/android/app/build/outputs/...` (según versión de Gradle).

### iOS (IPA)

1. En Mac con Xcode: `npm run build:prod && npx cordova build ios --release`
2. Abre `platforms/ios/*.xcworkspace` en Xcode, **Product → Archive**, distribuye con tu equipo/certificados (Apple Developer).

Si no tienes cuenta de desarrollador, puedes entregar **capturas o video del simulador** y documentar la limitación en la entrega.

## Optimización (resumen técnico)

- Módulo de inicio **lazy-loaded** (`home` vía rutas).
- Estado de tareas con **signals** y derivados con **`computed`** (menos detección de cambios innecesaria).
- **`ChangeDetectionStrategy.OnPush`** en la página principal.
- Listas con **`@for` + `track`** por `id` de tarea.
- Remote Config: una pasada **`fetchAndActivate`** al iniciar; fallback a defaults del módulo si falla la red.
- `allowedCommonJsDependencies`: `localforage` (dependencia transitiva de Ionic Storage) declarada en [`angular.json`](angular.json) para evitar *optimization bailouts* por CommonJS.

## Pruebas

```bash
npm test
```

## Entrega (checklist prueba técnica)

- [ ] Repositorio Git público con historial razonable.
- [ ] README actualizado (este archivo).
- [ ] Capturas de pantalla o video: colócalos en una carpeta del repo (por ejemplo `docs/capturas/`) o enlázalos si los subes aparte.
- [ ] APK e IPA firmados y probados en dispositivo o emulador.
- [ ] Respuestas a las preguntas técnicas del proceso (desafíos, optimización, calidad).

## Estructura relevante

| Ruta | Descripción |
|------|-------------|
| [`src/app/services/todo.service.ts`](src/app/services/todo.service.ts) | Persistencia en Ionic Storage, filtro por categoría. |
| [`src/app/services/feature-flags.service.ts`](src/app/services/feature-flags.service.ts) | Remote Config: `fetchAndActivate` + lectura de `feature_todo_categories`. |
| [`src/app/home/`](src/app/home/) | UI principal de tareas. |
| [`config.xml`](config.xml) | Id de app Cordova, iconos y splash. |

## Licencia / autor

Proyecto generado con plantilla Ionic; adaptado para la prueba técnica.
