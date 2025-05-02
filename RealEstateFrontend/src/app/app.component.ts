import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './Components/HeaderAndFooter/header/header.component';
import { FooterComponent } from './Components/HeaderAndFooter/footer/footer.component';
import { ChatbotComponent } from "./Components/Chat/chatbot/chatbot.component";
import { productDetailsChatbotComponent } from "./Components/Chat/product-details-chatbot/product-details-chatbot.component";
import { AuthService } from './Services/ApiServices/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ChatbotComponent, productDetailsChatbotComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'RealEstateFront';
  constructor(private auth: AuthService, private router: Router) { }
  


  hasRole(requiredRole: string) {
    return this.auth.hasRole(requiredRole);
  }

  hasRoleOrNoUser(requiredRole: string) {
    return !this.auth.isAuthenticated() || this.auth.hasRole(requiredRole);
  }

  hasUser() {
    return this.auth.isAuthenticated();
  }

  isNotLogin(): boolean {
    const currentUrl = this.router.url;
    return [
      '/login',
      '/register',
      '/registerAgent',
      '/forgetpassword',
      '/sendcode',
      '/newpassword',
      '/emailnotconfirmed',
      '/forgetpassword/sendcode',
     
    ].some(path => currentUrl.includes(path));
  }

}

