import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { TestttComponent } from './testtt/testtt.component';
import { Testtt2Component } from './testtt2/testtt2.component';
import { GoogleAndPaypalComponent } from './google-and-paypal/google-and-paypal.component';
import { PropertiesPageComponent } from './components/realEstateComponent/properties-page/properties-page.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { TestttComponent } from './testtt/testtt.component';
import { Testtt2Component } from './testtt2/testtt2.component';
import { ProductDetailsComponent } from './components/productComponent/product-details/product-details.component';
import { AboutComponent } from './about/about.component';
import { GoogleAndPaypalComponent } from './google-and-paypal/google-and-paypal.component';
import { CategoryComponent } from './Components/category/category.component';
import { PHomeComponent } from './Components/Product Home/p-home/p-home.component';
import { PropertyHomeComponent } from './Components/Property/Home/property-home/property-home.component';
import { AboutComponent } from './Components/about/about.component';
import { CatSliderComponent } from './Components/Product Home/Sliders/cat-slider/cat-slider.component';
import { PropertyDetailsComponent } from './Components/RealEstateComponent/property-details/property-details.component';
import { TestComponent } from './Components/RealEstateComponent/test/test.component';
import { TestdetailsComponent } from './Components/RealEstateComponent/testdetails/testdetails.component';
import { AuctionHomeComponent } from './Components/Auction/auction-home/auction-home.component';
import { DigitComponent } from './Components/Auction/digit/digit.component';
import { CategoryComponent } from './Components/category/category.component';
import { CartComponent } from './Components/cart/cart.component';
import { AddressSelectionComponent } from './Components/address-selection/address-selection.component';
import { NewAddressComponent } from './Components/new-address/new-address.component';
import { PaymentComponent } from './Components/payment/payment.component';
import { OrderConfirmationComponent } from './Components/order-confirmation/order-confirmation.component';
import { AddPropertyComponent } from './Components/add-property/add-property.component';
import { AddAuctionComponent } from './Components/add-auction/add-auction.component';
import { PropertiesPageComponent } from './components/realEstateComponent/properties-page/properties-page.component';
import { ProductDetailsComponent } from './Components/productComponent/product-details/product-details.component';
<<<<<<< Updated upstream
export const routes: Routes = [
    { path: 'products/category/:id', component: CategoryComponent },
    { path: 'homePage', component: AboutComponent},
    { path: 'home/products', component: PHomeComponent},
    { path: 'home/properties', component: PropertyHomeComponent},
    { path: 'home/auctions', component: CatSliderComponent},
    { path: 'property/:id', component: PropertyDetailsComponent },
    { path: 'test/:id', component: TestComponent },
    { path: 'T/:id', component: TestdetailsComponent },
    {path:'Auction',component:AuctionHomeComponent},
    {path:'digit',component:DigitComponent},
  { path: '', component: AddAuctionComponent, pathMatch: 'full' },
  {
    path: 'products/category/:id',
    component: CategoryComponent,
    pathMatch: 'full',
  },
=======
import { CatSliderComponent } from './Components/Product Home/Sliders/cat-slider/cat-slider.component';
import { ChatmodalComponent } from './Components/Chat/chatmodal/chatmodal.component';
import { MainChatComponent } from './Components/Chat/main-chat/main-chat.component';

export const routes: Routes = [
  {path:'chat',component:ChatmodalComponent},

  {path:'MainChat', component:MainChatComponent},
  
  { path: 'products/category/:id', component: CategoryComponent },

  { path: 'homePage', component: AboutComponent },

  { path: 'home/products', component: PHomeComponent },

  { path: 'home/properties', component: PropertyHomeComponent },

  { path: 'home/auctions', component: CatSliderComponent },

  { path: 'property/:id', component: PropertyDetailsComponent },

  { path: 'realeastate/auctions', component: AuctionHomeComponent },

  { path: 'addAuction', component: AddAuctionComponent, pathMatch: 'full' },

  { path: 'products/category/:id', component: CategoryComponent, pathMatch: 'full' },

>>>>>>> Stashed changes
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
  
  { path: "about", component: AboutComponent, title: "About" },

  // { path: '', redirectTo: 'properties', pathMatch: "full" },
  { path: 'properties', component: PropertiesPageComponent, title: "Real Estate Properties" },

  { path: 'products/:id', component: ProductDetailsComponent, title: "Product Details" },

  { path: "home", component: GoogleAndPaypalComponent, title: "gopl" },

  { path: "t", component: TestttComponent, title: "t" },
  { path: "t2", component: Testtt2Component, title: "t2" },

  { path: "**", component: NotFoundComponent }
];
