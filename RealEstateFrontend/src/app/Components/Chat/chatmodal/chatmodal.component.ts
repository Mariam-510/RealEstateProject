import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, } from '@angular/forms';
import { AfterViewChecked, ElementRef, ViewChild,AfterViewInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService, User } from '../../../Services/ApiServices/auth.service';
import { ConversationResponseDto, ConversationService } from '../../../Services/ApiServices/conversation.service';
import { MessageResponseDto, MessageService } from '../../../Services/ApiServices/message.service';
import { API_CONFIG } from '../../../app.config';
import { ChatService, IncomingChatMessage } from '../../../Services/ApiServices/chat.service';
import { lastValueFrom } from 'rxjs';

interface Message {
  text: string;
  sent: boolean;
  time: Date;
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
  private justOpened = false;
  recipientId: string | undefined;
  conversationId: number | null = null;
  messages: Message[] = [];
  apiConfig = API_CONFIG;
  currentUser!: User | undefined;
  conversation: ConversationResponseDto | null = null;
  private messageSubscription: any;
  isNewConversation = false;
  isSending = false;
  disabled = false;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(private cd: ChangeDetectorRef, private auth: AuthService,
    private conversationService: ConversationService, private messageService: MessageService, private chatService: ChatService) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.setupSignalR();
    });
  }

  ngAfterViewInit() {
    this.scrollToBottom(true);
  }

  ngAfterViewChecked() {
    if (this.justOpened && this.isChatVisible) {
      this.scrollToBottom(true); // Scroll after view updates
      this.justOpened = false; // Reset flag
    }
    this.checkScrollPosition();
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
            senderId: latestMessage.senderId
          };
          
          this.messages = [...this.messages, newMessage];
          this.scrollToBottom(true);
          this.cd.detectChanges();
        }
      }
    });

    this.chatService.conversationStatusUpdates$.subscribe(updatedConv => {
      if (!updatedConv || !this.conversationId) return; // Null checks
      
      if (this.conversationId === updatedConv.id) {
          this.conversation = updatedConv;
          this.shouldDisableInput();
          this.cd.detectChanges();
      }
  });
  }

  async initializeChat(conversationId: number | null) {
    this.conversationId = conversationId;
    this.messages = [];
    // this.lastMessageAt = null;
    await this.loadConversationState();
    console.log('aaa', this.conversation);
    this.shouldDisableInput();
    this.cd.detectChanges();
  }

  private mapMessage(msg: MessageResponseDto): Message {
    return {
      text: msg.content,
      sent: msg.senderId === this.currentUser?.accountId,
      time: new Date(msg.sentAt),
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

  private scrollToBottom(force = false) {
    try {
      const element = this.messagesContainer?.nativeElement;
      if (!element) return;
  
      if (force || this.shouldScroll) {
        setTimeout(() => {
          element.scrollTop = element.scrollHeight;
          element.scroll({
            top: element.scrollHeight,
            behavior: 'smooth' // Instant scroll
          });
        }, 0); // Slight delay to allow DOM updates
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

  async sendMessage(event: Event) {
    event.preventDefault();
    if (!this.newMessage.trim() || !this.conversationId) return;

    const previousLastMessageAt = this.conversation?.lastMessageAt;
    const previousMessages = [...this.messages];
    
    this.isSending = true;
    const optimisticMsg: Message = {
        text: this.newMessage.trim(),
        sent: true,
        time: new Date(),
        senderId: this.currentUser?.accountId
    };

    this.messages = [...this.messages, optimisticMsg];
    this.newMessage = '';
    this.cd.detectChanges();
    
    this.scrollToBottom(true);

    const oldDisabledVal = this.disabled;
    if (this.conversation?.status === 'Pending') {
        this.disabled = true;
    }
    this.cd.detectChanges();

    this.messageService.createMessage({
        conversationId: this.conversationId,
        content: optimisticMsg.text
    }).subscribe({
        next: async (response) => { // Mark callback as async
            try {
                const validResponse = response as MessageResponseDto;
                this.messages = this.messages.map(msg => 
                    msg === optimisticMsg ? this.mapMessage(validResponse) : msg
                );
                
                // Now we can use await since the callback is async
                await this.loadConversationState();
                this.shouldDisableInput();
                this.scrollToBottom(true);
                this.cd.detectChanges();
            } catch (error) {
                console.error('Error in message handling:', error);
            }
        },
        error: (error) => {
            this.disabled = oldDisabledVal;
            this.messages = previousMessages;
            this.cd.detectChanges();
        },
        complete: () => {
            this.isSending = false;
        }
    });
}
  
  async loadConversationState() {
    if (!this.conversationId) return;

    try {
      // First API call - Get conversation
      const conv = await lastValueFrom(
        this.conversationService.getByConversationId(this.conversationId)
      );
      
      if (!conv) throw new Error('Conversation not found');
      this.conversation = conv;

      console.log('bbb', this.conversation);
      
      // Second API call - Get messages
      const messages = await lastValueFrom(
        this.messageService.getAllMessages(this.conversationId)
      );

      // Process messages
      this.messages = (messages || [])
      .map(msg => this.mapMessage(msg))
      .sort((a, b) => a.time.getTime() - b.time.getTime());
      
      this.scrollToBottom(true);
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      this.cd.detectChanges();
    }
  }

  shouldDisableInput(): void {
    // console.log(this.conversationStatus, this.lastMessageAt);
    // Immediately disable if conversation is closed
    console.log('statussssss', this.conversation?.status);
    if (this.conversation?.status === 'Closed')
    {
      this.disabled = true;
      return;
    }

    // Handle pending conversations
    if (this.conversation?.status === 'Pending') {
      // Disable if there's already a message (lastMessageAt exists)
      this.conversation.lastMessageAt === null ? this.disabled = false : this.disabled = true;
      return;
    }

    // Always enable for active conversations
    this.disabled = false;
    return;
  }
}