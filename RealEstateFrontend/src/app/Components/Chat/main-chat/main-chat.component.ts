import { CommonModule } from '@angular/common';
<<<<<<< Updated upstream
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AfterViewChecked, ElementRef, ViewChild,AfterViewInit } from '@angular/core';
=======
import { Component, OnDestroy, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AfterViewChecked, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
>>>>>>> Stashed changes
import { ConversationResponseDto, ConversationService } from '../../../Services/ApiServices/conversation.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { AccountService } from '../../../Services/ApiServices/account.service';
import { API_CONFIG } from '../../../app.config';
import { CreateMessageDto, MessageResponseDto, MessageService } from '../../../Services/ApiServices/message.service';
<<<<<<< Updated upstream
=======
import { ChatService, IncomingChatMessage } from '../../../Services/ApiServices/chat.service';
>>>>>>> Stashed changes

enum MessageStatus {
  Pending = 'Pending',
  Sent = 'Sent',
  Rejected = 'Rejected',
  Delivered = 'Delivered',
  Read = 'Read',
}

<<<<<<< Updated upstream
enum UserRole {
  Buyer = 'Buyer',
  Seller = 'Seller',
  Agent = 'Agent'
}

enum ConversationStatus {
  Pending = 'Pending',
  Active = 'Active',
  Closed = 'Closed'
}
=======
>>>>>>> Stashed changes
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
  styleUrl: './main-chat.component.css'
})
<<<<<<< Updated upstream
export class MainChatComponent  implements OnInit, AfterViewChecked ,AfterViewInit{
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
=======
export class MainChatComponent implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  today = new Date();
>>>>>>> Stashed changes
  currentUserId: string | undefined;
  apiConfig = API_CONFIG;
  conversations: Chat[] = [];
  selectedChat: Chat | null = null;
  newMessage = '';
  isChatVisible = false;
  private shouldScroll = true;

<<<<<<< Updated upstream
  constructor(private conversationService: ConversationService, private auth: AuthService,
      private account: AccountService, private messageService: MessageService) {}
=======
  constructor(
    private conversationService: ConversationService,
    private auth: AuthService,
    private account: AccountService,
    private messageService: MessageService,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {}
>>>>>>> Stashed changes

  ngOnInit() {
    this.currentUserId = this.auth.getCurrentUser()?.accountId;
    this.initializeUnreadCounts();
    this.loadConversations();
<<<<<<< Updated upstream
    // this.loadUserDetailsForConversations();
    console.log(this.conversations);
=======
    this.setupSignalR();
>>>>>>> Stashed changes
  }

//   loadConversations() {
//     this.conversationService.getAllConversations().subscribe({
//         next: (conversations: ConversationResponseDto[]) => {
//             this.conversations = conversations.map(dto => this.mapDtoToChat(dto));
//         },
//         error: (err) => {
//             console.error('Error loading conversations:', err);
//             this.conversations = [];
//         }
//     });
// }

<<<<<<< Updated upstream
// loadConversations() {
//   this.conversationService.getAllConversations().subscribe({
//       next: (conversations: ConversationResponseDto[]) => {
//           // Filter conversations with messages and map to Chat
//           this.conversations = conversations
//               .filter(dto => 
//                   dto.lastMessageAt !== null &&  // Conversation has at least one message
//                   dto.lastMessageAt !== undefined
//               )
//               .map(dto => this.mapDtoToChat(dto));
          
//           // Optional: Sort by last message time (newest first)
//           this.conversations.sort((a, b) => 
//               new Date(b.lastMessageTime).getTime() - 
//               new Date(a.lastMessageTime).getTime()
//           );
//       },
//       error: (err) => {
//           console.error('Error loading conversations:', err);
//           this.conversations = [];
//       }
//   });
// }

loadConversations() {
  this.conversationService.getAllConversations().subscribe({
    next: async (conversations: ConversationResponseDto[]) => {
      const validConversations = conversations.filter(dto => 
        dto.lastMessageAt !== null && dto.lastMessageAt !== undefined
      );

      // Load all messages for each conversation
      this.conversations = await Promise.all(
        validConversations.map(async dto => {
          const chat = this.mapDtoToChat(dto);
          
          try {
            // Get ALL messages (no pagination)
            const messages = await this.messageService.getAllMessages(chat.id).toPromise();
            if (messages?.length) {
              // Store all messages but keep only last for list view
              chat.messages = messages
                .map(msg => this.mapMessageDto(msg))
                .sort((a, b) => a.time.getTime() - b.time.getTime()); // Sort ascending
=======
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
        const validConversations = conversations.filter(
          (dto) => dto.lastMessageAt !== null && dto.lastMessageAt !== undefined
        );

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
>>>>>>> Stashed changes
            }
          } catch (error) {
            console.error('Error loading messages:', error);
          }
          
          return chat;
        })
      );

      // Sort conversations by last message time
      this.conversations.sort((a, b) => 
        (b.messages[b.messages.length - 1]?.time?.getTime() || 0) - 
        (a.messages[a.messages.length - 1]?.time?.getTime() || 0)
      );
    },
    error: (err) => {
      console.error('Error loading conversations:', err);
      this.conversations = [];
    }
  });
}

<<<<<<< Updated upstream
private mapMessageDto(dto: MessageResponseDto): Message {
  return {
    text: dto.content,
    sent: dto.senderId === this.currentUserId,
    time: new Date(dto.sentAt),
    status: dto.status as MessageStatus,
    senderId: dto.senderId
  };
}
=======
        this.sortConversations();
      },
      error: (err) => {
        console.error('Error loading conversations:', err);
        this.conversations = [];
      },
    });
  }
>>>>>>> Stashed changes


  private mapDtoToChat(dto: ConversationResponseDto): Chat {
<<<<<<< Updated upstream
    // Determine which account is the other user
    const otherAccountId = dto.firstAccountId === this.currentUserId 
        ? dto.secondAccountId 
        : dto.firstAccountId;

    // Create initial chat object with loading state
    const chat: Chat = {
        id: dto.id,
        status: dto.status,
        otherUser: {
            userId: otherAccountId,
            firstName: 'Loading...',
            lastName: '',
            image: 'PropertyImages/10-1.jpg' // Temporary image
        },
        messages: [],
        unread: 0,
        lastMessageTime: dto.lastMessageAt
=======
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
>>>>>>> Stashed changes
    };
  
    this.account.getUserInfo(otherAccountId).subscribe({
<<<<<<< Updated upstream
        next: (user) => {
            chat.otherUser = {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName || '',
                image: user.imageUrl || 'PropertyImages/10-1.jpg'
            };
        },
        error: (err) => {
            console.error('Failed to load user info:', err);
            chat.otherUser.firstName = 'Unknown User';
            chat.otherUser.lastName = 'Unknown User';
            chat.otherUser.image = 'PropertyImages/10-1.jpg';
        }
=======
      next: (user) => {
        chat.otherUser = {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName || '',
          image: user.imageUrl || 'PropertyImages/10-1.jpg',
        };
        this.cdr.markForCheck(); // Trigger update
      },
      error: (err) => {
        console.error('Failed to load user info:', err);
        chat.otherUser.firstName = 'Unknown User';
        chat.otherUser.lastName = '';
        this.cdr.markForCheck(); // Trigger update even on error
      }
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      const isAtBottom = element.scrollHeight - element.clientHeight <= element.scrollTop + 50; // Increased threshold
=======
      const isAtBottom = element.scrollHeight - element.clientHeight <= element.scrollTop + 50;
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream


// selectChat(chat: Chat) {
//   this.selectedChat = chat;
//   this.newMessage = '';
//   chat.unread = 0;
//   console.log('Conversation ID:', chat.id);
  
//   // Force immediate scroll without animation
//   setTimeout(() => {
//     const element = this.messagesContainer?.nativeElement;
//     if (element) {
//       element.style.scrollBehavior = 'auto'; // Disable smooth scrolling
//       element.scrollTop = element.scrollHeight;
//       element.style.scrollBehavior = ''; // Reset to default
//     }
//   }, 0); // Zero delay after change detection
// }

selectChat(chat: Chat) {
  this.selectedChat = chat;
  this.newMessage = '';
  chat.unread = 0;

  // Load messages for the selected conversation
  this.messageService.getAllMessages(chat.id).subscribe({
    next: (messages: MessageResponseDto[]) => {
      // Map and sort messages in ascending order
      const mappedMessages = messages.map(msg => ({
        text: msg.content,
        sent: msg.senderId === this.currentUserId,
        time: new Date(msg.sentAt),
        status: msg.status as MessageStatus,
        senderId: msg.senderId
      } as Message)).sort((a, b) => a.time.getTime() - b.time.getTime()); // Ascending sort

      // Update chat messages
      this.selectedChat!.messages = mappedMessages;

      // Scroll after messages render
      setTimeout(() => this.scrollToBottom(true), 50);
    },
    error: (err) => {
      console.error('Error fetching messages:', err);
    }
  });

  // Existing scroll initialization
  setTimeout(() => {
    const element = this.messagesContainer?.nativeElement;
    if (element) {
      element.style.scrollBehavior = 'auto';
      element.scrollTop = element.scrollHeight;
      element.style.scrollBehavior = '';
    }
  }, 0);
}


// selectChat(chat: Chat) {
//   this.selectedChat = chat;
//   this.newMessage = '';
//   chat.unread = 0;

//   // Load messages for the selected conversation
//   this.messageService.getAllMessages(chat.id).subscribe({
//     next: (messages: MessageResponseDto[]) => {
//       // Map and sort messages
//       const mappedMessages = messages.map(msg => ({
//         text: msg.content,
//         sent: msg.senderId === this.currentUserId,
//         time: new Date(msg.sentAt),
//         status: msg.status as MessageStatus,
//         senderId: msg.senderId
//       } as Message));

//       // Sort by sentAt descending (newest first)
//       mappedMessages.sort((a, b) => a.time.getTime() - b.time.getTime());

//       // Update chat messages
//       this.selectedChat!.messages = mappedMessages;

//       // Scroll after messages render
//       setTimeout(() => this.scrollToBottom(true), 50);
//     },
//     error: (err) => {
//       console.error('Error fetching messages:', err);
//     }
//   });

//   // Existing scroll initialization
//   setTimeout(() => {
//     const element = this.messagesContainer?.nativeElement;
//     if (element) {
//       element.style.scrollBehavior = 'auto';
//       element.scrollTop = element.scrollHeight;
//       element.style.scrollBehavior = '';
//     }
//   }, 0);
// }



  selectedChat: Chat | null = null;
  // chats: Chat[] = [
  //   {
  //     id: 1,
  //     status: ConversationStatus.Active,
  //     otherUser: {
  //       id: '123',
  //       name: 'John Buyer',
  //       avatar: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-8.webp'
  //     },
  //     messages: [
  //       {
  //         text: "Hello, I'm interested in this property...",
  //         sent: true,
  //         time: new Date(Date.now() - 3600000),
  //         status: MessageStatus.Read,
  //         senderId: '456'
  //       }
  //     ],
  //     unread: 0,
  //     lastMessageTime: new Date(Date.now() - 3600000)
  //   },
  //   {
  //     id: 2,
  //     status: ConversationStatus.Active,
  //     otherUser: {
  //       id: '200',
  //       name: 'Ahmed Buyer',
  //       avatar: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-8.webp'
  //     },
  //     messages: [
  //       {
  //         text: "Alooooooooooooooooooooooooooooooooooooooooooo",
  //         sent: true,
  //         time: new Date(Date.now() - 3600000),
  //         status: MessageStatus.Sent,
  //         senderId: '456'
  //       }
  //     ],
  //     unread: 0,
  //     lastMessageTime: new Date(Date.now() - 3600000)
  //   },
  // ];
  

  isChatVisible = false;
  newMessage = '';
  today = new Date();
  currentUser = {
    role: UserRole.Buyer,  // ✅ Either Seller or Agent
    id: '456',
    name: 'Lora Agent'
  };

  activeConversation = {
    id: 1,
    status: ConversationStatus.Active, // ✅ Must be Pending
    otherUser: {
      id: '123',
      name: 'John Buyer',
      avatar: 'https://example.com/buyer-avatar.jpg'
    },
    initiator: UserRole.Buyer
  };
=======
  selectChat(chat: Chat) {
    chat.unread = 0;
    this.updateUnreadCount(chat.id, 0);
    this.selectedChat = chat;
    this.newMessage = '';

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

  sendMessage() {
    const currentChat = this.selectedChat;
    if (!currentChat || !this.newMessage.trim()) return;

    const dto: CreateMessageDto = {
      conversationId: currentChat.id,
      content: this.newMessage.trim(),
    };

    const optimisticMessage: Message = {
      text: dto.content,
      sent: true,
      time: new Date(),
      status: MessageStatus.Sent,
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
        
        // Update receiver's unread count if they're not viewing the chat
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
    // Save all current unread counts
    const unreadCounts = this.conversations.reduce((acc, chat) => {
      acc[chat.id.toString()] = chat.unread;
      return acc;
    }, {} as { [key: string]: number });
    
    localStorage.setItem('unreadCounts', JSON.stringify(unreadCounts));
  }
>>>>>>> Stashed changes

  toggle() {
    this.isChatVisible = !this.isChatVisible;
  }

  getStatusClass(status: MessageStatus): string {
<<<<<<< Updated upstream
    switch(status) {
=======
    switch (status) {
>>>>>>> Stashed changes
      case MessageStatus.Read: return 'status-read';
      case MessageStatus.Delivered: return 'status-delivered';
      case MessageStatus.Pending: return 'status-pending';
      default: return '';
    }
  }
<<<<<<< Updated upstream
  // get showAcceptReject(): boolean {
  //   const isReceiverSellerOrAgent = [UserRole.Seller, UserRole.Agent].includes(this.currentUser.role);
  //   const isPending = this.activeConversation.status === ConversationStatus.Pending;
  //   const noPreviousMessages = this.messages.length === 1 && this.messages[0].senderId.startsWith('buyer');
  
  //   return isReceiverSellerOrAgent && isPending && noPreviousMessages;
  // }
  // acceptConversation() {
  //   this.activeConversation.status = ConversationStatus.Active;
  //   // Add system message
  //   this.messages.push({
  //     text: 'Conversation accepted',
  //     sent: false,
  //     time: new Date(),
  //     status: MessageStatus.Read,
  //     senderId: 'system',
  //     conversationId: this.activeConversation.id
  //   });
  // }

  // rejectConversation() {
  //   this.activeConversation.status = ConversationStatus.Closed;
  //   // Add system message
  //   this.messages.push({
  //     text: 'Conversation rejected',
  //     sent: false,
  //     time: new Date(),
  //     status: MessageStatus.Rejected,
  //     senderId: 'system',
  //     conversationId: this.activeConversation.id
  //   });
  // }
  // sendMessage() {
  //   const currentChat = this.selectedChat;
  //   if (!currentChat || !this.newMessage.trim()) return;
  
  //   // Create DTO
  //   const dto: CreateMessageDto = {
  //     conversationId: currentChat.id,
  //     content: this.newMessage.trim()
  //   };
  
  //   // Create optimistic message
  //   const optimisticMessage: Message = {
  //     text: dto.content,
  //     sent: true, // Assume message is from current user
  //     time: new Date(),
  //     status: currentChat.status === ConversationStatus.Pending 
  //              ? MessageStatus.Pending 
  //              : MessageStatus.Sent,
  //     senderId: this.currentUserId!
  //   };
  
  //   // Add to UI immediately and sort
  //   currentChat.messages.push(optimisticMessage);
  //   currentChat.messages.sort((a, b) => a.time.getTime() - b.time.getTime());
  //   currentChat.lastMessageTime = new Date();
  //   this.newMessage = '';
  //   this.scrollToBottom(true);
  
  //   // Send to API
  //   this.messageService.createMessage(dto).subscribe({
  //     next: (response) => {
  //       // Replace optimistic message with actual response
  //       const index = currentChat.messages.findIndex(m => 
  //         m.time === optimisticMessage.time && 
  //         m.text === optimisticMessage.text
  //       );
        
  //       if (index > -1) {
  //         const actualMessage = this.mapResponseToMessage(response);
  //         currentChat.messages[index] = actualMessage;
  //         // Re-sort with actual server timestamp
  //         currentChat.messages.sort((a, b) => b.time.getTime() - a.time.getTime());
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Message send failed:', error);
  //       // Remove optimistic message on error
  //       const index = currentChat.messages.findIndex(m => 
  //         m.time === optimisticMessage.time && 
  //         m.text === optimisticMessage.text
  //       );
  //       if (index > -1) {
  //         currentChat.messages.splice(index, 1);
  //         // Re-sort after removal
  //         currentChat.messages.sort((a, b) => b.time.getTime() - a.time.getTime());
  //       }
  //       this.scrollToBottom();
  //     }
  //   });
  // }

  sendMessage() {
    const currentChat = this.selectedChat;
    if (!currentChat || !this.newMessage.trim()) return;
  
    // Create DTO
    const dto: CreateMessageDto = {
      conversationId: currentChat.id,
      content: this.newMessage.trim()
    };
  
    // Create optimistic message
    const optimisticMessage: Message = {
      text: dto.content,
      sent: true,
      time: new Date(),
      status: currentChat.status === ConversationStatus.Pending 
               ? MessageStatus.Pending 
               : MessageStatus.Sent,
      senderId: this.currentUserId!
    };
  
    // Add to UI immediately (no sorting here)
    currentChat.messages = [...currentChat.messages, optimisticMessage]; // Add to end
    currentChat.lastMessageTime = new Date();
    this.newMessage = '';
    this.scrollToBottom(true);
  
    // Send to API
    this.messageService.createMessage(dto).subscribe({
      next: (response) => {
        // Replace optimistic message with actual response
        currentChat.messages = currentChat.messages.map(m => 
          m === optimisticMessage ? this.mapResponseToMessage(response) : m
        );
      },
      error: (error) => {
        // Remove optimistic message on error
        currentChat.messages = currentChat.messages.filter(m => m !== optimisticMessage);
        this.scrollToBottom();
      }
    });
  }
=======
>>>>>>> Stashed changes

  
  private mapResponseToMessage(response: MessageResponseDto): Message {
    return {
      text: response.content,
      sent: response.senderId === this.currentUserId,
      time: new Date(response.sentAt),
      status: response.status,
      senderId: response.senderId
    };
  }
}