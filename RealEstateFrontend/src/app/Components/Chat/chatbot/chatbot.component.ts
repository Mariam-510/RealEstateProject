import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../app.config';
import { marked } from 'marked';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent implements AfterViewChecked, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';
  isLoading = false;
  errorMessage = '';
  isChatOpen = false;
  private lastMessageCount = 0;
  private userScrolledUp = false;
  private scrollObserver: MutationObserver | null = null;
  userType: 'buyer' | 'agent' | 'seller' | 'unknown' = 'unknown';
  userName: string = 'Guest';

  constructor(private http: HttpClient) {}

  ngAfterViewChecked() {
    this.checkForNewMessages();
  }

  ngOnDestroy() {
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }
  }

  private getSystemPrompt(): string {
    switch(this.userType) {
      case 'buyer':
        return `You are a helpful real estate assistant specialized in helping property buyers. 
                Focus on property listings, viewing appointments, purchase process, auctions, 
                and home furnishings. Be friendly and professional.`;
      case 'seller':
        return `You are a real estate expert assisting property sellers. Help with pricing advice, 
                listing preparation, staging tips, and the selling process. Be knowledgeable 
                about market trends.`;
      case 'agent':
        return `You are a professional real estate assistant for agents. Provide support with 
                client management, property showings, contract details, and market analysis. 
                Use professional terminology.`;
      default:
        return `You are a helpful real estate assistant. Ask clarifying questions to determine 
                if the user is a buyer, seller, or agent before providing detailed advice.`;
    }
  }

  private detectUserType(message: string) {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('buy') || lowerMsg.includes('bid') || lowerMsg.includes('viewing')) {
      this.userType = 'buyer';
    } else if (lowerMsg.includes('sell') || lowerMsg.includes('list') || lowerMsg.includes('price')) {
      this.userType = 'seller';
    } else if (lowerMsg.includes('agent') || lowerMsg.includes('client') || lowerMsg.includes('showing')) {
      this.userType = 'agent';
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }








  private checkForNewMessages() {
    if (this.messages.length !== this.lastMessageCount) {
      // Only scroll if user hasn't manually scrolled up
      if (!this.userScrolledUp) {
        this.delayedScrollToBottom();
      }
      this.lastMessageCount = this.messages.length;
    }
  }

  private delayedScrollToBottom() {
    setTimeout(() => {
      try {
        const container = this.messagesContainer?.nativeElement;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      } catch (err) {
        console.error('Scroll error:', err);
      }
    }, 50);
  }

  onMessagesScroll() {
    const container = this.messagesContainer?.nativeElement;
    if (container) {
      // Check if user has scrolled up (not at bottom)
      const threshold = 100; // pixels from bottom
      this.userScrolledUp = 
        container.scrollTop + container.clientHeight < 
        container.scrollHeight - threshold;
    }
  }

  // Rest of your existing methods (sendMessage, addMessage) remain the same
  async sendMessage(event?: Event | KeyboardEvent) {
    event?.preventDefault();
    if (!this.newMessage.trim() || this.isLoading) return;

    try {
      this.isLoading = true;
      this.errorMessage = '';
      const userMessage = this.newMessage;
      await this.addMessage(userMessage, 'user');
      this.newMessage = '';

      const loadingMessage: ChatMessage = {
        content: '<i>Typing...</i>',
        timestamp: new Date(),
        role: 'bot',
        loading: true,
      };
      this.messages.push(loadingMessage);

      const response = await this.http
        .post<any>(environment.openaiUrl, {
          model: 'gpt-4',
          // model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: this.getSystemPrompt() },
            ...this.messages
              .filter(msg => !msg.loading)
              .map(msg => ({
                role: msg.role,
                content: msg.role === 'bot' ? this.stripHtml(msg.content) : msg.content
              }))
          ],
          temperature: 0.7,
        })
        .toPromise();

      const parsedContent = await marked.parse(
        response.choices[0].message.content
      );

      Object.assign(loadingMessage, {
        content: parsedContent,
        timestamp: new Date(),
        loading: false,
      });
      
      // Reset scroll position tracking after new bot message
      this.userScrolledUp = false;
    } catch (error) {
      this.errorMessage = 'Error communicating with the AI assistant';
      console.error('API Error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async addMessage(content: string, role: 'user' | 'bot') {
    const parsedContent = await marked.parse(content);
    this.messages.push({
      content: parsedContent,
      timestamp: new Date(),
      role,
      loading: role === 'bot',
    });
  }

  onEnter(event: Event) {
    
    if ((event as KeyboardEvent).shiftKey) {
      // Let Shift+Enter create a newline
      return;
    }
  
    event.preventDefault(); // Prevent newline
    this.sendMessage(event); // Call your send logic
  }

  


}

interface ChatMessage {
  content: string;
  timestamp: Date;
  role: 'user' | 'bot';
  loading?: boolean;
}