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
    return `You are a helpful AI assistant. Answer questions as clearly and concisely as possible.`;
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
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: this.getSystemPrompt() },
            ...this.messages
              .filter((msg) => !msg.loading)
              .map((msg) => ({
                role: msg.role,
                content:
                  msg.role === 'bot'
                    ? this.stripHtml(msg.content)
                    : msg.content,
              })),
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

  autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto'; // Reset height
    textarea.style.height = textarea.scrollHeight + 'px'; // Set to scroll height
  }
}

interface ChatMessage {
  content: string;
  timestamp: Date;
  role: 'user' | 'bot';
  loading?: boolean;
}
