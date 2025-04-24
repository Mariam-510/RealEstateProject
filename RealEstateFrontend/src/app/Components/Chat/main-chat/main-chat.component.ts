import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AfterViewChecked, ElementRef, ViewChild,AfterViewInit } from '@angular/core';

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
  senderId: string;
}

interface Chat {
  id: number;
  status: ConversationStatus;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
  };
  messages: Message[];
  unread: number;
  lastMessageTime: Date;
}

@Component({
  selector: 'app-main-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.css'
})
export class MainChatComponent  implements AfterViewChecked ,AfterViewInit{
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
 

  private shouldScroll = true;

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



selectChat(chat: Chat) {
  this.selectedChat = chat;
  this.newMessage = '';
  chat.unread = 0;
  
  // Force immediate scroll without animation
  setTimeout(() => {
    const element = this.messagesContainer?.nativeElement;
    if (element) {
      element.style.scrollBehavior = 'auto'; // Disable smooth scrolling
      element.scrollTop = element.scrollHeight;
      element.style.scrollBehavior = ''; // Reset to default
    }
  }, 0); // Zero delay after change detection
}
  selectedChat: Chat | null = null;
  chats: Chat[] = [
    {
      id: 1,
      status: ConversationStatus.Active,
      otherUser: {
        id: '123',
        name: 'John Buyer',
        avatar: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-8.webp'
      },
      messages: [
        {
          text: "Hello, I'm interested in this property...",
          sent: true,
          time: new Date(Date.now() - 3600000),
          status: MessageStatus.Read,
          senderId: '456'
        }
      ],
      unread: 0,
      lastMessageTime: new Date(Date.now() - 3600000)
    },
    {
      id: 2,
      status: ConversationStatus.Active,
      otherUser: {
        id: '200',
        name: 'Ahmed Buyer',
        avatar: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-8.webp'
      },
      messages: [
        {
          text: "Alooooooooooooooooooooooooooooooooooooooooooo",
          sent: true,
          time: new Date(Date.now() - 3600000),
          status: MessageStatus.Sent,
          senderId: '456'
        }
      ],
      unread: 0,
      lastMessageTime: new Date(Date.now() - 3600000)
    },
  ];
  

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
  sendMessage() {
    const currentChat = this.selectedChat;
    if (!currentChat || !this.newMessage.trim()) return;

    const newMsg: Message = {
      text: this.newMessage,
      sent: this.currentUser.role === UserRole.Buyer,
      time: new Date(),
      status: MessageStatus.Sent,
      senderId: this.currentUser.id,
    };

    currentChat.messages.push(newMsg);
    currentChat.lastMessageTime = new Date();
    this.newMessage = '';
    this.scrollToBottom(true);

    // Simulate delivery and reply
    setTimeout(() => {
      newMsg.status = MessageStatus.Delivered;
      this.scrollToBottom();
    }, 1500);

    setTimeout(() => {
      const replyMsg: Message = {
  text: 'Thanks for your message! I will get back to you shortly.',
  sent: false,
  time: new Date(),
  status: MessageStatus.Delivered, // not Read
  senderId: currentChat.otherUser.id,
};

      currentChat.messages.push(replyMsg);
      if(currentChat!=this.selectedChat)
      currentChat.unread=1;
      currentChat.lastMessageTime = new Date();
      this.scrollToBottom();
    }, 3000);
  }
}