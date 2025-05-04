import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from '../../../Services/toastr.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { AgentService } from '../../../Services/ApiServices/agent.service';

@Component({
  selector: 'app-agent-side-bar',
  imports: [RouterModule, CommonModule],
  templateUrl: './agent-side-bar.component.html',
  styleUrl: './agent-side-bar.component.css'
})
export class AgentSideBarComponent implements OnInit {

  constructor(private router: Router, private agentService: AgentService,
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
      "Are you sure you want to delete your agent account? This will remove all your associated data and listings!"
    );

    if (isConfirmed) {
      this.agentService.deleteAgent().subscribe({
        next: (response) => {
          // alert(response.message);
          // Clear authentication and redirect
          this.toastrService.success(response.message);
          this.authService.logout();
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Delete error:', err);
          const errorMessage = err.error?.message ||
            'Failed to delete agent account. Please try again later.';
          // alert(errorMessage);
          this.toastrService.error(errorMessage);
        }
      });
    }
  }


}
