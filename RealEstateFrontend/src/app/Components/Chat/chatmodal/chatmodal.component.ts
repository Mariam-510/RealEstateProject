import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, } from '@angular/forms';
import { AfterViewChecked, ElementRef, ViewChild,AfterViewInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService, User } from '../../../Services/ApiServices/auth.service';
import { ConversationService } from '../../../Services/ApiServices/conversation.service';
import { MessageResponseDto, MessageService } from '../../../Services/ApiServices/message.service';
import { API_CONFIG } from '../../../app.config';
import { OnDestroy } from '@angular/core';
import { ChatService, IncomingChatMessage } from '../../../Services/ApiServices/chat.service';


enum MessageStatus {
  Pending = 'Pending',
  Sent = 'Sent',
  Rejected = 'Rejected',
  Delivered = 'Delivered',
  Read = 'Read',
}

interface Message {
  text: string;
  sent: boolean;
  time: Date;
  status: MessageStatus;
  senderId?: string;
  profileImg?: string;
}

@Component({
  selector: 'app-chatmodal',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatmodal.component.html',
  styleUrl: './chatmodal.component.css'
})
export class ChatmodalComponent implements OnInit, AfterViewChecked, AfterViewInit {
  isChatVisible = false;
  newMessage = '';
  today = new Date();
  private shouldScroll = true;
  private justOpened = false; // Flag to track initial open
  // currentUserId: string | undefined;
  recipientId: string | undefined;
  conversationId: number | null = null;
  messages: Message[] = [];
  apiConfig = API_CONFIG;
  currentUser!: User | undefined;
  // loggedInUser!: User | undefined;
  private messageSubscription: any;

  ngAfterViewInit() {
    this.scrollToBottom(true); // Force initial scroll
  }

  ngAfterViewChecked() {
    if (this.justOpened && this.isChatVisible) {
      this.scrollToBottom(true); // Scroll after view updates
      this.justOpened = false; // Reset flag
    }
    this.checkScrollPosition();
  }
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  // messages = [
  //   {
  //     text: "Hello, this is Lora, a Licensed Advisor with Redfin...",
  //     sent: false,
  //     time: new Date(),
  //     status: MessageStatus.Read,
  //     profileImg: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D"
  //   },
  //   {
  //     text: "Request showing",
  //     sent: true,
  //     time: new Date(),
  //     status: MessageStatus.Delivered
  //   },

  //   {
  //     text: "Request showing",
  //     sent: true,
  //     time: new Date(),
  //     status: MessageStatus.Pending
  //   },
   
  //   {
  //     text: "Request showing",
  //     sent: true,
  //     time: new Date(),
  //     status: MessageStatus.Rejected
  //   }
  //   ,  {
  //     text: "Request showing",
  //     sent: true,
  //     time: new Date(),
  //     status: MessageStatus.Sent
  //   },
  //   {
  //     // Pending = 'Pending',
  //     // Sent = 'Sent',
  //     // Rejected = 'Rejected',
  //     // Delivered = 'Delivered',
  //     // Read = 'Read',
  //     text: "Request showing",
  //     sent: true,
  //     time: new Date(),
  //     status: MessageStatus.Read
  //   },

  // ];

// Add to component constructor
constructor(private cd: ChangeDetectorRef, private auth: AuthService,
    private conversationService: ConversationService, private messageService: MessageService, private chatService: ChatService) {}

ngOnInit(): void {
  // this.currentUserId = this.auth.getCurrentUser()?.accountId;
  this.auth.currentUser$.subscribe(user => {
    this.currentUser = user;
    this.setupSignalR();
  });

}


private setupSignalR() {
  this.chatService.startConnection();
  
  this.messageSubscription = this.chatService.messages$.subscribe((messages: IncomingChatMessage[]) => {
    if (!messages.length || !this.conversationId) return;

    const latestMessage = messages[messages.length - 1];
    
    // Check if message belongs to current conversation
    if (latestMessage.conversationId === this.conversationId) {
      const exists = this.messages.some(m => 
        m.time.getTime() === new Date(latestMessage.sentAt).getTime() && 
        m.text === latestMessage.content
      );
      
      if (!exists) {
        const newMessage: Message = {
          text: latestMessage.content,
          sent: latestMessage.senderId === this.currentUser?.accountId,
          time: new Date(latestMessage.sentAt),
          status: MessageStatus.Delivered,          
          senderId: latestMessage.senderId
        };
        
        this.messages = [...this.messages, newMessage];
        this.scrollToBottom(true);
        this.cd.detectChanges();
      }
    }
  });
}




initializeWithRecipient(recipientId: string) {
  this.recipientId = recipientId;
  if (this.currentUser?.accountId) {
    this.conversationService.getConversationBetweenUsers(recipientId)
      .subscribe(conv => this.initializeChat(conv.id));
  }
}

initializeChat(conversationId: number) {
  this.conversationId = conversationId;
  this.loadMessages();
}

private loadMessages() {
  if (!this.conversationId) return;

  this.messageService.getAllMessages(this.conversationId).subscribe({
    next: (messages: MessageResponseDto[]) => {
      // Sort messages ascending (oldest first)
      this.messages = messages
        .map(msg => this.mapMessage(msg))
        .sort((a, b) => a.time.getTime() - b.time.getTime());

      // Scroll after DOM updates
      setTimeout(() => this.scrollToBottom(true), 50);
    },
    error: (err) => console.error('Error loading messages:', err)
  });
}

private mapMessage(msg: MessageResponseDto): Message {
  return {
    text: msg.content,
    sent: msg.senderId === this.currentUser?.accountId,
    time: new Date(msg.sentAt),
    status: msg.status as MessageStatus,
    senderId: msg.senderId
  };
}

toggle() {
  this.isChatVisible = !this.isChatVisible;
  if (this.isChatVisible) {
    this.justOpened = true;
    this.cd.detectChanges();
    
    // Double scroll triggers to ensure positioning
    setTimeout(() => {
      this.scrollToBottom(true);
      setTimeout(() => this.scrollToBottom(true), 100);
    }, 0);
  }
}

  showEmojiPicker = false;
  emojis = ['😀', '😍', '👍', '👎', '💰', '🏡', '📅', '🕒', '❓'];

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(emoji: string) {
    this.newMessage += emoji;
    this.showEmojiPicker = false;
  }

  getStatusClass(status: MessageStatus): string {
    switch(status) {
      case MessageStatus.Read: return 'status-read';
      case MessageStatus.Delivered: return 'status-delivered';
      case MessageStatus.Pending: return 'status-pending';
      default: return '';
    }
  }

  private scrollToBottom(force = false) {
    try {
      const element = this.messagesContainer?.nativeElement;
      if (!element) return;
  
      if (force || this.shouldScroll) {
        setTimeout(() => {
          // Use both methods for maximum compatibility
          element.scrollTop = element.scrollHeight;
          element.scroll({
            top: element.scrollHeight,
            behavior: force ? 'auto' : 'smooth'
          });
        }, 0);
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  private checkScrollPosition() {
    const element = this.messagesContainer?.nativeElement;
    if (element) {
      const isAtBottom = element.scrollHeight - element.clientHeight <= element.scrollTop + 50;
      this.shouldScroll = isAtBottom;
    }
  }
  trackByMessage(index: number, message: any): number {
    return index; // Add unique IDs in real app
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.conversationId) return;
  
    const optimisticMessage: Message = {
      text: this.newMessage.trim(),
      sent: true,
      time: new Date(),
      status: MessageStatus.Sent,
      senderId: this.currentUser?.accountId
    };
  
    // Add to bottom of the list
    this.messages = [...this.messages, optimisticMessage];
    this.newMessage = '';
    this.scrollToBottom(true);
  
    this.messageService.createMessage({
      conversationId: this.conversationId,
      content: optimisticMessage.text
    }).subscribe({
      next: (response) => {
        // Replace optimistic message with actual response
        this.messages = this.messages.map(m => 
          m === optimisticMessage ? this.mapMessage(response) : m
        );
      },
      error: (error) => {
        // Remove optimistic message on error
        this.messages = this.messages.filter(m => m !== optimisticMessage);
        this.scrollToBottom();
      }
    });
  }

}