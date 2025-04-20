import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { GoogleAndPaypalComponent } from './google-and-paypal/google-and-paypal.component';
import { AboutComponent } from './about/about.component';
import { CategoryComponent } from './Components/category/category.component';
import { PHomeComponent } from './Components/Product Home/p-home/p-home.component';
import { PropertyHomeComponent } from './Components/Property/Home/property-home/property-home.component';
import { PropertyDetailsComponent } from './Components/RealEstateComponent/property-details/property-details.component';
import { AuctionHomeComponent } from './Components/Auction/auction-home/auction-home.component';
import { CartComponent } from './Components/cart/cart.component';
import { AddressSelectionComponent } from './Components/Forms/address-selection/address-selection.component';
import { NewAddressComponent } from './Components/new-address/new-address.component';
import { PaymentComponent } from './Components/payment/payment.component';
import { OrderConfirmationComponent } from './Components/order-confirmation/order-confirmation.component';
import { PropertiesPageComponent } from './Components/RealEstateComponent/properties-page/properties-page.component';
import { ProductDetailsComponent } from './Components/productComponent/product-details/product-details.component';
import { CatSliderComponent } from './Components/Product Home/Sliders/cat-slider/cat-slider.component';
import { AddProductComponent } from './Components/add-product/add-product.component';
import { AddAuctionComponent } from './Components/Forms/add-auction/add-auction.component';

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

  { path: 'addProduct', component: AddProductComponent, pathMatch: 'full' },
  {
    path: 'products/category/:id',
    component: CategoryComponent,
    pathMatch: 'full',
  },
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
