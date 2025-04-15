// address-selection.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../Services/cart.service';

interface Address {
  id: number;
  buildingNum: string;
  street: string;
  city: string;
  apartment: string;
  floor: string;
  phoneNum: string;
}

@Component({
  selector: 'app-address-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './address-selection.component.html',
  styleUrls: ['./address-selection.component.css'],
})
export class AddressSelectionComponent {
  addresses: Address[] = [
    {
      id: 1,
      buildingNum: '15',
      street: 'Main Street',
      city: 'Cairo',
      apartment: '12A',
      floor: '3',
      phoneNum: '+201234567890',
    },
    {
      id: 2,
      buildingNum: '42',
      street: 'Nile Corniche',
      city: 'Giza',
      apartment: '5B',
      floor: '8',
      phoneNum: '+201098765432',
    },
  ];

  selectedAddressId: number | null = null;

  constructor(private cartService: CartService) {}

  selectAddress(addressId: number): void {
    this.selectedAddressId = addressId;
  }

  deleteAddress(addressId: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this address?')) {
      this.addresses = this.addresses.filter((a) => a.id !== addressId);
      if (this.selectedAddressId === addressId) {
        this.selectedAddressId = null;
      }
    }
  }
}
