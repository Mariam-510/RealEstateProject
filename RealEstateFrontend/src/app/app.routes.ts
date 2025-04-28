import { Routes } from '@angular/router';
import { PropertyHomeComponent } from './Components/Properties/Home/property-home/property-home.component';
import { CartComponent } from './Components/ShoppingCart/cart/cart.component';
import { RegisterComponent } from './Components/Authentication/register/register.component';
import { RegisterAsAgentComponent } from './Components/Authentication/register-as-agent/register-as-agent.component';
import { ForgetPasswordComponent } from './Components/Authentication/forget-password/forget-password.component';
import { SendCodeComponent } from './Components/Authentication/send-code/send-code.component';
import { NewPasswordComponent } from './Components/Authentication/new-password/new-password.component';
import { EmailNotConfirmedComponent } from './Components/Authentication/email-not-confirmed/email-not-confirmed.component';
import { PropertiesPageComponent } from './Components/Properties/All/properties-page/properties-page.component';
import { HomePageComponent } from './Components/Home/home-page/home-page.component';
import { ChatmodalComponent } from './Components/Chat/chatmodal/chatmodal.component';
import { MainChatComponent } from './Components/Chat/main-chat/main-chat.component';
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
import { PHomeComponent } from './Components/Products/Home/p-home/p-home.component';
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
import { ForgetPasswordSendCodeComponent } from './Components/Authentication/forget-password-send-code/forget-password-send-code.component';
import { AddReviewComponent } from './Components/Order/add-review/add-review.component';
import { AllReviewComponent } from './Components/Buyer/all-review/all-review.component';
import { AddSubscriptionplanComponent } from './Components/Admin/add-subscriptionplan/add-subscriptionplan.component';
import { ViewAllComponent } from './Components/Products/All/view-all/view-all.component';
import { ApprovePropertyComponent } from './Components/Admin/approve-property/approve-property.component';
import { BookAppointmentComponent } from './Components/Appointment/book-appointment/book-appointment.component';
import { ViewAllPropertiesComponent } from './Components/PagesSellerAndAgent/view-all-properties/view-all-properties.component';
import { ViewPendingPropertiesComponent } from './Components/Seller/view-pending-properties/view-pending-properties.component';
import { WishlistComponent } from './Components/Buyer/Favorite/wishlist/wishlist.component';
import { BuyerViewAllPointmentComponent } from './Components/Buyer/buyer-view-all-pointment/buyer-view-all-pointment.component';
import { ViewAllPointmentComponent } from './Components/Seller/view-all-pointment/view-all-pointment.component';
import { FavoriteProductsComponent } from './Components/Buyer/Favorite/favorite-products/favorite-products.component';
import { CreateadminComponent } from './Components/Admin/createadmin/createadmin.component';

//----------------------------------------------------------------------------------------

export const routes: Routes = [

  { path: "about", component: AboutComponent, title: "About" },

  //---------------------------------------------------------------------------------------
  {
    path: 'admin', component: AdminSideBarComponent, title: "Admin", children: [
      { path: '', redirectTo: 'profile', pathMatch: "full" },
      { path: "profile", component: AdminProfileComponent, title: "Profile" },
      { path: 'dashboard', component: AdmindashboardComponent, title: "Dashboard" },
      { path: 'viewAllOrder', component: ViewAllOrderComponent, title: "View All Order" },
      { path: 'addProduct', component: AddProductComponent, title: "Add Product" },
      { path: "addCatgory", component: AddCategoryComponent, title: "Add Category" },
      { path: "addSubscriptionPlan", component: AddSubscriptionplanComponent, title: "Add Subscription Plan" },
      { path: 'approve', component: ApprovePropertyComponent, pathMatch: 'full' },
      { path: 'createadmin', component: CreateadminComponent, pathMatch: 'full' },
    ]
  },

  //---------------------------------------------------------------------------------------
  {
    path: 'agent', component: AgentSideBarComponent, title: "Agent", children: [
      { path: '', redirectTo: 'profile', pathMatch: "full" },
      { path: "profile", component: AgentProfileComponent, title: "Profile" },
      { path: 'dashboard', component: AgentdashboardComponent, title: "Dashboard" },
      { path: 'addAuction', component: AddAuctionComponent, title: "Add Auction" },
      { path: 'addProperty', component: AddPropertyComponent, title: "Add Property" },
      { path: 'Properties', component: ViewAllPropertiesComponent, title: "View All Properties" },
      { path: 'ViewAllAppointment', component: ViewAllPointmentComponent, title: "View All Appointment" }
    ]
  },

  //---------------------------------------------------------------------------------------
  {
    path: 'seller', component: SellersidebarComponent, title: "Seller", children: [
      { path: '', redirectTo: 'profile', pathMatch: "full" },
      { path: "profile", component: SellerProfileComponent, title: "Profile" },
      { path: 'dashboard', component: DashboardComponent, title: "Dashboard" },
      { path: 'addAuction', component: AddAuctionComponent, title: "Add Auction" },
      { path: 'addProperty', component: AddPropertyComponent, title: "Add Property" },
      { path: 'Properties', component: ViewAllPropertiesComponent, title: "View All Properties" },
      { path: 'PropertiesPending', component: ViewPendingPropertiesComponent, title: "View Pending Properties" },
      { path: 'ViewAllAppointment', component: ViewAllPointmentComponent, title: "View All Appointment" }
    ]
  },

  //---------------------------------------------------------------------------------------
  {
    path: 'user', component: SideBarComponent, title: "User", children: [
      { path: '', redirectTo: 'profile', pathMatch: "full" },
      { path: "profile", component: ProfileComponent, title: "Profile" },
      { path: "orders", component: OrderSummaryComponent, title: "Orders Summary" },
      { path: 'orders/:id', component: OrderDetailsComponent, title: "Order Details" },
      { path: "reviews", component: AllReviewComponent, title: "All Review" },
      { path: 'FavoriteProducts', component: FavoriteProductsComponent, title: "Favorite Products" },
      { path: 'wishlist', component: WishlistComponent, title: "Wishlist" },
      { path: 'BuyerViewAllAppointment', component: BuyerViewAllPointmentComponent, title: "View All Appointment" }

    ]
  },

  //---------------------------------------------------------------------------------------
  { path: 'login', component: LoginComponent, title: "Login" },
  { path: 'register', component: RegisterComponent, title: "Register" },
  { path: 'registerAgent', component: RegisterAsAgentComponent, title: "Register" },
  { path: 'forgetpassword', component: ForgetPasswordComponent, title: "Forget Password" },
  { path: 'sendcode', component: SendCodeComponent, title: "Send Code" },
  { path: 'newpassword', component: NewPasswordComponent, title: "Change Password" },
  { path: 'emailnotconfirmed', component: EmailNotConfirmedComponent, title: "Email Not Confirmed" },
  { path: 'forgetpassword/sendcode', component: ForgetPasswordSendCodeComponent, title: "Send Code" },
  { path: 'Add Review', component: AddReviewComponent, title: "Add Review" },


  //---------------------------------------------------------------------------------------
  { path: 'auctions', component: AuctionHomeComponent, title: "Auctions" },
  { path: 'auctions/:id', component: AuctionDetailsComponent, title: "Auction Details" },

  //---------------------------------------------------------------------------------------
  { path: 'chat', component: ChatmodalComponent, title: "Chat" },
  { path: 'mainchat', component: MainChatComponent, title: "Main Chat" },

  //---------------------------------------------------------------------------------------
  { path: 'products', component: PHomeComponent, title: "Products Home Page" },
  { path: 'products/all', component: ViewAllComponent, title: "Products" },
  { path: 'products/:id', component: ProductDetailsComponent, title: "Product Details" },


  //---------------------------------------------------------------------------------------
  { path: 'properties', component: PropertyHomeComponent, title: "Properties Home Page " },
  { path: 'properties/all', component: PropertiesPageComponent, title: "Properties" },
  { path: 'properties/:id', component: PropertyDetailsComponent, title: "Property Details" },

  //---------------------------------------------------------------------------------------
  { path: '', redirectTo: 'home', pathMatch: "full" },
  { path: 'home', component: HomePageComponent, title: "Home" },

  //---------------------------------------------------------------------------------------
  {
    path: 'checkout',
    children: [
      { path: '', redirectTo: 'cart', pathMatch: 'full' },
      { path: 'cart', component: CartComponent, title: "Cart" },
      { path: 'address', component: AddressSelectionComponent, title: "Address" },
      { path: 'address/new', component: NewAddressComponent, title: "Add Address" },
      { path: 'payment', component: PaymentComponent, title: "Payment" },
      { path: 'confirmation', component: OrderConfirmationComponent, title: "Order Confirmation" },
    ],
  },

  //---------------------------------------------------------------------------------------
  { path: 'book', component: BookAppointmentComponent, title: "Book Appointment" },
  //---------------------------------------------------------------------------------------
  { path: "**", component: NotFoundComponent },


  //----------------------------------------------------------------------------------------

];
