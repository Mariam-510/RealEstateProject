import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../Services/ApiServices/auth.service';
import { API_CONFIG } from '../app.config';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    // Get the token from storage
    const token = this.authService.getToken();

    // Clone request and add authorization header
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Pass the modified request
    return next.handle(request).pipe(
      catchError((error) => {
        if (error.status === 401) { // Unauthorized
          this.authService.logout();
          this.router.navigate(['/login'], {
            queryParams: { message: 'Unauthorized' }
          });
          console.log(error);
        }
        return throwError(error);
      })
    );
  }
}
