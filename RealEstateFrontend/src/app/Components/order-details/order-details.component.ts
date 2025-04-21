import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-order-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent {
  orderId: string = '';
  orderStatusCode: number = 0;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['id'];
      this.orderStatusCode = +params['Statuscode'];
    });
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
    doc.text(`INV-${this.orderId}`, margin + 20, y);
    doc.text(new Date().toLocaleDateString(), margin + 20, y + 5);
 
    y += 25;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 10, 'F');
    doc.setTextColor(44, 62, 80);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO', margin + 5, y);

    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Shahd Abdalla', margin, y);
    doc.text('6 October, Giza, Egypt', margin, y + 5);
    doc.text('Apartment 12, Floor 3', margin, y + 10);
    doc.text('+20 1150211405', margin, y + 15);

    y += 30;
    doc.setFillColor(195, 142, 121);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('ITEM DESCRIPTION', margin + 5, y);
    const priceColumnX = pageWidth - margin - 5;  
    doc.text('PRICE', priceColumnX, y, { align: 'right' });

     y += 10;
    const items = [
      { name: 'Modern Velvet Sofa', quantity: 2, price: 200 },
      { name: 'Ergonomic Office Chair', quantity: 1, price: 200 }
    ];

    items.forEach(item => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`${item.name} (x${item.quantity})`, margin + 5, y);
      // All prices aligned to the same right position
      doc.text(`${item.price * item.quantity} EGP`, priceColumnX, y, { align: 'right' });
      y += 7;
    });

    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    const subtotal = 600;
    const delivery = 100;
    const discount = 0;
    const total = subtotal + delivery - discount;

    doc.text('Subtotal:', priceColumnX - 50, y, { align: 'right' });
    doc.text(`${subtotal} EGP`, priceColumnX, y, { align: 'right' });
    y += 7;

    doc.text('Delivery Fee:', priceColumnX - 50, y, { align: 'right' });
    doc.text(`${delivery} EGP`, priceColumnX, y, { align: 'right' });
    y += 7;

    doc.text('Discount:', priceColumnX - 50, y, { align: 'right' });
    doc.text(`${discount} EGP`, priceColumnX, y, { align: 'right' });
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', priceColumnX - 50, y, { align: 'right' });
    doc.text(`${total} EGP`, priceColumnX, y, { align: 'right' });

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
    doc.text('PayPal', margin + 5, y + 7);

    const paymentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });


    doc.setFillColor(76, 175, 80);  
    doc.rect(pageWidth / 2 + 10, y - 2, 50, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Paid on ${paymentDate}`, pageWidth / 2 + 35, y + 3, { align: 'center' });

 
    doc.setFontSize(10);

  
    y = doc.internal.pageSize.getHeight() - 30;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);

    const centerX = pageWidth / 2;

    doc.text('Thank you for your business!', centerX, y, { align: 'center' });
    doc.text('FurniCraft • 6 October City, Giza • +20 123456789', centerX, y + 5, { align: 'center' });

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y - 5, pageWidth - margin, y - 5);

    doc.save(`Invoice_${this.orderId}.pdf`);
  }
}

