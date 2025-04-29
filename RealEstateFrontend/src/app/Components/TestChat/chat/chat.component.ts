// components/chat/chat.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../../Services/ApiServices/chat.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  newMessage = '';
  selectedUserId?: string;
  targetUserId: string = ''; // For user to input who they want to chat with
  currentUser: any;
  isBuyer: boolean = false;
  private subscriptions = new Subscription();

  constructor(
    public chatService: ChatService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isBuyer = this.currentUser?.role === 'buyer'; // Adjust based on your role property

    this.chatService.startConnection();
    this.subscriptions.add(
      this.chatService.messages$.subscribe((messages) => {
        this.messages = messages;
      })
    );
  }

  ngOnDestroy(): void {
    this.chatService.stopConnection();
    this.subscriptions.unsubscribe();
  }

  startChat(): void {
    if (!this.targetUserId) return;

    this.selectedUserId = this.targetUserId;
    // Clear any previous messages
    this.messages = [];

    // If you want to load history, you would call:
    // this.chatService.getChatHistory(this.selectedUserId).subscribe(...);
  }

  // components/chat/chat.component.ts
  // ... existing code ...

  sendMessage(): void {
    if (!this.selectedUserId || !this.newMessage.trim()) return;

    const messageContent = this.newMessage;
    this.newMessage = ''; // Clear the input immediately

    this.subscriptions.add(
      this.chatService
        .sendMessage(this.selectedUserId, messageContent)
        .subscribe({
          error: (err) => {
            // If there's an error, you might want to show the message again
            console.error('Error sending message:', err);
            this.newMessage = messageContent;
          },
        })
    );
  }

  // ... rest of the code ...

  isCurrentUser(senderId: string): boolean {
    return senderId === this.currentUser?.userId.toString();
  }
}
