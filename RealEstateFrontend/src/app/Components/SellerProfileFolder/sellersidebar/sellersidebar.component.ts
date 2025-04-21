import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sellersidebar',
  imports: [RouterModule,FormsModule,CommonModule],
  templateUrl: './sellersidebar.component.html',
  styleUrl: './sellersidebar.component.css'
})
export class SellersidebarComponent {
 constructor(private router: Router) { }
 isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }



}