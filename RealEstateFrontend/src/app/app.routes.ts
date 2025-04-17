import { Routes } from '@angular/router';
import { CategoryComponent } from './Components/category/category.component';
import { CartComponent } from './Components/cart/cart.component';
import { AddressSelectionComponent } from './Components/address-selection/address-selection.component';
import { NewAddressComponent } from './Components/new-address/new-address.component';
import { PaymentComponent } from './Components/payment/payment.component';
import { OrderConfirmationComponent } from './Components/order-confirmation/order-confirmation.component';

export const routes: Routes = [
  { path: '', component: CategoryComponent, pathMatch: 'full' },
  {
    path: 'products/category/:id',
    component: CategoryComponent,
    pathMatch: 'full',
  },
  { path: 'cart', component: CartComponent, pathMatch: 'full' },
  {
    path: 'addressSelection',
    component: AddressSelectionComponent,
    pathMatch: 'full',
  },
  {
    path: 'checkout',
    children: [
      { path: 'cart', component: CartComponent },
      { path: 'address', component: AddressSelectionComponent },
      { path: 'address/new', component: NewAddressComponent },
      { path: 'payment', component: PaymentComponent },
      { path: 'confirmation', component: OrderConfirmationComponent },
      { path: '', redirectTo: 'cart', pathMatch: 'full' },
    ],
  },
];
