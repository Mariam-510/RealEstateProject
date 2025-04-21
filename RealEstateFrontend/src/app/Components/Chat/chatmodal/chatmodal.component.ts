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

@Component({
  selector: 'app-chatmodal',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatmodal.component.html',
  styleUrl: './chatmodal.component.css'
})
export class ChatmodalComponent {
  isChatVisible = false;
  newMessage = '';
  today = new Date();

  messages = [
    {
      text: "Hello, this is Lora, a Licensed Advisor with Redfin...",
      sent: false,
      time: new Date(),
      status: MessageStatus.Read,
      profileImg: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D"
    },
    {
      text: "Request showing",
      sent: true,
      time: new Date(),
      status: MessageStatus.Delivered
    },

    {
      text: "Request showing",
      sent: true,
      time: new Date(),
      status: MessageStatus.Pending
    },
   
    {
      text: "Request showing",
      sent: true,
      time: new Date(),
      status: MessageStatus.Rejected
    }
    ,  {
      text: "Request showing",
      sent: true,
      time: new Date(),
      status: MessageStatus.Sent
    },
    {
      // Pending = 'Pending',
      // Sent = 'Sent',
      // Rejected = 'Rejected',
      // Delivered = 'Delivered',
      // Read = 'Read',
      text: "Request showing",
      sent: true,
      time: new Date(),
      status: MessageStatus.Read
    },

  ];

  toggle() {
    this.isChatVisible = !this.isChatVisible;
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

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({ 
        text: this.newMessage, 
        sent: true,
        time: new Date(),
        status: MessageStatus.Sent
      });
      this.newMessage = '';

      // Simulate delivery
      setTimeout(() => {
        const sentMessage = this.messages.find(m => m.status === MessageStatus.Sent);
        if (sentMessage) {
          sentMessage.status = MessageStatus.Delivered;
        }
      }, 1500);

      // Simulate response
      setTimeout(() => {
        this.messages.push({ 
          text: 'Great question! Let me check that for you...',
          profileImg: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D",
          sent: false,
          time: new Date(),
          status: MessageStatus.Read
        });
      }, 2000);
    }
  }
}