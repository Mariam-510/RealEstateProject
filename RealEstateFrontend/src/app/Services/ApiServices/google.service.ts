import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { API_CONFIG } from '../../app.config';
import { lastValueFrom } from 'rxjs'; // Add this import


@Injectable({
  providedIn: 'root'
})
export class GoogleService {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService); // Inject your AuthService

  constructor() {
    if (window.location.hash.includes('access_token')) {
      this.handleGoogleRedirect();
    }
  }

  googleLogin(): void {
    const clientId = '787977218185-shafp92svop2slqecfj7espka3b35pth.apps.googleusercontent.com';
    // const redirectUri = 'http://localhost:4200/home';
    const redirectUri = `${window.location.origin}/home`; 
    console.log(redirectUri);
    const scope = 'email profile openid';
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token id_token&scope=${scope}`;

    window.location.href = authUrl;
  }


  private formatGoogleUser(userInfo: any): any {
    return {
      sub: userInfo.sub,        // Maps to Sub
      email: userInfo.email,    // Required in backend
      name: userInfo.name,
      givenName: userInfo.given_name,   // Maps to GivenName
      familyName: userInfo.family_name, // Maps to FamilyName
      picture: userInfo.picture || 'img/userIcon.png'
    };
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


  private async handleGoogleRedirect(): Promise<void> {
    try {
      const fragment = window.location.hash.substring(1);

      const params = new URLSearchParams(fragment);
      const accessToken = params.get('access_token');

      if (!accessToken) {
        throw new Error('No access token found');
      }

      history.replaceState(null, '', window.location.pathname);

      const userInfo = await this.getGoogleUserInfo(accessToken);
      const formattedUser = this.formatGoogleUser(userInfo);

      // console.log(formattedUser);

      const apiUrl = `${API_CONFIG.apiUrl}api/Accounts/login/google`;

      this.http.post<{ tokenDto: { jwtToken: string } }>(apiUrl, formattedUser)
        .subscribe({
          next: (response) => {
            // console.log('Login successful, token:', response.tokenDto.jwtToken);
            this.auth.setAuthState(response.tokenDto.jwtToken, true);
            this.router.navigate(['/home'], { replaceUrl: true });
          },
          error: (err) => {
            console.error('API Error details:', err.error);
            this.router.navigate(['/login'], { replaceUrl: true });
          }
        });
    } catch (error) {
      console.error('Google Login Error details:', error);
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }


}
