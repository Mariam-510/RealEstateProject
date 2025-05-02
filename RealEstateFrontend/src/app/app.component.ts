import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './Components/HeaderAndFooter/header/header.component';
import { FooterComponent } from './Components/HeaderAndFooter/footer/footer.component';
import { ChatbotComponent } from "./Components/Chat/chatbot/chatbot.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ChatbotComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'RealEstateFront';
}
