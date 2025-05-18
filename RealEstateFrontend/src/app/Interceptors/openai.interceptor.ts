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