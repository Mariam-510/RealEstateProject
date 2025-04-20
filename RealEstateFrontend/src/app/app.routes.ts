import { Routes } from '@angular/router';
import { PropertyDetailsComponent } from './Components/RealEstateComponent/property-details/property-details.component';
import { TestComponent } from './Components/RealEstateComponent/test/test.component';
import { TestdetailsComponent } from './Components/RealEstateComponent/testdetails/testdetails.component';
import { AuctionHomeComponent } from './Components/Auction/auction-home/auction-home.component';
import { DigitComponent } from './Components/Auction/digit/digit.component';

export const routes: Routes = [
    { path: 'property/:id', component: PropertyDetailsComponent },
    { path: 'test/:id', component: TestComponent },
    { path: 'T/:id', component: TestdetailsComponent },
    {path:'Auction',component:AuctionHomeComponent},
    {path:'digit',component:DigitComponent}

];
