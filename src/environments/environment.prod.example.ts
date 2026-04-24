/**
 * Plantilla para `environment.prod.ts` en builds de producción.
 * Copia este archivo como `environment.prod.ts` y usa los mismos valores de Firebase
 * que en desarrollo (o un proyecto Firebase distinto si aplica).
 */
export const environment = {
  production: true,
  firebase: {
    apiKey: 'TU_API_KEY',
    authDomain: 'tu-proyecto.firebaseapp.com',
    projectId: 'tu-proyecto',
    storageBucket: 'tu-proyecto.appspot.com',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:xxxxxxxx',
    measurementId: 'G-XXXXXXXXXX',
  },
  remoteConfigDefaults: {
    feature_todo_categories: 'true',
  },
};
