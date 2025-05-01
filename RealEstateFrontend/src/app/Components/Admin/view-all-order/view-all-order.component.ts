import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrderResponseDto, OrderService } from '../../../Services/ApiServices/order.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';

@Component({
  selector: 'app-view-all-order',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './view-all-order.component.html',
  styleUrl: './view-all-order.component.css'
})
export class ViewAllOrderComponent implements OnInit {
  orderLinks = ['All Order', 'Pending', 'Out For Delivery', 'Delivered', 'Confirmed', 'Cancelled'];
  activeLink = 'All Order';
  startDate: string = '';
  endDate: string = '';
  
  orders: OrderResponseDto[] = [];
  filteredOrders: OrderResponseDto[] = [];
  isLoading = true;
  error: string | null = null;

  statusOptions = [
    { value: 0, text: 'Pending' },
    { value: 1, text: 'Confirmed' },
    { value: 2, text: 'Out For Delivery' },
    { value: 3, text: 'Delivered' },
    { value: 4, text: 'Cancelled' }
  ]; 
  constructor(private orderService: OrderService,
    private auth: AuthService,
    private router: Router,) {}
  
  ngOnInit(): void {
    if (!this.hasRole('Admin')) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.error = null;
    this.orderService.getAll().subscribe({
      
      next: (orders) => {
        this.orders = orders;
        // console.log('Orders loaded:', orders);  
        this.filteredOrders = [...orders];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load orders. Please try again later.';
        this.isLoading = false;
        console.error('Error loading orders:', err);
      }
    });
  }

  setActive(link: string, event: MouseEvent) {
    event.preventDefault();   
    this.activeLink = link;
    this.filterOrders();
  }

  filterOrders() {
    let filtered = [...this.orders];

    if (this.startDate) {
      filtered = filtered.filter(order => new Date(order.orderDate) >= new Date(this.startDate));
    }
    if (this.endDate) {
      filtered = filtered.filter(order => new Date(order.orderDate) <= new Date(this.endDate));
    }

    if (this.activeLink !== 'All Order') {
      filtered = filtered.filter(order => order.status === this.activeLink);
    }

    this.filteredOrders = filtered;
  }

  onDateChange() {
    this.filterOrders();
  }
 
  getStatusColor(statusNum: number): string {
    switch (statusNum) {
      case 0: return '#9c27b0';  // Gray
      case 1: return '#2196F3';  // Blue
      case 2: return '#FF9800';  // Orange
      case 3: return '#4CAF50';  // Green
      case 4: return '#F44336';  // Red
      default: return '#000000';
    }
  }

  getPaymentColor(method: string | null): string {
    const paymentMethod = method ?? 'Cash';
    switch (paymentMethod.toLowerCase()) {
      case 'cash': return '#28a745';
      case 'paypal': return '#003087';
      case 'stripe': return '#635bff';
      default: return '#000000';
    }
  }
  hasRole(requiredRole: string): boolean {
    return this.auth.hasRole(requiredRole);
  }

  hasRoleOrNoUser(requiredRole: string): boolean {
    return !this.auth.isAuthenticated() || this.auth.hasRole(requiredRole);
  }

  hasUser(): boolean {
    return this.auth.isAuthenticated();
  }
}