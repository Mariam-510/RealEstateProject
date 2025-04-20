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



}