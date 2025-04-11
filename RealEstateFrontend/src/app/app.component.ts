import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CategoryComponent } from "./Components/category/category.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CategoryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'RealEstateFront';
}
