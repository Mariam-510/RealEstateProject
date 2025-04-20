import { Routes } from '@angular/router';
import { PropertiesPageComponent } from './components/realEstateComponent/properties-page/properties-page.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { TestttComponent } from './testtt/testtt.component';
import { Testtt2Component } from './testtt2/testtt2.component';
import { ProductDetailsComponent } from './components/productComponent/product-details/product-details.component';
import { AboutComponent } from './about/about.component';
import { GoogleAndPaypalComponent } from './google-and-paypal/google-and-paypal.component';

export const routes: Routes = [

  { path: "about", component: AboutComponent, title: "About" },

  // { path: '', redirectTo: 'properties', pathMatch: "full" },
  { path: 'properties', component: PropertiesPageComponent, title: "Real Estate Properties" },

  { path: 'products/:id', component: ProductDetailsComponent, title: "Product Details" },

  { path: "home", component: GoogleAndPaypalComponent, title: "gopl" },

  { path: "t", component: TestttComponent, title: "t" },
  { path: "t2", component: Testtt2Component, title: "t2" },

  { path: "**", component: NotFoundComponent }

];
