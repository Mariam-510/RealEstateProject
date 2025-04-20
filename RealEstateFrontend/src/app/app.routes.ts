import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { GoogleAndPaypalComponent } from './google-and-paypal/google-and-paypal.component';
import { AboutComponent } from './about/about.component';
import { CategoryComponent } from './components/category/category.component';
import { PHomeComponent } from './components/Product Home/p-home/p-home.component';
import { PropertyHomeComponent } from './components/Property/Home/property-home/property-home.component';
import { PropertyDetailsComponent } from './components/realEstateComponent/property-details/property-details.component';
import { AuctionHomeComponent } from './components/Auction/auction-home/auction-home.component';
import { AddAuctionComponent } from './components/Forms/add-auction/add-auction.component';
import { CartComponent } from './components/cart/cart.component';
import { AddressSelectionComponent } from './components/Forms/address-selection/address-selection.component';
import { NewAddressComponent } from './components/new-address/new-address.component';
import { PaymentComponent } from './components/payment/payment.component';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';
import { PropertiesPageComponent } from './components/realEstateComponent/properties-page/properties-page.component';
import { ProductDetailsComponent } from './components/productComponent/product-details/product-details.component';
import { CatSliderComponent } from './components/Product Home/Sliders/cat-slider/cat-slider.component';

export const routes: Routes = [
  { path: 'products/category/:id', component: CategoryComponent },

  { path: 'homePage', component: AboutComponent },

  { path: 'home/products', component: PHomeComponent },

  { path: 'home/properties', component: PropertyHomeComponent },

  { path: 'home/auctions', component: CatSliderComponent },

  { path: 'property/:id', component: PropertyDetailsComponent },

  { path: 'realeastate/auctions', component: AuctionHomeComponent },

  { path: 'addAuction', component: AddAuctionComponent, pathMatch: 'full' },

  { path: 'products/category/:id', component: CategoryComponent, pathMatch: 'full' },

  { path: 'cart', component: CartComponent, pathMatch: 'full' },

  { path: 'addressSelection', component: AddressSelectionComponent, pathMatch: 'full', },

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

  { path: "about", component: AboutComponent, title: "About" },

  { path: 'properties', component: PropertiesPageComponent, title: "Real Estate Properties" },

  { path: 'products/:id', component: ProductDetailsComponent, title: "Product Details" },

  { path: "home", component: GoogleAndPaypalComponent, title: "gopl" },

  { path: "**", component: NotFoundComponent }
];
