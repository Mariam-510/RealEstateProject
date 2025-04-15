import { Routes } from '@angular/router';
import { CategoryComponent } from './Components/category/category.component';
import { CartComponent } from './Components/cart/cart.component';

export const routes: Routes = [
  {
    path: 'products/category/:id',
    component: CategoryComponent,
    pathMatch: 'full',
  },
  { path: 'cart', component: CartComponent, pathMatch: 'full' },
];
