/**
 * Copia este archivo como `environment.ts` y `environment.prod.ts`
 * y reemplaza los valores con tu proyecto de Firebase Console.
 *
 * Remote Config: crea en la consola el parámetro usado como feature flag
 * (por ejemplo `feature_todo_categories`) y alinea los defaults aquí.
 */
export const environment = {
  production: false,
  firebase: {
    apiKey: 'TU_API_KEY',
    authDomain: 'tu-proyecto.firebaseapp.com',
    projectId: 'tu-proyecto',
    storageBucket: 'tu-proyecto.appspot.com',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:xxxxxxxx',
    measurementId: 'G-XXXXXXXXXX',
  },
  /** Valores por defecto para Remote Config hasta que se descargue la config remota */
  remoteConfigDefaults: {
    feature_todo_categories: 'true',
  },
};
