import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../app.config';

@Injectable()
export class OpenaiInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url === environment.openaiUrl) {
      const cloned = request.clone({
        setHeaders: {
          Authorization: `Bearer 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`,
          'Content-Type': 'application/json'
        }
      });
      return next.handle(cloned);
    }
    return next.handle(request);
  }
}