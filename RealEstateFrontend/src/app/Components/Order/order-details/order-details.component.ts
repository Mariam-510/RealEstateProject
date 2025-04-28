import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import { MatDialog } from '@angular/material/dialog';
import { AddReviewComponent } from '../add-review/add-review.component';
import { AuthService, User } from '../../../Services/ApiServices/auth.service';
import { OrderResponseDto, OrderService } from '../../../Services/ApiServices/order.service';
import { lastValueFrom } from 'rxjs';
import { AddressDto, AddressService } from '../../../Services/ApiServices/address.service';
import { OrderItemDto, OrderItemService } from '../../../Services/ApiServices/order-item.service';
import { API_CONFIG } from '../../../app.config';

@Component({
  selector: 'app-order-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent {
  apiConfig = API_CONFIG;
  order: OrderResponseDto | null = null;
  address?: AddressDto | null;
  orderItems: OrderItemDto[] | null = null;

  constructor(private dialog: MatDialog, private route: ActivatedRoute,
    private router: Router, private auth: AuthService, private addressService: AddressService,
    private orderService: OrderService, private orderItemService: OrderItemService) { }

  isLoading = true;
  loggedInUser!: User | undefined;

  async ngOnInit() {
    if (!this.hasRole('Buyer')) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const orderId = Number(this.route.snapshot.paramMap.get('id'));
      await this.loadOrder(orderId);
      await this.loadAddress(this.order?.addressId ?? 0);
      await this.loadOrderItems(orderId);

      this.auth.currentUser$.subscribe(user => {
        this.loggedInUser = user;
        // Trigger initial load
      });

    } catch (error) {
      // Handle error
    } finally {
      this.isLoading = false;
    }
  }

  private async loadOrder(id: number) {
    try {
      const order$ = this.orderService.getById(id);
      const result = await lastValueFrom(order$);

      if (!result) {
        throw new Error('Order not found');
      }

      this.order = result;
      console.log('Order loaded:', result);
    } catch (err) {
      this.order = null;
      console.error('Failed to load order:', err);
      // Handle error (show message, redirect, etc.)
    }
  }

  private async loadAddress(id: number) {
    try {
      const address$ = this.addressService.getById(id);
      const result = await lastValueFrom(address$);

      if (!result) {
        throw new Error('Address not found');
      }

      this.address = result;
      console.log('Address loaded:', result);
    } catch (err) {
      this.address = null;
      console.error('Failed to load address:', err);
      // Handle error (show message, redirect, etc.)
    }
  }

  async loadOrderItems(orderId: number) {
    try {
      const orderItems$ = this.orderItemService.getAllByOrder(orderId);
      const result = await lastValueFrom(orderItems$);

      if (!result) {
        throw new Error('Order items not found');
      }

      this.orderItems = result;
      console.log('Order items loaded:', result);
    } catch (err) {
      this.orderItems = null;
      console.error('Failed to load order items:', err);
      // Handle error (show message, redirect, etc.)
    }
  }


  downloadInvoice(): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    doc.setFillColor(195, 142, 121);
    doc.rect(0, 0, pageWidth, 60, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('FurniCraft', margin, 30);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Quality Furniture for Modern Living', margin, 38);

    y = 70;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Invoice #:', margin, y);
    doc.text('Date:', margin, y + 5);

    doc.setTextColor(0, 0, 0);
    doc.text(`INV-${this.order?.id}`, margin + 20, y);
    doc.text(this.order?.orderDate ?? new Date().toLocaleDateString(), margin + 20, y + 5);

    y += 25;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 10, 'F');
    doc.setTextColor(44, 62, 80);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO', margin + 5, y);

    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text((this.loggedInUser?.firstName ?? "") + ' ' + (this.loggedInUser?.lastName ?? ""), margin, y);
    doc.text(`${this.address?.buildingNum}, ${this.address?.street}, ${this.address?.city}`, margin, y + 5);
    doc.text(`Apartment ${this.address?.apartment}, Floor ${this.address?.floor}`, margin, y + 10);
    // doc.text('+20 1150211405', margin, y + 15);
    doc.text(this.address?.phoneNum ?? "", margin, y + 15);

    y += 30;
    doc.setFillColor(195, 142, 121);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('ITEM DESCRIPTION', margin + 5, y);
    const priceColumnX = pageWidth - margin - 5;
    doc.text('PRICE', priceColumnX, y, { align: 'right' });

    y += 10;

    this.orderItems?.forEach(item => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`${item.productName} (x${item.quantity})`, margin + 5, y);
      // All prices aligned to the same right position
      doc.text(`${item.price} EGP`, priceColumnX, y, { align: 'right' });
      y += 7;
    });

    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.text('Subtotal:', priceColumnX - 50, y, { align: 'right' });
    doc.text(`${this.order?.subTotal} EGP`, priceColumnX, y, { align: 'right' });
    y += 7;

    doc.text('Delivery Fee:', priceColumnX - 50, y, { align: 'right' });
    doc.text(`${this.order?.deliveryFees} EGP`, priceColumnX, y, { align: 'right' });
    y += 7;

    doc.text('Discount:', priceColumnX - 50, y, { align: 'right' });
    doc.text(`${0} EGP`, priceColumnX, y, { align: 'right' });
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', priceColumnX - 50, y, { align: 'right' });
    doc.text(`${(this.order?.subTotal ?? 0) + (this.order?.deliveryFees ?? 0)} EGP`, priceColumnX, y, { align: 'right' });

    // Payment and Status
    y += 20;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 30, 'F');

    // Payment Method
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80);
    doc.text('Payment Method:', margin + 5, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(this.order?.paymentMethod ?? '', margin + 5, y + 7);

    const paymentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });


    doc.setFillColor(76, 175, 80);
    doc.rect(pageWidth / 2 + 10, y - 2, 50, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Paid on ${this.order?.orderDate}`, pageWidth / 2 + 35, y + 3, { align: 'center' });


    doc.setFontSize(10);


    y = doc.internal.pageSize.getHeight() - 30;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);

    const centerX = pageWidth / 2;

    doc.text('Thank you for your business!', centerX, y, { align: 'center' });
    doc.text('FurniCraft • 6 October City, Giza • +20 123456789', centerX, y + 5, { align: 'center' });

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y - 5, pageWidth - margin, y - 5);

    doc.save(`Invoice_${this.order?.id}.pdf`);
  }

  openReviewDialog(event: any): void {
    this.dialog.open(AddReviewComponent, {
      width: '400px',
      data: { productName: event.name }
    });
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
}

