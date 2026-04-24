# TodoApp - Implementación realizada (Ionic + Angular + Cordova)

Este documento describe lo que implementé en la aplicación durante la prueba técnica, con foco en funcionalidades reales del código, decisiones técnicas y cómo ejecutar/validar la solución.

## 1) Lo que implementé

Funcionalidad de tareas:

- Agregar nuevas tareas.
- Marcar tareas como completadas.
- Eliminar tareas.
- Crear, renombrar y eliminar categorías.
- Asignar una categoría a cada tarea.
- Filtrar tareas por categoría.

Persistencia local:

- Guardado de tareas y categorías con Ionic Storage.
- Carga inicial desde storage al arrancar la app.
- Normalización para datos legacy (sin romper estructura previa).

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

## 3) Evidencia en código de lo implementado

| Tema implementado | Evidencia |
|---|---|
| Estado de tareas/categorías y persistencia | `src/app/services/todo.service.ts` |
| CRUD de categorías (crear, renombrar, eliminar) | `src/app/services/todo.service.ts`, `src/app/categories/categories.page.ts`, `src/app/categories/categories.page.html` |
| Asignación y filtro por categoría | `src/app/home/home.page.ts`, `src/app/home/home.page.html` |
| Feature flag de categorías | `src/app/services/feature-flags.service.ts` |
| Configuración Firebase/Remote Config | `src/environments/environment.ts`, `src/environments/environment.prod.ts` |
| Estructura híbrida con Cordova | `package.json`, `config.xml` |

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

## 5) Firebase y Remote Config (lo que integré)

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Registrar una app Web y copiar credenciales en:
   - `src/environments/environment.ts`
   - `src/environments/environment.prod.ts`
3. (Opcional recomendado para repos públicos) partir de:
   - `src/environments/environment.example.ts`
   - `src/environments/environment.prod.example.ts`
4. Configuré en Remote Config el parámetro:

| Parámetro | Tipo | Valores |
|---|---|---|
| `feature_todo_categories` | string | `true`/`1` habilita, `false`/`0` deshabilita |

Comportamiento implementado:

- Habilitado (`true`/`1`): se muestra gestión de categorías y filtro.
- Deshabilitado (`false`/`0`): se ocultan esas opciones y se usa categoría base.

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

## 7) Build móvil y artefactos

### Android (flujo implementado)

```bash
npm run build:prod
npx cordova build android --release
```

- El artefacto release se genera en `platforms/android/app/build/outputs/...`.
- La firma final depende del keystore de distribución del evaluador/entorno.

### iOS (flujo implementado)

```bash
npm run build:prod
npx cordova build ios --release
```

- Abrir `platforms/ios/*.xcworkspace` en Xcode.
- Ejecutar `Product -> Archive` para generar el archivo de distribución.

Nota real de esta implementación: con `Personal Team` se puede compilar y probar en iPhone físico, pero exportar IPA distribuible requiere membresía activa en Apple Developer Program.

## 8) Optimización de rendimiento aplicada

- Estado reactivo con `signals` + `computed` para reducir trabajo de render.
- `ChangeDetectionStrategy.OnPush` en la pantalla principal.
- Rutas lazy-loaded para reducir costo de carga inicial.
- Iteración de listas con tracking por `id` para minimizar re-renderizados.
- Carga remota de flags en arranque con fallback local para resiliencia.

## 9) Calidad, mantenibilidad y escalabilidad aplicadas

- Servicios separados por responsabilidad (`TodoService`, `FeatureFlagsService`).
- Modelos tipados para tareas y categorías.
- Reglas de validación de categorías (normalización y unicidad).
- Manejo de estados vacíos y datos legacy para robustez.
- Scripts estandarizados para build/test/lint definidos en `package.json`.

## 10) Respuestas sobre mi implementación

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

## 11) Evidencias que recomiendo adjuntar

- Capturas o video mostrando: creación de tarea, completado, eliminación, categorías y filtro.
- Evidencia de `feature_todo_categories` en estado ON y OFF.
- Evidencia de build Android release.
- Evidencia de build/archive iOS con aclaración de limitación de cuenta si aplica.

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

## 14) Entrega

Este desarrollo se realizó directamente sobre este repositorio (sin fork), manteniendo versionamiento con commits de avance por funcionalidad.

1. Publicar este repositorio con el código actualizado.
2. Adjuntar evidencias funcionales (capturas/video).
3. Compartir artefactos móviles generados (o evidencia de archive en iOS si hay restricción de cuenta).
