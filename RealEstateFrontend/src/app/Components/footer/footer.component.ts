import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  quickLinks = [
    { label: 'Properties', path: '/home/properties', icon: 'bi-house-fill' },
    { label: 'Furniture', path: '/home/products', icon: 'bi bi-lamp-fill' },
    { label: 'Auctions', path: '/home/auctions', icon: 'bi-hammer' },
    { label: 'About Us', path: '/about', icon: 'bi-info-circle-fill' }
  ];
  
  legalLinks = [
    { label: 'Privacy Policy', path: '/privacy', icon: 'bi bi-shield-fill-check' },
    { label: 'Terms of Service', path: '/terms', icon: 'bi-file-text-fill' },
    { label: 'Return Policy', path: '/returns', icon: 'bi-arrow-return-left' },
    { label: 'FAQ', path: '/faq', icon: 'bi-question-circle-fill' }
  ];

  currentYear: number = new Date().getFullYear();
}
