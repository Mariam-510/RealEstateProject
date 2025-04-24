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
import { LoginComponent } from './Components/login/login.component';
import { RegisterComponent } from './Components/register/register.component';
import { ProfileComponent } from './Components/ProfileFolder/profile/profile.component';
import { RegisterAsAgentComponent } from './Components/register-as-agent/register-as-agent.component';
import { ForgetPasswordComponent } from './Components/forget-password/forget-password.component';
import { SendCodeComponent } from './Components/send-code/send-code.component';
import { NewPasswordComponent } from './Components/new-password/new-password.component';
import { SideBarComponent } from './Components/ProfileFolder/side-bar/side-bar.component';
import { AgentProfileComponent } from './Components/AgentProfileFolder/agent-profile/agent-profile.component';
import { AgentSideBarComponent } from './Components/AgentProfileFolder/agent-side-bar/agent-side-bar.component';
import { AdminSideBarComponent } from './Components/AdminProfileFolder/admin-side-bar/admin-side-bar.component';
import { AdminProfileComponent } from './Components/AdminProfileFolder/admin-profile/admin-profile.component';
import { OrderSummaryComponent } from './Components/order-summary/order-summary.component';
import { EmailNotConfirmedComponent } from './Components/email-not-confirmed/email-not-confirmed.component';
import { OrderDetailsComponent } from './Components/order-details/order-details.component';
import { DashboardComponent } from './Components/SellerProfileFolder/dashboard/dashboard.component';
import { SellerProfileComponent } from './Components/SellerProfileFolder/seller-profile/seller-profile.component';
import { SellersidebarComponent } from './Components/SellerProfileFolder/sellersidebar/sellersidebar.component';
import { AgentdashboardComponent } from './Components/AgentProfileFolder/agentdashboard/agentdashboard.component';
import { AdmindashboardComponent } from './Components/AdminProfileFolder/admindashboard/admindashboard.component';
import { ViewAllOrderComponent } from './Components/AdminProfileFolder/view-all-order/view-all-order.component';
import { PropertiesPageComponent } from './Components/RealEstateComponent/properties-page/properties-page.component';
import { ProductDetailsComponent } from './Components/productComponent/product-details/product-details.component';
import { CatSliderComponent } from './Components/Product Home/Sliders/cat-slider/cat-slider.component';
import { AddProductComponent } from './Components/add-product/add-product.component';
import { AddAuctionComponent } from './Components/Forms/add-auction/add-auction.component';
import { PropertiesPageComponent } from './Components/RealEstateComponent/properties-page/properties-page.component';
import { ProductDetailsComponent } from './Components/productComponent/product-details/product-details.component';
import { CatSliderComponent } from './Components/Product Home/Sliders/cat-slider/cat-slider.component';
import { HomePageComponent } from './Components/home-page/home-page.component';
import { HomeTesttttComponent } from './Components/home-testttt/home-testttt.component';
import { CatSliderComponent } from './Components/Product Home/Sliders/cat-slider/cat-slider.component';
import { ChatmodalComponent } from './Components/Chat/chatmodal/chatmodal.component';
import { MainChatComponent } from './Components/Chat/main-chat/main-chat.component';
<<<<<<< Updated upstream
=======
import { AddAuctionComponent } from './Components/FormsSellerAndAgent/add-auction/add-auction.component';
import { OrderConfirmationComponent } from './Components/Order/order-confirmation/order-confirmation.component';
import { LoginComponent } from './Components/Authentication/login/login.component';
import { ProfileComponent } from './Components/Buyer/profile/profile.component';
import { SideBarComponent } from './Components/Buyer/side-bar/side-bar.component';
import { OrderSummaryComponent } from './Components/Order/order-summary/order-summary.component';
import { OrderDetailsComponent } from './Components/Order/order-details/order-details.component';
import { AgentSideBarComponent } from './Components/Agent/agent-side-bar/agent-side-bar.component';
import { AgentProfileComponent } from './Components/Agent/agent-profile/agent-profile.component';
import { AgentdashboardComponent } from './Components/Agent/agentdashboard/agentdashboard.component';
import { AdminSideBarComponent } from './Components/Admin/admin-side-bar/admin-side-bar.component';
import { AdminProfileComponent } from './Components/Admin/admin-profile/admin-profile.component';
import { AdmindashboardComponent } from './Components/Admin/admindashboard/admindashboard.component';
import { ViewAllOrderComponent } from './Components/Admin/view-all-order/view-all-order.component';
import { SellersidebarComponent } from './Components/Seller/sellersidebar/sellersidebar.component';
import { SellerProfileComponent } from './Components/Seller/seller-profile/seller-profile.component';
import { DashboardComponent } from './Components/Seller/dashboard/dashboard.component';
import { PaymentComponent } from './Components/Payments/payment/payment.component';
import { PropertyDetailsComponent } from './Components/Properties/Details/property-details/property-details.component';
import { CategoryComponent } from './Components/Products/ToBeEdited/category/category.component';
import { PHomeComponent } from './Components/Products/Home/p-home/p-home.component';
import { CatSliderComponent } from './Components/Products/Home/Sliders/cat-slider/cat-slider.component';
import { AuctionHomeComponent } from './Components/Auction/Home/auction-home/auction-home.component';
import { ProductDetailsComponent } from './Components/Products/Details/product-details/product-details.component';
import { AboutComponent } from './Components/AboutAndNotFound/about/about.component';
import { NotFoundComponent } from './Components/AboutAndNotFound/not-found/not-found.component';
import { AddressSelectionComponent } from './Components/Address/address-selection/address-selection.component';
import { NewAddressComponent } from './Components/Address/new-address/new-address.component';
import { AddCategoryComponent } from './Components/Admin/add-category/add-category.component';
import { AddProductComponent } from './Components/Admin/add-product/add-product.component';
import { AddPropertyComponent } from './Components/FormsSellerAndAgent/add-property/add-property.component';
import { AuctionDetailsComponent } from './Components/Auction/Details/auction-details/auction-details.component';
import { BookAppointmentComponent } from './Components/Appointment/book-appointment/book-appointment.component';

//----------------------------------------------------------------------------------------

>>>>>>> Stashed changes
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
  {path:'chat',component:ChatmodalComponent},

  {path:'MainChat', component:MainChatComponent},
  
  { path: 'products/category/:id', component: CategoryComponent },

  { path: 'homePage', component: AboutComponent },

  { path: 'home/products', component: PHomeComponent },

  { path: 'home/properties', component: PropertyHomeComponent },

  { path: 'home/auctions', component: CatSliderComponent },
  
  { path: 'products/category/:id', component: CategoryComponent },

  { path: '', component: HomePageComponent },
  { path: 't', component: HomeTesttttComponent },

  { path: 'products', component: PHomeComponent },

  { path: 'properties', component: PropertyHomeComponent },

  { path: 'auctions', component: CatSliderComponent },

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
  { path: 'login', component: LoginComponent, title: "Login" },
  { path: 'register', component: RegisterComponent, title: "Register" },
  { path: 'profile', component: ProfileComponent, title: "Profile" },
  { path: 'registerasagent', component: RegisterAsAgentComponent, title: "Register" },
  { path: 'forgetpassword', component: ForgetPasswordComponent, title: "Forget Password" },
  { path: 'sendcode', component: SendCodeComponent, title: "Send Code" },
  { path: 'newpassword', component: NewPasswordComponent, title: "Change Password" },
  { path: 'emailnotconfirmed', component: EmailNotConfirmedComponent, title: "Email Not Confirmed" },
  {
    path: 'usermenu', component: SideBarComponent, title: "usermenu", children: [
      { path: '', redirectTo: 'userprofile', pathMatch: "full" },
      { path: "userprofile", component: ProfileComponent, title: "userprofile" },
      { path: "userorder", component: OrderSummaryComponent, title: "Order Summary" },
      { path: 'userorder/orderDetails', component: OrderDetailsComponent, title: "Order Details" },
    ]
  },
    //---------------------------------------------------------------------------------------

  {path:'Appointment',component:BookAppointmentComponent,title:"Book Appointment"},

  {
    path: 'agentmenu', component: AgentSideBarComponent, title: "Agentmenu", children: [
      { path: '', redirectTo: 'Agentprofile', pathMatch: "full" },
      { path: "Agentprofile", component: AgentProfileComponent, title: "Agentprofile" },
      { path: 'Agentdashboard', component: AgentdashboardComponent, title: "AgentDashboard" },

    ]
  },

  {
    path: 'adminmenu', component: AdminSideBarComponent, title: "Adminmenu", children: [
      { path: '', redirectTo: 'Adminprofile', pathMatch: "full" },
      { path: "Adminprofile", component: AdminProfileComponent, title: "Adminprofile" },
      { path: 'Admindashboard', component: AdmindashboardComponent, title: "AdminDashboard" },
      { path: 'ViewAllOrder', component: ViewAllOrderComponent, title: "View All Order" },


    ]
  },

  {
    path: 'sellermenu', component: SellersidebarComponent, title: "Sellermenu", children: [
      { path: '', redirectTo: 'SellerProfile', pathMatch: "full" },
      { path: "SellerProfile", component: SellerProfileComponent, title: "Seller profile" },
      { path: 'sellerdashboard', component: DashboardComponent, title: "Seller Dashboard" },
    ]
  },


  { path: "about", component: AboutComponent, title: "About" },

  { path: 'properties', component: PropertiesPageComponent, title: "Real Estate Properties" },

  { path: 'products/:id', component: ProductDetailsComponent, title: "Product Details" },

  { path: "gopl", component: GoogleAndPaypalComponent, title: "gopl" },
<<<<<<< Updated upstream

  { path: "**", component: NotFoundComponent }
=======
  
  { path: "**", component: NotFoundComponent },


  //----------------------------------------------------------------------------------------
  { path: 'products/category/:id', component: CategoryComponent },

  //----------------------------------------------------------------------------------------

  //----------------------------------------------------------------------------------------

>>>>>>> Stashed changes
];
