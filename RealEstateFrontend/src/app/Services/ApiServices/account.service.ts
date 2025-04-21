import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private apiUrl = 'http://realestategp.runasp.net/api/Accounts'; // Replace with actual API URL

  constructor(private http: HttpClient) { }

  register(userData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/Register`, userData);
  }

  registerAgent(userData: FormData): Observable<any> {
    // Correct endpoint: RegisterAgent
    return this.http.post(`${this.apiUrl}/RegisterAgent`, userData);
  }

  // Add this new method for email confirmation
  confirmEmailCode(email: string, code: string): Observable<any> {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('code', code);

    return this.http.post(`${this.apiUrl}/ConfirmEmailCode`, formData);
  }

}
