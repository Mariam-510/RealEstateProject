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
    // Check both storage locations
    let token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    if (token) {
      // Determine storage type used
      const rememberMe = localStorage.getItem('jwtToken') !== null;
      this.setAuthState(token, rememberMe);
    }
  }

  setAuthState(token: string, rememberMe: boolean) {
    // Clear opposite storage and set token in correct storage
    if (rememberMe) {
      localStorage.setItem('jwtToken', token);
      sessionStorage.removeItem('jwtToken');
    } else {
      sessionStorage.setItem('jwtToken', token);
      localStorage.removeItem('jwtToken');
    }

    const decoded = jwtDecode<DecodedToken>(token);

    const currentUser: User = {
      accountId: decoded.sub,
      userId: Number(decoded.userId),
      email: decoded.email,
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
    // Clear both storage locations
    localStorage.removeItem('jwtToken');
    sessionStorage.removeItem('jwtToken');
    this.currentUserSubject.next(null);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    if (isExpired) {
      this.redirectToLoginWithMessage('Session expired. Please login again.');
    } else {
      this.router.navigate(['/login']);
    }
  }

  private redirectToLoginWithMessage(message: string) {
    // Use your router to navigate to login with query params
    this.router.navigate(['/login'], {
      queryParams: { message }
    });
  }

  getToken() {
    return localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
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


  // Add to AuthService class
  updateToken(newToken: string) {
    // Preserve the original "remember me" choice
    const rememberMe = localStorage.getItem('jwtToken') !== null;

    // Clear existing token from both storages
    localStorage.removeItem('jwtToken');
    sessionStorage.removeItem('jwtToken');

    // Set new token using existing rememberMe preference
    if (rememberMe) {
      localStorage.setItem('jwtToken', newToken);
    } else {
      sessionStorage.setItem('jwtToken', newToken);
    }

    // Decode and update user state
    const decoded = jwtDecode<DecodedToken>(newToken);

    const currentUser: User = {
      accountId: decoded.sub,
      userId: Number(decoded.userId),
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      imageUrl: decoded.imageUrl,
      roles: decoded.roles,
      tokenExpiration: new Date(decoded.exp * 1000)
    };

    this.currentUserSubject.next(currentUser);
    this.setAutoLogout(decoded.exp);
  }

}
