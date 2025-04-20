import { Routes } from '@angular/router';
<<<<<<< Updated upstream

export const routes: Routes = [];
=======
import { CategoryComponent } from './Components/category/category.component';
import { PHomeComponent } from './Components/Product Home/p-home/p-home.component';
import { PropertyHomeComponent } from './Components/Property/Home/property-home/property-home.component';
import { AboutComponent } from './Components/about/about.component';
import { CatSliderComponent } from './Components/Product Home/Sliders/cat-slider/cat-slider.component';

export const routes: Routes = [
    { path: 'products/category/:id', component: CategoryComponent },
    { path: 'homePage', component: AboutComponent},
    { path: 'home/products', component: PHomeComponent},
    { path: 'home/properties', component: PropertyHomeComponent},
    { path: 'home/auctions', component: CatSliderComponent},
];
>>>>>>> Stashed changes
