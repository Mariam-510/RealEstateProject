import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'product-details-app-chatbot',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-details-chatbot.component.html',
  styleUrl: './product-details-chatbot.component.css',
})
export class productDetailsChatbotComponent {
  @Input() productId!: number;
  messages: { sender: 'user' | 'bot'; text: string }[] = [];
  userInput = '';

  constructor(private http: HttpClient) {
    console.log('productDetailsChatbotComponent initialized');
  }

  async sendMessage() {
    const message = this.userInput.trim();
    if (!message) return;

    this.messages.push({ sender: 'user', text: message });
    this.userInput = '';

    const response = await this.http
      .post<any>('/api/Chatbot', {
        message,
        productId: this.productId,
      })
      .toPromise();

    this.messages.push({ sender: 'bot', text: response.reply });
  }
}
