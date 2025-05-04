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
          Authorization: `Bearer ${environment.openaiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return next.handle(cloned);
    }
    return next.handle(request);
  }
}