import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { BuyerService } from '../../../Services/ApiServices/buyer.service';
import { ToastrService } from '../../../Services/toastr.service';

@Component({
  selector: 'app-side-bar',
  imports: [RouterModule, CommonModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent {
  constructor(private router: Router, private buyerService: BuyerService,
    private authService: AuthService, private toastrService: ToastrService) { }


  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  confirmDeleteAccount(event: MouseEvent) {
    event.stopPropagation();
    const isConfirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone!"
    );

    if (isConfirmed) {
      this.buyerService.deleteBuyer().subscribe({
        next: (response) => {
          // alert(response.message);
          this.toastrService.success(response.message);
          // Optional: Clear user session
          this.authService.logout(); // If you have an auth service
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

