// auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';

interface DecodedToken {
  // Standard claims
  sub: string;         // Account ID (from NameIdentifier)
  exp: number;
  userId: string;      // Agent/Seller/Buyer ID
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  roles: string | string[]; // Roles (array if multiple)
}

export interface User {
  accountId: string,      // From NameIdentifier
  userId: number,
  email: string,    // From custom userId claim
  firstName: string,
  lastName: string,
  imageUrl: string;
  roles: string | string[]; // Roles (array if multiple)
  tokenExpiration: Date
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private tokenExpirationTimer: any;

  constructor(private router: Router) {
    this.initializeAuthState();
  }

  private initializeAuthState() {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      this.setAuthState(token);
    }
  }

  setAuthState(token: string) {
    localStorage.setItem('jwtToken', token);
    const decoded = jwtDecode<DecodedToken>(token);

    const currentUser: User = {
      accountId: decoded.sub,
      userId: Number(decoded.userId),  // Converts the string to a number
      email: decoded.email,  // Map 'name' claim to email
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      imageUrl: decoded.imageUrl,
      roles: decoded.roles,
      tokenExpiration: new Date(decoded.exp * 1000)
    };

    this.currentUserSubject.next(currentUser);
    this.setAutoLogout(decoded.exp);
  }

  private setAutoLogout(expirationTime: number) {
    const expiresIn = expirationTime * 1000 - Date.now();

    this.tokenExpirationTimer = setTimeout(() => {
      this.logout(true);
    }, expiresIn);
  }

  logout(isExpired = false) {
    localStorage.removeItem('jwtToken');
    this.currentUserSubject.next(null);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    if (isExpired) {
      this.redirectToLoginWithMessage('Session expired. Please login again.');
    }
    this.router.navigate(['/login']);
  }

  private redirectToLoginWithMessage(message: string) {
    // Use your router to navigate to login with query params
    this.router.navigate(['/login'], {
      queryParams: { message }
    });
  }

  getToken() {
    return localStorage.getItem('jwtToken');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  // Safely check if the user exists and has roles
  hasRole(requiredRole: string): boolean {
    const user = this.currentUserSubject?.value;
    if (!user?.roles) return false;

    // Handle array or single string roles
    if (Array.isArray(user.roles)) {
      return user.roles.includes(requiredRole);
    }
    return user.roles === requiredRole;
  }

}
