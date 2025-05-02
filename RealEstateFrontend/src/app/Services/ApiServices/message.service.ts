import { Injectable } from '@angular/core';
import { API_CONFIG } from '../../app.config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateMessageDto {
  conversationId: number;
  content: string;
}

export interface MessageResponseDto {
  id: number;
  content: string;
  sentAt: Date;
  senderId?: string | undefined;
  conversationId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  
  private apiUrl = `${API_CONFIG.apiUrl}api/Messages`;

  constructor(private http: HttpClient) { }

  createMessage(createMessageDto: CreateMessageDto): Observable<MessageResponseDto> {
    return this.http.post<MessageResponseDto>(
      `${this.apiUrl}/Create`, 
      createMessageDto
    );
  }

  getAllMessages(conversationId: number): Observable<MessageResponseDto[]> {
    return this.http.get<MessageResponseDto[]>(
      `${this.apiUrl}/GetAllMessages/${conversationId}`
    );
  }
}
