import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-view-all-order',
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './view-all-order.component.html',
  styleUrl: './view-all-order.component.css'
})
export class ViewAllOrderComponent {

   orderLinks = ['All Order', 'Pending', `Out For Delivery`, 'Delivered', 'Confirmed', 'Cancelled'];
   activeLink = 'All Order';
   startDate: string = '';
   endDate: string = '';
    
   orders = [
    { id: '#2632', date: '2025-02-20',Statuscode:0, status: 'Pending', payment: 'Stripe', subtotal: '220 EGP' },
    { id: '#2657', date: '2023-12-10', Statuscode:2,status: `Out For Delivery`, payment: 'Paypal', subtotal: '280 EGP' },
    { id: '#2643', date: '2025-01-09',Statuscode:3, status: 'Delivered', payment: 'Cash', subtotal: '820 EGP' },
    { id: '#1632', date: '2025-02-05',Statuscode:1, status: 'Confirmed', payment: 'Paypal', subtotal: '320 EGP' },
    { id: '#8632', date: '2025-02-09',Statuscode:4,status: 'Cancelled', payment: 'Stripe', subtotal: '1220 EGP' },
    { id: '#2634', date: '2025-06-20',Statuscode:0,status: 'Pending', payment: 'Stripe', subtotal: '270 EGP' }
      ];
    
    filteredOrders = this.orders;
    
    setActive(link: string, event: MouseEvent) {
     event.preventDefault();   
     this.activeLink = link;
     this.filterOrders();
      }
      
    
      filterOrders() {
        let filtered = this.orders;
    
        if (this.startDate) {
          filtered = filtered.filter(order => new Date(order.date) >= new Date(this.startDate));
        }
        if (this.endDate) {
          filtered = filtered.filter(order => new Date(order.date) <= new Date(this.endDate));
        }
    
        if (this.activeLink !== 'All Order') {
          filtered = filtered.filter(order => order.status === this.activeLink);
        }
    
        this.filteredOrders = filtered;
      }
    
      onDateChange() {
        this.filterOrders();
      }
    }
    
    
   