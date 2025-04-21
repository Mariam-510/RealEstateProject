import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
// import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);

  // Unified user state (using both Signal and Observable)
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser = signal<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadInitialUser();

    // Check for Google OAuth redirect on initialization
    if (window.location.hash.includes('access_token')) {
      this.handleGoogleRedirect();
    }
  }

  private loadInitialUser() {
    // Check localStorage for Google user
    const googleUser = localStorage.getItem('googleUser');
    if (googleUser) {
      this.setUser(JSON.parse(googleUser));
    }
  }

  private formatGoogleUser(userInfo: any): any {
    return {
      id: userInfo.sub,
      name: userInfo.name,
      email: userInfo.email,
      avatar: userInfo.picture ? userInfo.picture : 'img/userIcon.png',
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      phoneNum: userInfo.phone_number || '011',
      authMethod: 'google',
      idToken: userInfo.id_token // Will be null unless you request it specifically
    };
  }

  private setUser(user: any) {
    this.currentUser.set(user);
    this.currentUserSubject.next(user);
  }

  private clearUser() {
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
  }


  // Google login - now initiates OAuth flow
  googleLogin(): void {
    const clientId = '787977218185-shafp92svop2slqecfj7espka3b35pth.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:4200/home';
    const scope = 'email profile openid';
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;

    window.location.href = authUrl;
  }

  // Handle Google OAuth redirect
  private async handleGoogleRedirect(): Promise<void> {
    try {
      const fragment = window.location.hash.substring(1);
      const params = new URLSearchParams(fragment);
      const accessToken = params.get('access_token');

      if (!accessToken) {
        throw new Error('No access token found');
      }

      const userInfo = await this.getGoogleUserInfo(accessToken);
      const formattedUser = this.formatGoogleUser(userInfo);

      this.setUser(formattedUser);
      localStorage.setItem('googleUser', JSON.stringify(formattedUser));

      // Clear the URL fragment and navigate
      this.router.navigate(['/home'], { replaceUrl: true });
    } catch (error) {
      console.error('Google login failed:', error);
      this.clearUser();
    }
  }

  private async getGoogleUserInfo(accessToken: string): Promise<any> {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return await response.json();
  }

  // Unified logout
  logout() {
    if (this.currentUser()?.authMethod === 'google') {
      // For direct OAuth, we can't programmatically sign out of Google,
      // but we can clear our local state
      localStorage.removeItem('googleUser');

      // Optional: Redirect to Google logout page
      // window.location.href = 'https://accounts.google.com/Logout';
    }
    this.clearUser();
    this.router.navigate(['/']);
  }

}
