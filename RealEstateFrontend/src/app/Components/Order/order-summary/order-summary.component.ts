import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { OrderResponseDto, OrderService, UpdateOrderDto } from '../../../Services/ApiServices/order.service';
import { catchError, lastValueFrom, of } from 'rxjs';
import { ToastrService } from '../../../Services/toastr.service';

@Component({
  selector: 'app-order-summary',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent implements OnInit {

  orderLinks = ['All Order', 'Pending', `Out For Delivery`, 'Delivered', 'Confirmed', 'Cancelled'];
  activeLink = 'All Order';
  startDate: string = '';
  endDate: string = '';
  error: string | null = null;
  orders: OrderResponseDto[] = [];
  filteredOrders: OrderResponseDto[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService,
    private orderService: OrderService, private toaster: ToastrService, private cdr: ChangeDetectorRef) { }



  async ngOnInit() {
    if (!this.hasRole('Buyer')) {
      this.router.navigate(['/login']);
      return;
    }

    await this.loadOrders();
  }

  isLoading = false;

  private async loadOrders(): Promise<void> {
    try {
      this.isLoading = true;
      this.cdr.detectChanges();

      const orders = await lastValueFrom(this.orderService.getAllByBuyer());
      console.log('Orders:', orders);
      this.orders = orders;
      this.filteredOrders = this.orders;
      this.isLoading = false;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  }

  getStatusText(statusNum: number): string {
    switch (statusNum) {
      case 0: return 'Pending';
      case 1: return 'Confirmed';
      case 2: return 'Out For Delivery';
      case 3: return 'Delivered';
      case 4: return 'Cancelled';
      default: return 'Unknown';
    }
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

  setActive(link: string, event: MouseEvent) {
    event.preventDefault();
    this.activeLink = link;
    this.filterOrders();
  }


  filterOrders() {
    let filtered = this.orders;

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


  hasRole(requiredRole: string) {
    return this.auth.hasRole(requiredRole);
  }

  hasRoleOrNoUser(requiredRole: string) {
    return !this.auth.isAuthenticated() || this.auth.hasRole(requiredRole);
  }

  hasUser() {
    return this.auth.isAuthenticated();
  }
  itemsPerPage: number = 5;
  currentPage: number = 1;
  totalPages: number = 1;

  // Add these methods to your component
  get paginatedOrders(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getPages(): number[] {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
  Deleteorder(order: OrderResponseDto): void {

    const confirmed = confirm('Are you sure you want to cancel this order?');

    if (!confirmed) {
      return;
    }

    const updateData: UpdateOrderDto = {
      id: order.id,
      status: 4
    };

    this.orderService.updateOrder(updateData).subscribe({
      next: (updatedOrder) => {
        const index = this.orders.findIndex(o => o.id === updatedOrder.id);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
          this.filterOrders();
        }
        this.toaster.success('Order canceled successfully');
      },
      error: (err) => {
        console.error('Error While Delete order:', err);
        this.toaster.error('Failed to Delete order . Please try again.');
        const originalOrder = this.orders.find(o => o.id === order.id);
        if (originalOrder) {
          order.statusNum = originalOrder.statusNum;
        }
      }
    });
  }
}


