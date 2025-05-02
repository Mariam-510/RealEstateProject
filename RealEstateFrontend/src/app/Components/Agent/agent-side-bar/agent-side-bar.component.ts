import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-agent-side-bar',
  imports: [RouterModule,CommonModule],
  templateUrl: './agent-side-bar.component.html',
  styleUrl: './agent-side-bar.component.css'
})
export class AgentSideBarComponent {

  constructor(private router: Router) { }

  isCollapsed = false;
  dropdownOpen = false;
  olddropdownOpen = false; // Store the previous state of the dropdown
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) 
      {
          this.olddropdownOpen = this.dropdownOpen;
          this.dropdownOpen = false; 
      }
    else 
      {
          this.dropdownOpen = this.olddropdownOpen; // Restore the previous state
      }
  }


  toggleDropdown() {
    this.isCollapsed=false;
    this.dropdownOpen = !this.dropdownOpen;
  }

  preventClose(event: Event) {
    event.stopPropagation(); // Prevent dropdown from closing
    // You might want to add additional logic here if needed
  }
  
  isDropdownItemActive(): boolean {
    const currentUrl = this.router.url;
    return [
      '/addAuction',
      '/addProperty',
      '/Properties',
      '/ViewAllAppointment',
      '/ViewAllAuctions',
     
    ].some(path => currentUrl.includes(path));
  }


}