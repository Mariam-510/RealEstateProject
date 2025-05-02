import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
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
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  messages: ChatMessage[] = [];
  newMessage = '';
  isLoading = false;
  errorMessage = '';
  disabled = false;

  constructor(private http: HttpClient) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  async sendMessage(event?: Event) {
    event?.preventDefault();
    if (!this.newMessage.trim() || this.isLoading) return;
  
    try {
      this.isLoading = true;
      this.errorMessage = '';
      const userMessage = this.newMessage;
      await this.addMessage(userMessage, 'user');
      this.newMessage = '';
  
      // Add a temporary loading message
      const loadingMessage: ChatMessage = {
        content: '<i>Typing...</i>',
        timestamp: new Date(),
        role: 'bot',
        loading: true
      };
      this.messages.push(loadingMessage);
  
      const response = await this.http.post<any>(environment.openaiUrl, {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: userMessage }]
      }).toPromise();
  
      const parsedContent = await marked.parse(response.choices[0].message.content);
  
      // Replace the loading message with actual content
      Object.assign(loadingMessage, {
        content: parsedContent,
        timestamp: new Date(),
        loading: false
      });
  
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
      loading: role === 'bot'
    });
  }
  

  private scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop = 
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  


}

interface ChatMessage {
  content: string;
  timestamp: Date;
  role: 'user' | 'bot';
  loading?: boolean;
}