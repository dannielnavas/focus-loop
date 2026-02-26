import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { initDesktop } from './app/core/desktop/init';

initDesktop()
  .then(() => bootstrapApplication(App, appConfig))
  .catch((err) => console.error(err));
