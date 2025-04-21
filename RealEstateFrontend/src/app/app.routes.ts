import { Routes } from '@angular/router';
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

export const routes: Routes = [
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
  {path: 'login', component: LoginComponent, title: "Login"},
  {path: 'register', component: RegisterComponent, title: "Register"},
  {path: 'profile', component: ProfileComponent, title: "Profile"},
  {path: 'registerasagent', component: RegisterAsAgentComponent, title: "Register"},
  {path: 'forgetpassword', component: ForgetPasswordComponent, title: "Forget Password"},
  {path: 'sendcode', component: SendCodeComponent, title: "Send Code"},
  {path: 'newpassword', component: NewPasswordComponent, title: "Change Password"},
  {path: 'emailnotconfirmed', component: EmailNotConfirmedComponent, title: "Email Not Confirmed"},
  {path: 'usermenu', component: SideBarComponent, title: "usermenu", children: [
      { path: '', redirectTo: 'userprofile', pathMatch: "full" },
      { path: "userprofile", component: ProfileComponent, title: "userprofile" },
      { path: "userorder", component: OrderSummaryComponent, title: "Order Summary" },
      {path: 'userorder/orderDetails', component: OrderDetailsComponent, title: "Order Details"},
]},

  {path: 'agentmenu', component: AgentSideBarComponent, title: "Agentmenu", children: [
          { path: '', redirectTo: 'Agentprofile', pathMatch: "full" },
          { path: "Agentprofile", component: AgentProfileComponent, title: "Agentprofile" },
          {path: 'Agentdashboard', component: AgentdashboardComponent, title: "AgentDashboard"},

      ]},
           
  {path: 'adminmenu', component: AdminSideBarComponent, title: "Adminmenu", children: [
              { path: '', redirectTo: 'Adminprofile', pathMatch: "full" },
              { path: "Adminprofile", component: AdminProfileComponent, title: "Adminprofile" },
              { path: 'Admindashboard', component: AdmindashboardComponent, title: "AdminDashboard"},
              { path: 'ViewAllOrder', component: ViewAllOrderComponent, title: "View All Order"},


          ]},    
          
  {path: 'sellermenu', component: SellersidebarComponent, title: "Sellermenu", children: [
  { path: '', redirectTo: 'SellerProfile', pathMatch: "full" },
  { path: "SellerProfile", component: SellerProfileComponent, title: "Seller profile" },
  {path: 'sellerdashboard', component: DashboardComponent, title: "Seller Dashboard"},
]},

];
