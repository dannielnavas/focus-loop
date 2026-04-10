import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { initDesktop } from './app/core/desktop/init';

initDesktop()
  .then(() => bootstrapApplication(App, appConfig))
  .then((appRef) => appRef.whenStable())
  .then(() => {
    // Electron ventana hija: el proceso principal espera esta bandera antes de disparar `electron-navigate`.
    (window as unknown as { __FL_APP_READY__?: boolean }).__FL_APP_READY__ = true;
  })
  .catch((err) => console.error(err));
