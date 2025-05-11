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
<<<<<<< Updated upstream
  apiUrl: 'https://localhost:7184/',
  // apiUrl: 'http://realestategp.runasp.net/',
  apiUrlNoSlash: 'http://realestategp.runasp.net',
=======
  // apiUrl: 'https://localhost:7184/',
  apiUrl: 'https://realestategp.runasp.net/',
  apiUrlNoSlash: 'https://realestategp.runasp.net',
>>>>>>> Stashed changes
};

export const environment = {
  production: false,
  openaiUrl: 'https://api.openai.com/v1/chat/completions',
  openaiKey:
    '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',
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
