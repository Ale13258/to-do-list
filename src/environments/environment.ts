// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// Para un repo público: reemplaza los placeholders con tu proyecto Firebase
// (puedes partir de `environment.example.ts`).

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
  remoteConfigDefaults: {
    feature_todo_categories: 'true',
  },
};
