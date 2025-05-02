import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-side-bar',
  imports: [RouterModule,CommonModule],
  templateUrl: './admin-side-bar.component.html',
  styleUrl: './admin-side-bar.component.css'
})
export class AdminSideBarComponent {

  constructor(private router: Router) { }


  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
  dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  preventClose(event: Event) {
    event.stopPropagation(); // Prevent dropdown from closing
    // You might want to add additional logic here if needed
  }
  
  isDropdownItemActive(): boolean {
    const currentUrl = this.router.url;
    return [
      '/createAdmin',
      '/addProduct',
      '/addCatgory',
      '/addSubscriptionPlan',
      '/approveProperty',
      '/approveAgent'
    ].some(path => currentUrl.includes(path));
  }
}