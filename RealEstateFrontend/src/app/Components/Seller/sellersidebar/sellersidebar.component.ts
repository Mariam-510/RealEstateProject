import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { SellerService } from '../../../Services/ApiServices/seller.service';
import { ToastrService } from '../../../Services/toastr.service';

@Component({
  selector: 'app-sellersidebar',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './sellersidebar.component.html',
  styleUrl: './sellersidebar.component.css'
})
export class SellersidebarComponent implements OnInit {
  constructor(private router: Router, private sellerService: SellerService,
    private authService: AuthService, private toastrService: ToastrService) { }

  isCollapsed = false;
  dropdownOpen = false;
  olddropdownOpen = false;

  ngOnInit(): void {
    this.dropdownOpen = this.isDropdownItemActive();
  }


  // Store the previous state of the dropdown
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.olddropdownOpen = this.dropdownOpen;
      this.dropdownOpen = false;
    }
    else {
      this.dropdownOpen = this.olddropdownOpen; // Restore the previous state
    }
  }

  toggleDropdown() {
    this.isCollapsed = false;
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  preventClose(event: Event) {
    event.stopPropagation(); // Prevent dropdown from closing
    // You might want to add additional logic here if needed
  }

  isDropdownItemActive(): boolean {
    const currentUrl = this.router.url;
    const flag = [
      '/addAuction',
      '/addProperty',
      '/PropertiesPending',
      '/Properties',
      '/ViewAllAppointment',
      '/ViewAllAuctions',

    ].some(path => currentUrl.includes(path));

    if (flag && !this.isCollapsed) {
      this.dropdownOpen = true;
    }
    return flag;
  }


  confirmDeleteAccount(event: MouseEvent) {
    event.stopPropagation();
    const isConfirmed = window.confirm(
      "Are you sure you want to delete your seller account? This will remove all your listings and associated data!"
    );

    if (isConfirmed) {
      this.sellerService.deleteSeller().subscribe({
        next: (response) => {
          this.toastrService.success(response.message);
          // Clear authentication and redirect
          this.authService.logout();
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Delete error:', err);
          const errorMessage = err.error?.message ||
            'Failed to delete seller account. Please try again later.';
          // alert(errorMessage);
          this.toastrService.error(errorMessage);
        }
      });
    }
  }

}
