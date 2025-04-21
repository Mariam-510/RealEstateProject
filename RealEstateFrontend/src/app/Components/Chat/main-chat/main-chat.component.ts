import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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


@Component({
  selector: 'app-main-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.css'
})
export class MainChatComponent {
  selectedChat: any = null;
  
  // Sample chats data
  chats = [
    {
      id: 1,
      status: ConversationStatus.Active,
      otherUser: {
        id: '123',
        name: 'John Buyer',
        avatar: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-8.webp'
      },
      lastMessage: {
        text: "Hello, I'm interested in this property...",
        sent: true,
        time: new Date(Date.now() - 3600000), // 1 hour ago
        status: MessageStatus.Read,
      },
      unread: 0,
      lastMessageTime: new Date(Date.now() - 3600000)
    },
    {
      id: 2,
      status: ConversationStatus.Pending,
      otherUser: {
        id: '124',
        name: 'Alice Smith',
        avatar: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-1.webp'
      },
      lastMessage: {
        text: "When can we schedule a viewing?",
        sent: false,
        time: new Date(Date.now() - 7200000), // 2 hours ago
        status: MessageStatus.Delivered,
      },
      unread: 2,
      lastMessageTime: new Date(Date.now() - 7200000)
    },
    // Add more chats...
  ];
  selectChat(chat: any) {
    this.selectedChat = chat;
    // Mark as read when selected
    chat.unread = 0;
  }

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
  messages = [
    {
      text: "Hello, I'm interested in this property...",
    sent: true,
    time: new Date(),
    status: MessageStatus.Read,
    senderId: 'buyer-123',  // ✅ Starts with 'buyer'
    conversationId: 1
    }
  ];

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
    if (!this.selectedChat || !this.newMessage.trim()) return;

    if (!this.newMessage.trim()) return;
  
    if (this.currentUser.role === UserRole.Buyer && 
        this.activeConversation.status === ConversationStatus.Pending) {
      this.activeConversation.status = ConversationStatus.Pending;
    }
  
    if ([UserRole.Seller, UserRole.Agent].includes(this.currentUser.role)) {
      if (this.activeConversation.status !== ConversationStatus.Active) return;
    }
  
    this.messages.push({
      text: this.newMessage,
      sent: this.currentUser.role === UserRole.Buyer,
      time: new Date(),
      status: MessageStatus.Sent,
      senderId: this.currentUser.id,
      conversationId: this.activeConversation.id
    });
  
    this.newMessage = '';
  
    // Simulate delivery
    setTimeout(() => {
      const sentMessage = this.messages.find(m => m.status === MessageStatus.Sent);
      if (sentMessage) sentMessage.status = MessageStatus.Delivered;
    }, 1500);
  
    // Simulate reply
    setTimeout(() => {
      this.messages.push({
        text: 'Thanks for your message! I will get back to you shortly.',
        sent: false,
        time: new Date(),
        status: MessageStatus.Read,
        senderId: this.activeConversation.otherUser.id,
        conversationId: this.activeConversation.id
      });
    }, 3000);
  }
  
}