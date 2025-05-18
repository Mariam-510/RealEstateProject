import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './Interceptors/jwt.interceptor';
import { OpenaiInterceptor } from './Interceptors/openai.interceptor';

// src/app/config/api.config.ts
export const API_CONFIG = {
  // apiUrl: 'https://localhost:7184/',
  apiUrl: 'https://realestategp.runasp.net/',
  apiUrlNoSlash: 'https://realestategp.runasp.net',
};

export const environment = {
  production: true,
  openaiUrl: 'https://api.openai.com/v1/chat/completions',
  openaiKey: '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'
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),

    // Register interceptors using HTTP_INTERCEPTORS token
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: OpenaiInterceptor,
      multi: true,
    },
  ],
};
