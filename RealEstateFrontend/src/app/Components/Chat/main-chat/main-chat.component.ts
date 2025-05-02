import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AfterViewChecked, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ConversationResponseDto, ConversationService } from '../../../Services/ApiServices/conversation.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { AccountService } from '../../../Services/ApiServices/account.service';
import { API_CONFIG } from '../../../app.config';
import { CreateMessageDto, MessageResponseDto, MessageService } from '../../../Services/ApiServices/message.service';
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
  senderId: string | undefined;
}

interface Chat {
  id: number;
  status: string;
  otherUser: {
    userId: string;
    firstName: string;
    lastName: string;
    image?: string;
  };
  messages: Message[];
  unread: number;
  lastMessageTime?: Date;
}

@Component({
  selector: 'app-main-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.css',
})
export class MainChatComponent implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  today = new Date();
  currentUserId: string | undefined;
  apiConfig = API_CONFIG;
  conversations: Chat[] = [];
  selectedChat: Chat | null = null;
  newMessage = '';
  isChatVisible = false;
  private shouldScroll = true;
  pendingMessage: Message | null = null;
  showAcceptReject = false;

  constructor(
    private conversationService: ConversationService,
    private auth: AuthService,
    private account: AccountService,
    private messageService: MessageService,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.auth.hasRole('Buyer') && !this.auth.hasRole('Seller') && !this.auth.hasRole('Agent')) {
      this.auth.logout();
      return;
    }

    console.log(this.selectedChat?.status)

    this.currentUserId = this.auth.getCurrentUser()?.accountId;
    this.initializeUnreadCounts();
    this.loadConversations();
    this.setupSignalR();
  }

  ngOnDestroy() {
    this.chatService.stopConnection();
  }

  private initializeUnreadCounts() {
    if (!localStorage.getItem('unreadCounts')) {
      localStorage.setItem('unreadCounts', JSON.stringify({}));
    }
  }

  private getUnreadCounts(): { [key: string]: number } {
    return JSON.parse(localStorage.getItem('unreadCounts') || '{}');
  }

  private updateUnreadCount(conversationId: number, count: number) {
    const unreadCounts = this.getUnreadCounts();
    unreadCounts[conversationId.toString()] = count;
    localStorage.setItem('unreadCounts', JSON.stringify(unreadCounts));
  }

  loadConversations() {
    this.conversationService.getAllConversations().subscribe({
      next: async (conversations: ConversationResponseDto[]) => {
        let validConversations = conversations;
        if (!this.isAgentOrSeller()) {
          validConversations = conversations.filter(
            (dto) => dto.lastMessageAt !== null && dto.lastMessageAt !== undefined
          );
        }

        const storedCounts = this.getUnreadCounts();

        this.conversations = await Promise.all(
          validConversations.map(async (dto) => {
            const chat = this.mapDtoToChat(dto);
            chat.unread = storedCounts[chat.id.toString()] || 0;

            try {
              const messages = await this.messageService.getAllMessages(chat.id).toPromise();
              if (messages?.length) {
                chat.messages = messages
                  .map((msg) => this.mapMessageDto(msg))
                  .sort((a, b) => a.time.getTime() - b.time.getTime());
              }
            } catch (error) {
              console.error('Error loading messages:', error);
            }

            return chat;
          })
        );

        this.sortConversations();
      },
      error: (err) => {
        console.error('Error loading conversations:', err);
        this.conversations = [];
      },
    });
  }

  private mapMessageDto(dto: MessageResponseDto): Message {
    return {
      text: dto.content,
      sent: dto.senderId === this.currentUserId,
      time: new Date(dto.sentAt),
      status: dto.status as MessageStatus,
      senderId: dto.senderId,
    };
  }

  private mapDtoToChat(dto: ConversationResponseDto): Chat {
    const otherAccountId = dto.firstAccountId === this.currentUserId
      ? dto.secondAccountId
      : dto.firstAccountId;

    const chat: Chat = {
      id: dto.id,
      status: dto.status,
      otherUser: {
        userId: otherAccountId,
        firstName: 'Loading...',
        lastName: '',
        image: 'PropertyImages/10-1.jpg',
      },
      messages: [],
      unread: 0,
      lastMessageTime: dto.lastMessageAt,
    };

    this.account.getUserInfo(otherAccountId).subscribe({
      next: (user) => {
        chat.otherUser = {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName || '',
          image: user.imageUrl || 'PropertyImages/10-1.jpg',
        };
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load user info:', err);
        chat.otherUser.firstName = 'Unknown User';
        chat.otherUser.lastName = '';
        this.cdr.markForCheck();
      }
    });

    return chat;
  }

  ngAfterViewInit() {
    this.scrollToBottom(true);
  }

  ngAfterViewChecked() {
    this.checkScrollPosition();
  }

  private checkScrollPosition() {
    const element = this.messagesContainer?.nativeElement;
    if (element) {
      const isAtBottom = element.scrollHeight - element.clientHeight <= element.scrollTop + 50;
      this.shouldScroll = isAtBottom;
    }
  }

  private scrollToBottom(force = false) {
    try {
      if (this.messagesContainer?.nativeElement && this.selectedChat) {
        const element = this.messagesContainer.nativeElement;
        if (force || this.shouldScroll) {
          setTimeout(() => {
            element.style.scrollBehavior = 'auto';
            element.scrollTop = element.scrollHeight;
            element.style.scrollBehavior = '';
          }, 0);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  selectChat(chat: Chat) {
    chat.unread = 0;
    this.updateUnreadCount(chat.id, 0);
    this.selectedChat = chat;
    this.newMessage = '';
    this.pendingMessage = chat.messages.find(m => m.status === MessageStatus.Pending) || null;
    this.showAcceptReject = chat.status === 'Pending' && this.isAgentOrSeller();

    this.messageService.getAllMessages(chat.id).subscribe({
      next: (messages: MessageResponseDto[]) => {
        this.selectedChat!.messages = messages
          .map((msg) => this.mapMessageDto(msg))
          .sort((a, b) => a.time.getTime() - b.time.getTime());
        setTimeout(() => this.scrollToBottom(true), 100);
      },
      error: (err) => console.error('Error fetching messages:', err)
    });
  }

  private isBuyer(): boolean {
    return this.auth.hasRole('Buyer');
  }

  sendMessage() {
    const currentChat = this.selectedChat;
    if (!currentChat || !this.newMessage.trim()) return;

    if (currentChat.status === 'Pending' && this.isBuyer() && currentChat.messages.length > 0) {
      alert('Please wait for agent/seller response before sending more messages');
      return;
    }

    const dto: CreateMessageDto = {
      conversationId: currentChat.id,
      content: this.newMessage.trim(),
    };

    const messageStatus = this.isAgentOrSeller() 
      ? MessageStatus.Sent
      : currentChat.status === 'Pending' 
        ? MessageStatus.Pending 
        : MessageStatus.Sent;

    const optimisticMessage: Message = {
      text: dto.content,
      sent: true,
      time: new Date(),
      status: messageStatus,
      senderId: this.currentUserId!,
    };

    currentChat.messages = [...currentChat.messages, optimisticMessage];
    currentChat.lastMessageTime = new Date();
    this.newMessage = '';
    this.scrollToBottom(true);

    this.messageService.createMessage(dto).subscribe({
      next: (response) => {
        currentChat.messages = currentChat.messages.map(m => 
          m === optimisticMessage ? this.mapResponseToMessage(response) : m
        );
        
        if (currentChat.status === 'Pending' && this.isBuyer()) {
          currentChat.status = 'Pending';
        }

        if (response.senderId !== this.currentUserId) {
          const conversation = this.conversations.find(c => c.id === currentChat.id);
          if (conversation && conversation !== this.selectedChat) {
            conversation.unread++;
            this.updateUnreadCount(conversation.id, conversation.unread);
            this.sortConversations();
          }
        }
      },
      error: (error) => {
        currentChat.messages = currentChat.messages.filter(m => m !== optimisticMessage);
        this.scrollToBottom();
      }
    });
  }

  shouldDisableInput(): boolean {
    if (!this.selectedChat) return true;
    if (this.selectedChat.status === 'Closed') return true;
    if (this.isBuyer() && this.selectedChat.status === 'Pending' && this.selectedChat.messages.length > 0) {
      return true;
    }
    return false;
  }

  private setupSignalR() {
    this.chatService.startConnection();

    this.chatService.messages$.subscribe((messages: IncomingChatMessage[]) => {
      messages.forEach((message) => {
        const conversation = this.conversations.find(c => c.id === message.conversationId);
        if (!conversation) return;

        const messageExists = conversation.messages.some(m => 
          m.time.getTime() === new Date(message.sentAt).getTime() &&
          m.text === message.content
        );

        if (!messageExists) {
          const newMessage = this.mapMessageDto({
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            sentAt: message.sentAt,
            status: MessageStatus.Delivered,
            conversationId: message.conversationId
          });

          conversation.messages.push(newMessage);
          conversation.lastMessageTime = new Date(message.sentAt);

          if (this.selectedChat?.id !== conversation.id && !newMessage.sent) {
            conversation.unread++;
            this.updateUnreadCount(conversation.id, conversation.unread);
            this.sortConversations();
          }
        }
      });
    });
  }

  private sortConversations() {
    this.conversations.sort((a, b) => 
      (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0)
    );
  }

  @HostListener('window:beforeunload')
  saveState() {
    const unreadCounts = this.conversations.reduce((acc, chat) => {
      acc[chat.id.toString()] = chat.unread;
      return acc;
    }, {} as { [key: string]: number });
    
    localStorage.setItem('unreadCounts', JSON.stringify(unreadCounts));
  }

  toggle() {
    this.isChatVisible = !this.isChatVisible;
  }

  getStatusClass(status: MessageStatus): string {
    switch (status) {
      case MessageStatus.Read: return 'status-read';
      case MessageStatus.Delivered: return 'status-delivered';
      case MessageStatus.Pending: return 'status-pending';
      default: return '';
    }
  }

  private mapResponseToMessage(response: MessageResponseDto): Message {
    return {
      text: response.content,
      sent: response.senderId === this.currentUserId,
      time: new Date(response.sentAt),
      status: response.status,
      senderId: response.senderId,
    };
  }

  private isAgentOrSeller(): boolean {
    return this.auth.hasRole('Agent') || this.auth.hasRole('Seller');
  }

  acceptConversation() {
    if (!this.selectedChat) return;

    this.conversationService.updateConversationStatus(this.selectedChat.id, 'Active').subscribe({
      next: (updatedConversation) => {
        this.selectedChat!.status = 'Active';
        this.showAcceptReject = false;
        
        const index = this.conversations.findIndex(c => c.id === this.selectedChat!.id);
        if (index > -1) {
          this.conversations[index].status = 'Active';
          this.conversations[index].lastMessageTime = new Date();
        }
        
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Accept failed:', err)
    });
  }
    
  rejectConversation() {
    if (!this.selectedChat) return;

    this.conversationService.updateConversationStatus(this.selectedChat.id, 'Closed').subscribe({
      next: (updatedConversation) => {
        this.selectedChat!.status = 'Closed';
        this.showAcceptReject = false;

        const index = this.conversations.findIndex(c => c.id === this.selectedChat!.id);
        if (index > -1) {
          this.conversations[index].status = 'Closed';
          this.conversations[index].lastMessageTime = new Date();
        }

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Reject failed:', err)
    });
  }
}