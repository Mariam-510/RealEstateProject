// address-selection.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AddressDto, AddressService } from '../../../Services/ApiServices/address.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { ToastrService } from '../../../Services/toastr.service';

@Component({
  selector: 'app-address-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './address-selection.component.html',
  styleUrls: ['./address-selection.component.css'],
})
export class AddressSelectionComponent implements OnInit {

  selectedAddressId: number | null = null;

  addresses: AddressDto[] = [];

  constructor(private addressService: AddressService, private router: Router, private auth: AuthService, private toaster: ToastrService) { }

  isLoading = true;

  ngOnInit() {

    if (!this.hasRole('Buyer')) {
      // Redirect to login if not Buyer
      this.router.navigate(['/login']);
    }
    else {
      // this.addressService.getAllByBuyer().subscribe({
      //   next: (addresses) => this.addresses = addresses,
      //   error: (err) => console.error('Error fetching addresses:', err)
      // });
      this.addressService.getAllByBuyer().subscribe({
        next: (addresses) => {
          this.addresses = addresses;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching addresses:', err);
          this.isLoading = false;
        }
      });
    }

  }

  selectAddress(addressId: number): void {
    this.selectedAddressId = addressId;
  }

  // In your component
  deleteAddress(addressId: number): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.addressService.deleteAddress(addressId).subscribe({
        next: (response) => {
          console.log(response.message);
          // Refresh addresses or update UI
          this.addresses = this.addresses.filter(address => address.id !== addressId);

          if (this.selectedAddressId === addressId) {
            this.selectedAddressId = null;
          }
        },
        error: (err) => {
          console.error('Error deleting address:', err);
          this.toaster.error(err.error?.message || 'Could not delete address');
        }
      });
    }
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
