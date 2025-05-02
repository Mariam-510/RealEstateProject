import { Injectable } from '@angular/core';
import { API_CONFIG } from '../../app.config';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';


export interface ConversationResponseDto {
  id: number;
  firstAccountId: string;
  secondAccountId: string;
  status: string;
  lastMessageAt?: Date;
  createdAt: Date;
}

export enum ConversationStatus {
  Pending = 'Pending',
  Active = 'Active',
  Closed = 'Closed'
}

@Injectable({
  providedIn: 'root'
})
export class ConversationService {

  private apiUrl = `${API_CONFIG.apiUrl}api/Conversations`;

  constructor(private http: HttpClient) { }

  createConversation(secondAccountId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/create`,
      null, // No request body needed
      { params: { SecondAccountId: secondAccountId } }
    ).pipe(
      catchError(error => {
        // Handle errors and extract server message
        const message = error.error || 'An error occurred';
        return throwError(() => message);
      })
    );
  }

  getByConversationId(conversationId: number): Observable<ConversationResponseDto> {
    return this.http.get<ConversationResponseDto>(
      `${this.apiUrl}/GetById/${conversationId}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  getAllConversations(): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/getall`).pipe(
      catchError(this.handleError)
    );
  }

  existingConversation(secondAccountId: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/IsConversationExisting`,
      { params: { secondAccountId } }
    );
  }

  getConversationBetweenUsers(secondAccountId: string): Observable<ConversationResponseDto> {
    return this.http.get<ConversationResponseDto>(
      `${this.apiUrl}/GetConversation`,
      { params: { SecondAccountId: secondAccountId } }
    ).pipe(
      catchError(this.handleError)
    );
  }

  updateConversationStatus(
    conversationId: number, 
    newStatus: 'Active' | 'Closed'
  ): Observable<ConversationResponseDto> {
    return this.http.put<ConversationResponseDto>(
      `${this.apiUrl}/UpdateStatus/${conversationId}/${newStatus}`,
      {}
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    // Handle errors here
    return throwError(() => error);
  }
}
