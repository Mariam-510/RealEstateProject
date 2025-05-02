import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sellersidebar',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './sellersidebar.component.html',
  styleUrl: './sellersidebar.component.css'
})
export class SellersidebarComponent implements OnInit {
  constructor(private router: Router) { }

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
}
