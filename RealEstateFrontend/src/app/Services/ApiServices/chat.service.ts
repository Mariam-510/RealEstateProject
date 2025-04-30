// services/chat.service.ts
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { API_CONFIG } from '../../app.config';

import { BehaviorSubject, Observable } from 'rxjs';

export interface IncomingChatMessage {
  id: number;
  content: string;
  sentAt: Date;
  status: number;
  senderId?: string;
  receiverId?: string;
  // isRead: boolean;
  conversationId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection?: signalR.HubConnection;
  private apiUrl = `${API_CONFIG.apiUrl}api/Chat`;

  private messagesSubject = new BehaviorSubject<IncomingChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  public startConnection(): void {
    if (this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${this.apiUrl}/chatHub`, {
            accessTokenFactory: () => this.authService.getToken() || ''
        })
        .withAutomaticReconnect()
        .build();

    this.hubConnection.start()
        .then(() => {
            console.log('SignalR connection started');
            // Join the user's group
            // const userId = this.authService.getCurrentUser()?.userId.toString();
            // if (userId) {
            //     this.hubConnection?.invoke('JoinChat', userId);
            // }
        })
        .catch(err => console.error('Error starting SignalR connection:', err));

    this.hubConnection.on('ReceiveMessage', (response: IncomingChatMessage) => {
      const newMessage: IncomingChatMessage = {
        id: response.id, // Temporary ID
        content: response.content,
        sentAt:  new Date(response.sentAt),
        senderId: response.senderId,
        receiverId: this.authService.getCurrentUser()?.userId.toString() || '',
        conversationId: response.conversationId,
        status: response.status,
      };
      this.messagesSubject.next([...this.messagesSubject.value, newMessage]);
    });
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = undefined;
    }
  }

  public sendMessage(receiverId: string, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, { receiverId, content });
}


  // public getChatHistory(otherUserId: string): Observable<ChatMessage[]> {
  //   return this.http.get<ChatMessage[]>(`${this.apiUrl}/history/${otherUserId}`);
  // }
}