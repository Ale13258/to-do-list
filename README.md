# Prueba Técnica Mobile - TodoApp (Ionic + Angular + Cordova)

Aplicación híbrida de gestión de tareas desarrollada para evaluar competencias en desarrollo mobile con Ionic: CRUD de tareas, categorización completa, feature flags con Firebase Remote Config, optimización de rendimiento y empaquetado para Android/iOS.

## 1) Objetivo y alcance

La aplicación permite:

- Agregar nuevas tareas.
- Marcar tareas como completadas.
- Eliminar tareas.
- Crear, editar y eliminar categorías.
- Asignar una categoría a cada tarea.
- Filtrar tareas por categoría.

Persistencia local implementada con Ionic Storage para conservar estado entre sesiones.

## 2) Stack tecnológico

- Ionic `8` + Angular `20`
- Cordova (`cordova-android`, `cordova-ios`)
- Firebase + Remote Config
- Ionic Storage (sobre `localforage`)
- TypeScript + ESLint + Jasmine/Karma

Requisitos de entorno:

- Node.js `>=20 <27`
- npm `>=10`
- Android Studio + SDK + emulador/dispositivo Android
- macOS + Xcode completo para iOS

## 3) Matriz de cumplimiento de requerimientos

| Requerimiento | Implementación | Evidencia |
|---|---|---|
| Versionamiento en Git | Proyecto versionado y preparado para repositorio público | `git`, estructura del repo, historial de commits |
| Estructura híbrida Android/iOS con Cordova | Scripts de build/run para ambas plataformas | `package.json` (`build:cordova:*`, `cordova:run:*`, `cordova:serve:*`) |
| Firebase + Remote Config (feature flag) | Flag `feature_todo_categories` para activar/desactivar categorías en UI | `src/app/services/feature-flags.service.ts`, `src/environments/environment*.ts` |
| Categorización de tareas | CRUD de categorías + asignación + filtrado | `src/app/services/todo.service.ts`, `src/app/categories/*`, `src/app/home/*` |
| Optimización de rendimiento | Signals/computed, OnPush, lazy load, track por id | `src/app/home/home.page.ts`, `src/app/app-routing.module.ts`, templates |
| Exportación APK/IPA | Flujo documentado para generar artefactos release | Secciones de build en este README |

## 4) Arquitectura funcional

### Capa de dominio y estado

- `TodoService` centraliza estado de tareas/categorías usando `signal` y `computed`.
- Persistencia local mediante Ionic Storage (`TASKS_STORAGE_KEY`, `CATEGORIES_STORAGE_KEY`).
- Normalización de datos legacy para mantener compatibilidad de estructura.

### Capa de flags y configuración remota

- `FeatureFlagsService` inicializa Remote Config con `fetchAndActivate`.
- Feature flag `feature_todo_categories` controla visibilidad de categorías y filtros.
- Fallback a `remoteConfigDefaults` en caso de fallo de red.

### Capa de presentación

- Pantalla principal: gestión de tareas, filtrado y acciones de completado/eliminación.
- Pantalla de categorías: alta, renombrado y eliminación.
- Navegación lazy-loaded con Angular Router.

## 5) Configuración de Firebase y Remote Config

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Registrar una app Web y copiar credenciales en:
   - `src/environments/environment.ts`
   - `src/environments/environment.prod.ts`
3. (Opcional recomendado para repos públicos) partir de:
   - `src/environments/environment.example.ts`
   - `src/environments/environment.prod.example.ts`
4. Crear en Remote Config el parámetro:

| Parámetro | Tipo | Valores |
|---|---|---|
| `feature_todo_categories` | string | `true`/`1` habilita, `false`/`0` deshabilita |

Comportamiento:

- Habilitado: UI permite gestionar y filtrar categorías.
- Deshabilitado: UI de categorías se oculta y las tareas usan categoría base.

## 6) Instalación y ejecución

### Instalar dependencias

```bash
npm install
```

### Desarrollo web

```bash
npm start
```

URL por defecto: `http://localhost:4200`.

### Build Cordova por plataforma

```bash
npm run build:cordova:android
npm run build:cordova:ios
```

Si la plataforma no existe aún:

```bash
npx cordova platform add android
npx cordova platform add ios
```

### Ejecutar en emulador/dispositivo

```bash
npm run cordova:run:android
npm run cordova:run:ios
```

### Live reload con Cordova

```bash
npm run cordova:serve:android
npm run cordova:serve:ios
```

## 7) Exportación de artefactos (APK / IPA)

### Android

```bash
npm run build:prod
npx cordova build android --release
```

- El artefacto se genera en `platforms/android/app/build/outputs/...`.
- Firmar con keystore de distribución antes de publicar/entregar.

### iOS

```bash
npm run build:prod
npx cordova build ios --release
```

- Abrir `platforms/ios/*.xcworkspace` en Xcode.
- Ir a `Product -> Archive` y exportar IPA con cuenta/certificados válidos.

Nota de entrega: con `Personal Team` se puede compilar y probar en dispositivo físico, pero la exportación de IPA distribuible requiere Apple Developer Program activo.

## 8) Optimización de rendimiento aplicada

- Estado reactivo con `signals` + `computed` para reducir trabajo de render.
- `ChangeDetectionStrategy.OnPush` en la pantalla principal.
- Rutas lazy-loaded para reducir costo de carga inicial.
- Iteración de listas con tracking por `id` para minimizar re-renderizados.
- Carga remota de flags en arranque con fallback local para resiliencia.

## 9) Calidad, mantenibilidad y escalabilidad

- Servicios separados por responsabilidad (`TodoService`, `FeatureFlagsService`).
- Modelos tipados para tareas y categorías.
- Reglas de validación de categorías (normalización y unicidad).
- Manejo de estados vacíos y datos legacy para robustez.
- Scripts estandarizados para build/test/lint en `package.json`.

## 10) Respuestas técnicas solicitadas

### 10.1 ¿Cuáles fueron los principales desafíos?

- Diseñar categorías sin romper datos ya guardados en almacenamiento local.
- Mantener UX consistente al activar/desactivar categorías vía feature flag.
- Garantizar que la app siguiera operativa offline ante fallos de Remote Config.

### 10.2 ¿Qué técnicas de optimización se aplicaron y por qué?

- `signals`/`computed`: menor overhead de cambios y derivados de estado más eficientes.
- `OnPush`: reduce verificaciones de change detection innecesarias.
- Lazy loading: mejora tiempo de arranque al diferir módulos no iniciales.
- Tracking por `id`: evita recrear nodos del DOM al actualizar listas grandes.

### 10.3 ¿Cómo se aseguró calidad y mantenibilidad?

- Separación de responsabilidades por capa (UI, estado, flags).
- Tipado estricto y validaciones defensivas en operaciones críticas.
- Scripts de `test` y `lint` para control de calidad automatizable.
- README operativo y trazable para reproducibilidad técnica.

## 11) Evidencias y entregables

Checklist recomendado para la entrega final:

- [ ] Repositorio público (GitHub/GitLab) con rama de trabajo y commits claros.
- [ ] README técnico (este documento) actualizado.
- [ ] Capturas o video de funcionalidades (CRUD tareas, categorías, filtro, flag on/off).
- [ ] APK generado y enlace de descarga.
- [ ] IPA generado o evidencia de build/archive con limitaciones justificadas.
- [ ] Respuestas técnicas incluidas (desafíos, optimización, calidad).

Sugerencia de estructura para evidencias:

- `docs/capturas/`
- `docs/video/`
- `docs/builds/`

## 12) Comandos de verificación rápida

```bash
npm run lint
npm test
npm run build
```

## 13) Estructura de código relevante

| Ruta | Propósito |
|---|---|
| `src/app/services/todo.service.ts` | Lógica de tareas/categorías, persistencia y filtros |
| `src/app/services/feature-flags.service.ts` | Integración de Remote Config y feature flags |
| `src/app/home/` | Pantalla principal y flujo de tareas |
| `src/app/categories/` | Gestión de categorías |
| `src/environments/` | Configuración de Firebase y defaults de flags |
| `config.xml` | Configuración Cordova de la app |

## 14) Instrucciones de entrega

1. Realizar fork del repositorio base.
2. Implementar cambios en una rama dedicada.
3. Publicar rama y compartir enlace del repositorio.
4. Adjuntar enlaces de descarga de APK/IPA (o evidencia técnica equivalente para iOS).
