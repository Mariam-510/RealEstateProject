import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
<<<<<<< Updated upstream

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
=======
import { CategoryComponent } from './Components/category/category.component';
import { AboutComponent } from "./Components/about/about.component";
import { PHomeComponent } from "./Components/Product Home/p-home/p-home.component";
import { PropertyHomeComponent } from "./Components/Property/Home/property-home/property-home.component";
import { HeaderComponent } from "./Components/header/header.component";
import { FooterComponent } from "./Components/footer/footer.component";
import { ProductListItemComponent } from "./Components/product-list-item/product-list-item.component";
import { ProductCardComponent } from "./Components/product-card/product-card.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CategoryComponent, AboutComponent, PHomeComponent, PropertyHomeComponent, HeaderComponent, FooterComponent, ProductListItemComponent, ProductCardComponent],
>>>>>>> Stashed changes
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'RealEstateFront';
}
