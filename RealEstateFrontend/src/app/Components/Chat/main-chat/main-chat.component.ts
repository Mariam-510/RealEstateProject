import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AfterViewChecked, ElementRef, ViewChild,AfterViewInit } from '@angular/core';
import { ConversationResponseDto, ConversationService } from '../../../Services/ApiServices/conversation.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { AccountService } from '../../../Services/ApiServices/account.service';
import { API_CONFIG } from '../../../app.config';
import { CreateMessageDto, MessageResponseDto, MessageService } from '../../../Services/ApiServices/message.service';

enum MessageStatus {
  Pending = 'Pending',
  Sent = 'Sent',
  Rejected = 'Rejected',
  Delivered = 'Delivered',
  Read = 'Read',
}

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
export class MainChatComponent  implements OnInit, AfterViewChecked ,AfterViewInit{
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  currentUserId: string | undefined;
  apiConfig = API_CONFIG;

  constructor(private conversationService: ConversationService, private auth: AuthService,
      private account: AccountService, private messageService: MessageService) {}

  ngOnInit() {
    this.currentUserId = this.auth.getCurrentUser()?.accountId;
    this.loadConversations();
    // this.loadUserDetailsForConversations();
    console.log(this.conversations);
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

private mapMessageDto(dto: MessageResponseDto): Message {
  return {
    text: dto.content,
    sent: dto.senderId === this.currentUserId,
    time: new Date(dto.sentAt),
    status: dto.status as MessageStatus,
    senderId: dto.senderId
  };
}


  private mapDtoToChat(dto: ConversationResponseDto): Chat {
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
    };

    // Fetch user details asynchronously
    this.account.getUserInfo(otherAccountId).subscribe({
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
    });

    return chat;
}

  // private loadUserDetailsForConversations() {
  //   this.conversations.forEach(conv => {
  //     this.userService.getUserDetails(conv.otherUser.id).subscribe({
  //       next: (user) => {
  //         conv.otherUser.name = user.name;
  //         conv.otherUser.avatar = user.avatar;
  //       }
  //     });
  //   });
  // }

  private shouldScroll = true;
  conversations: any[] = [];

  ngAfterViewInit() {
    this.scrollToBottom(true); // Force initial scroll
  }

  ngAfterViewChecked() {
    this.checkScrollPosition();
  }

  private checkScrollPosition() {
    const element = this.messagesContainer?.nativeElement;
    if (element) {
      const isAtBottom = element.scrollHeight - element.clientHeight <= element.scrollTop + 50; // Increased threshold
      this.shouldScroll = isAtBottom;
    }
  }
  private scrollToBottom(force = false) {
    try {
      if (this.messagesContainer?.nativeElement && this.selectedChat) {
        const element = this.messagesContainer.nativeElement;
        if (force || this.shouldScroll) {
          setTimeout(() => {
            // Immediate scroll without animation
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

  toggle() {
    this.isChatVisible = !this.isChatVisible;
  }

  getStatusClass(status: MessageStatus): string {
    switch(status) {
      case MessageStatus.Read: return 'status-read';
      case MessageStatus.Delivered: return 'status-delivered';
      case MessageStatus.Pending: return 'status-pending';
      default: return '';
    }
  }
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