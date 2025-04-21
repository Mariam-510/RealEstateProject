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

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }



}