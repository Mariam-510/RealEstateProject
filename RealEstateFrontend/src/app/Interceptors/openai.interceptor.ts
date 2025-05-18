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