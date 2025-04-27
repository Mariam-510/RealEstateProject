import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, } from '@angular/forms';
import { AfterViewChecked, ElementRef, ViewChild,AfterViewInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';


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
export class ChatmodalComponent implements AfterViewChecked ,AfterViewInit {
  isChatVisible = false;
  newMessage = '';
  today = new Date();
  private shouldScroll = true;
  private justOpened = false; // Flag to track initial open

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

// Add to component constructor
constructor(private cd: ChangeDetectorRef) {}

// Modified toggle method
toggle() {
  this.isChatVisible = !this.isChatVisible;
  if (this.isChatVisible) {
    this.justOpened = true;
    this.cd.detectChanges(); // Force immediate update
    setTimeout(() => this.scrollToBottom(true), 0); // Ensure DOM is ready
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
      if (this.messagesContainer?.nativeElement) {
        const element = this.messagesContainer.nativeElement;
        if (force || this.shouldScroll) {
          // Use both methods for maximum compatibility
          element.scrollTop = element.scrollHeight;
          element.scrollTo({
            top: element.scrollHeight,
            behavior: force ? 'auto' : 'smooth'
          });
        }
      }
    } catch (err) {
      console.error(err);
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
    if (this.newMessage.trim()) {
      this.messages.push({
        text: this.newMessage,
        sent: true,
        time: new Date(),
        status: MessageStatus.Sent,
        profileImg: "" // Add profile image if needed
      });
      this.newMessage = '';

      // Force immediate scroll
      setTimeout(() => this.scrollToBottom(true), 0);

      // Simulate delivery
      setTimeout(() => {
        const sentMessage = this.messages.find(m => m.status === MessageStatus.Sent);
        if (sentMessage) sentMessage.status = MessageStatus.Delivered;
        this.scrollToBottom();
      }, 1500);

      // Simulate response
      setTimeout(() => {
        this.messages.push({
          text: 'Great question! Let me check that for you...',
          sent: false,
          time: new Date(),
          status: MessageStatus.Read,
          profileImg: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D" // Add profile image
        });
        setTimeout(() => this.scrollToBottom(true), 0);
      }, 2000);
    }
  }

}