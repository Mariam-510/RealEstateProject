import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
<<<<<<< Updated upstream
import { CategoryComponent } from './Components/category/category.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CategoryComponent],
=======
import { HeaderComponent } from './Components/header/header.component';
import { FooterComponent } from './Components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,HeaderComponent,FooterComponent],
>>>>>>> Stashed changes
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'RealEstateFront';
}
