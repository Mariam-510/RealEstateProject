import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgentDto, AgentService } from '../../../Services/ApiServices/agent.service';
import { API_CONFIG } from '../../../app.config';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from '../../../Services/toastr.service';

@Component({
  selector: 'app-approve-agent',
  imports: [CommonModule, FormsModule],
  templateUrl: './approve-agent.component.html',
  styleUrl: './approve-agent.component.css'
})
export class ApproveAgentComponent implements OnInit {
  // activeLink = 'Pending';
  // filteredAgents: Agent[] = [];
  apiConfig = API_CONFIG;

  StatusLinks = ['Pending', 'Approved', 'Rejected'];

  agents: AgentDto[] = [];
  activeLink: string = 'Pending';
  filteredAgents: AgentDto[] = [];
  isLoading = false;
  constructor(private agentService: AgentService, private auth: AuthService,
    private router: Router, private toastr: ToastrService) { }

  async ngOnInit() {
    if (this.hasRole('Admin')) {
      this.loadAgents();
    }
    else {
      this.router.navigate(['/login']);
    }
  }

  private loadAgents(): void {
    this.isLoading = true;
    this.agentService.getAgents(this.activeLink)
      .subscribe({
        next: (agents) => {
          this.agents = agents;
          this.filteredAgents = agents;

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load agents:', error);
          this.isLoading = false;
        }
      });
  }

  setActive(link: string, event: MouseEvent): void {
    event.preventDefault();
    this.activeLink = link;
    this.loadAgents();
  }

  // filterAgents(): void {
  //   let filtered = this.agents;
  //   filtered = filtered.filter(agent =>
  //       agent.status.toLowerCase() === this.activeLink.toLowerCase() );
  //   this.filteredAgents = filtered;
  // }

  // Updated Component Methods with Enhanced Logging
  totalAgents: number = 0;
  approveAgent(id: number): void {
    this.agentService.updateApprovalStatus(id, true).subscribe({
      next: () => {
        console.log('Agent approved successfully');
        this.toastr.success('Agent approved successfully'); // Add toast
        this.loadAgents();
      },
      error: (error) => {
        console.error('Approval failed:', error);
        this.toastr.error('Approval failed. Please try again.'); // Add toast
      }
    });
  }

  rejectAgent(id: number): void {
    this.agentService.updateApprovalStatus(id, false).subscribe({
      next: () => {
        console.log('Agent rejected successfully');
        this.toastr.success('Agent rejected successfully'); // Add toast
        this.loadAgents();
      },
      error: (error) => {
        console.error('Rejection failed:', error);
        this.toastr.error('Rejection failed. Please try again.'); // Add toast
      }
    });
  }
  copyToClipboard(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      const text = element.innerText;
      navigator.clipboard.writeText(text).then(() => {
        this.toastr.success('Copied to clipboard')
        console.log('Copied to clipboard:', text);
      });
    }
  }
  hasRole(requiredRole: string) {
    return this.auth.hasRole(requiredRole);
  }

  hasRoleOrNoUser(requiredRole: string) {
    return !this.auth.isAuthenticated() || this.auth.hasRole(requiredRole);
  }

  hasUser() {
    return this.auth.isAuthenticated();
  }

}
