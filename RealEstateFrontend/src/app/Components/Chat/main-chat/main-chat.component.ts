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
import { ToastrService } from '../../../Services/toastr.service';

interface Message {
  id?: number;
  text: string;
  sent: boolean;
  time: Date;
  senderId: string | undefined;
}

interface Chat {
  id: number;
  conversationStatus: string;
  otherUser: {
    userId: string | undefined;
    firstName: string;
    lastName: string | null;
    imageUrl?: string | null; 
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
  disabled = false;

  constructor(
    private conversationService: ConversationService,
    private auth: AuthService,
    private account: AccountService,
    private messageService: MessageService,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    if (
      !this.auth.hasRole('Buyer') &&
      !this.auth.hasRole('Seller') &&
      !this.auth.hasRole('Agent')
    ) {
      this.auth.logout();
      return;
    }

    console.log(this.selectedChat?.conversationStatus);

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
            // Always start with all conversations
            let validConversations = [...conversations];

            // Fetch messages and filter in one pass
            const loadedChats = await Promise.all(
                validConversations.map(async (dto) => {
                    const chat = this.mapDtoToChat(dto);
                    chat.unread = this.getUnreadCounts()[chat.id.toString()] || 0;

                    try {
                        const messages = await this.messageService
                            .getAllMessages(chat.id)
                            .toPromise();
                        
                        // Only populate messages if they exist
                        if (messages?.length) {
                            chat.messages = messages
                                .map(msg => this.mapMessageDto(msg))
                                .sort((a, b) => a.time.getTime() - b.time.getTime());
                        }
                    } catch (error) {
                        console.error('Error loading messages:', error);
                        chat.messages = [];
                    }

                    return chat;
                })
            );

            // Strict filtering - only keep conversations with messages
            this.conversations = loadedChats.filter(chat => 
                chat.messages.length > 0
            );

            // Additional filter for non-agents/sellers
            if (!this.isAgentOrSeller()) {
                this.conversations = this.conversations.filter(chat =>
                    chat.conversationStatus !== 'Pending'
                );
            }

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
      id: dto.id,
      text: dto.content,
      sent: dto.senderId === this.currentUserId,
      time: new Date(dto.sentAt),
      senderId: dto.senderId,
    };
  }

  private mapDtoToChat(dto: ConversationResponseDto): Chat {
    const otherAccountId =
      dto.firstAccountId === this.currentUserId
        ? dto.secondAccountId
        : dto.firstAccountId;

    const chat: Chat = {
      id: dto.id,
      conversationStatus: dto.status,
      otherUser: {
        userId: otherAccountId,
        firstName: 'Loading...',
        lastName: '',
        imageUrl: '',
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
          imageUrl: user.imageUrl
        };
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load user info:', err);
        chat.otherUser.firstName = 'Unknown User';
        chat.otherUser.lastName = '';

        this.cdr.markForCheck(); // Trigger update even on error
      },
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
      const isAtBottom =
        element.scrollHeight - element.clientHeight <= element.scrollTop + 50;
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
    this.showAcceptReject =
      chat.conversationStatus === 'Pending' && this.isAgentOrSeller();
    this.shouldDisableInput();

    this.messageService.getAllMessages(chat.id).subscribe({
      next: (messages: MessageResponseDto[]) => {
        this.selectedChat!.messages = messages
          .map((msg) => this.mapMessageDto(msg))
          .sort((a, b) => a.time.getTime() - b.time.getTime());
        setTimeout(() => this.scrollToBottom(true), 100);
      },
      error: (err) => console.error('Error fetching messages:', err),
    });
  }

  private isBuyer(): boolean {
    return this.auth.hasRole('Buyer');
  }

  sendMessage(event: Event) {
    event.preventDefault();
    const currentChat = this.selectedChat;
    if (!currentChat || !this.newMessage.trim()) return;

    if (
      currentChat.conversationStatus === 'Pending' &&
      this.isBuyer() &&
      currentChat.messages.length > 0
    ) {
      this.disabled = true;
      this.toastr.error(
        'Please wait for agent/seller response before sending more messages'
      );
      return;
    }

    const dto: CreateMessageDto = {
      conversationId: currentChat.id,
      content: this.newMessage.trim(),
    };

    const optimisticMessage: Message = {
      id: undefined,
      text: dto.content,
      sent: true,
      time: new Date(),
      senderId: this.currentUserId!,
    };

    currentChat.messages = [...currentChat.messages, optimisticMessage];
    currentChat.lastMessageTime = new Date();
    this.newMessage = '';
    this.cdr.detectChanges();
    this.scrollToBottom(true);

    const oldDisabledVal = this.disabled;
    if (currentChat.conversationStatus === 'Pending') {
        this.disabled = true;
    }

    this.cdr.detectChanges();

    this.messageService.createMessage(dto).subscribe({
      next: (response) => {
        currentChat.messages = currentChat.messages.map((m) =>
          m === optimisticMessage ? this.mapResponseToMessage(response) : m
        );

        if (currentChat.conversationStatus === 'Pending' && this.isBuyer()) {
          currentChat.conversationStatus = 'Pending';
        }

        if (response.senderId !== this.currentUserId) {
          const conversation = this.conversations.find(
            (c) => c.id === currentChat.id
          );
          if (conversation && conversation !== this.selectedChat) {
            conversation.unread++;
            this.updateUnreadCount(conversation.id, conversation.unread);
            this.sortConversations();
          }
        }
      },
      error: (error) => {
        currentChat.messages = currentChat.messages.filter(
          (m) => m !== optimisticMessage
        );
        this.disabled = oldDisabledVal;
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
    });
  }

  private shouldDisableInput(): void {
    if (!this.selectedChat) {
      this.disabled = true;
      return;
    }
    if (this.selectedChat.conversationStatus === 'Closed') {
      this.disabled = true;
      return;
    }
    if (this.showAcceptReject) {
      this.disabled = true;
      return;
    }
    if (
      this.isBuyer() &&
      this.selectedChat.conversationStatus === 'Pending' &&
      this.selectedChat.messages.length > 0
    ) {
      this.disabled = true;
      return;
    }
    this.disabled = false;
  }

  private setupSignalR() {
    this.chatService.startConnection();

    this.chatService.messages$.subscribe((messages: IncomingChatMessage[]) => {
      messages.forEach((message) => {
          const conversation = this.conversations.find(c => c.id === message.conversationId);
          
          if (!conversation) {
              // Get current user ID
              const currentUserId = this.auth.getCurrentUser()?.accountId;
              
              // Fetch conversation details to get participants
              this.conversationService.getByConversationId(message.conversationId!).subscribe({
                  next: async (convDto) => {
                      // Determine other user ID
                      const otherUserId = convDto.firstAccountId === currentUserId 
                          ? convDto.secondAccountId 
                          : convDto.firstAccountId;
  
                      // Fetch user details
                      this.account.getUserInfo(otherUserId).subscribe({
                          next: (user) => {
                              // Create temporary conversation with user data
                              const tempConv: Chat = {
                                  id: message.conversationId!,
                                  conversationStatus: convDto.status,
                                  otherUser: {
                                      userId: otherUserId,
                                      firstName: user.firstName,
                                      lastName: user.lastName || null,
                                      imageUrl: user.imageUrl || null
                                  },
                                  messages: [this.mapMessageDto(message)],
                                  unread: 1,
                                  lastMessageTime: new Date(message.sentAt)
                              };
                              
                              this.conversations.push(tempConv);
                              this.sortConversations();
                              this.cdr.detectChanges();
                          },
                          error: (err) => {
                              console.error('Failed to load user info:', err);
                              // Fallback to empty user data
                              const tempConv: Chat = {
                                  id: message.conversationId!,
                                  conversationStatus: convDto.status,
                                  otherUser: {
                                      userId: otherUserId,
                                      firstName: 'Unknown',
                                      lastName: null,
                                      imageUrl: null
                                  },
                                  messages: [this.mapMessageDto(message)],
                                  unread: 1,
                                  lastMessageTime: new Date(message.sentAt)
                              };
                              this.conversations.push(tempConv);
                              this.sortConversations();
                              this.cdr.detectChanges();
                          }
                      });
                  },
                  error: (err) => console.error('Failed to load conversation:', err)
              });
          } else {
              // Existing conversation handling
              this.processMessage(message, conversation);
          }
      });
  });

    this.chatService.conversationStatusUpdates$.subscribe(updatedConv => {
      if (!updatedConv) return; // Null check
      
      const index = this.conversations.findIndex(c => c.id === updatedConv.id);
      if (index !== -1) {
          this.conversations[index].conversationStatus = updatedConv.status;
          this.sortConversations();
      }
      if (this.selectedChat?.id === updatedConv.id) {
          this.selectedChat.conversationStatus = updatedConv.status;
          this.shouldDisableInput();
          this.cdr.detectChanges();
      }
  });

  this.chatService.newConversation$.subscribe(newConv => {
    if (!newConv || !newConv.lastMessageAt) return; // Only show if has message
    
    const exists = this.conversations.some(c => c.id === newConv.id);
    if (!exists) {
        // Only add if messages exist
        this.messageService.getAllMessages(newConv.id).subscribe(messages => {
            if (messages.length > 0) {
                const newChat = this.mapDtoToChat(newConv);
                this.conversations.push(newChat);
                this.sortConversations();
                this.cdr.detectChanges();
            }
        });
    }
});
  }

  private processMessage(message: IncomingChatMessage, conversation?: Chat) {
    if (!conversation) return;

    const exists = conversation.messages.some(m => 
      (m.id && m.id === message.id) ||  // Check ID if present
      (!m.id && m.time.getTime() === new Date(message.sentAt).getTime() && m.text === message.content)
    );
    
    if (!exists) {
        const newMessage = this.mapMessageDto({
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            sentAt: message.sentAt,
            conversationId: message.conversationId
        });
        
        conversation.messages.push(newMessage);
        conversation.lastMessageTime = new Date(message.sentAt);
        
        if (this.selectedChat?.id === conversation.id) {
            this.scrollToBottom(true);
        } else if (!newMessage.sent) {
            conversation.unread++;
            this.updateUnreadCount(conversation.id, conversation.unread);
        }
        
        this.sortConversations();
        this.cdr.detectChanges();
    }
  }

  private sortConversations() {
    console.log(this.conversations);

    this.conversations.sort((a, b) => {
      const timeA = a.lastMessageTime
        ? new Date(a.lastMessageTime).getTime()
        : 0;
      const timeB = b.lastMessageTime
        ? new Date(b.lastMessageTime).getTime()
        : 0;
      return timeB - timeA;
    });

    console.log(this.conversations);
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

  private mapResponseToMessage(response: MessageResponseDto): Message {
    return {
      text: response.content,
      sent: response.senderId === this.currentUserId,
      time: new Date(response.sentAt),
      senderId: response.senderId,
    };
  }

  private isAgentOrSeller(): boolean {
    return this.auth.hasRole('Agent') || this.auth.hasRole('Seller');
  }

  acceptConversation() {
    const selectedChat = this.selectedChat;
    if (!selectedChat) return;

    this.conversationService.updateConversationStatus(selectedChat.id, 'Active')
        .subscribe({
            next: (updatedConversation) => {
                // Add null check for selectedChat in the callback
                if (!selectedChat) return;

                // Update local conversation status
                selectedChat.conversationStatus = 'Active';
                this.showAcceptReject = false;
                this.shouldDisableInput();

                // Update conversation in list
                const index = this.conversations.findIndex(c => c.id === selectedChat.id);
                if (index > -1) {
                    this.conversations[index].conversationStatus = 'Active';
                }

                // Filter messages with null check
                if (selectedChat.messages) {
                    selectedChat.messages = selectedChat.messages.filter(m => 
                        typeof m.id === 'number'
                    );
                }
                
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Accept failed:', err)
        });
}

  rejectConversation() {
    if (!this.selectedChat) return;

    this.conversationService
      .updateConversationStatus(this.selectedChat.id, 'Closed')
      .subscribe({
        next: (updatedConversation) => {
          this.selectedChat!.conversationStatus = 'Closed';
          this.showAcceptReject = false;
          this.shouldDisableInput();

          const index = this.conversations.findIndex(
            (c) => c.id === this.selectedChat!.id
          );
          if (index > -1) {
            this.conversations[index].conversationStatus = 'Closed';
            // this.conversations[index].lastMessageTime = new Date();
          }

          this.cdr.detectChanges();
        },
        error: (err) => console.error('Reject failed:', err),
      });
  }

  trackByConversationId(index: number, chat: Chat): number {
    return chat.id; // Helps Angular recognize reordered items
  }

  deselectChat() {
    this.selectedChat = null;
    this.cdr.detectChanges();
  }
}