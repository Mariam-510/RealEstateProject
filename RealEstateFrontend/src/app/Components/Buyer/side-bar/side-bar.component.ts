import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  imports: [RouterModule, CommonModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent {
  constructor(private router: Router) { }


  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  confirmDeleteAccount(event: MouseEvent) {
    event.stopPropagation();

    const isConfirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone!");

    if (isConfirmed) {
      // this._authService.logout();
      this.router.navigate(['/']);
    }
  }

}

