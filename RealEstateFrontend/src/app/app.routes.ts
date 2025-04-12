import { Routes } from '@angular/router';
import { CategoryComponent } from './Components/category/category.component';

export const routes: Routes = [
    { path: 'products/category/:id', component: CategoryComponent }
];
