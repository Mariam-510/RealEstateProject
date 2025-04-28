import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Agent {
  id: number;
  name: string;
  email: string;
  phone: string;
  crNumber: string;
  timeAgo: string;
  status: string;
  processedDate?: string;
}

@Component({
  selector: 'app-approve-agent',
  imports: [CommonModule],
  templateUrl: './approve-agent.component.html',
  styleUrl: './approve-agent.component.css'
})
export class ApproveAgentComponent {
  StatusLinks = ['Pending', 'Approved', 'Rejected'];
  activeLink = 'Pending';
  filteredAgents: Agent[] = [];
  
  agents: Agent[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+966 50 123 4567',
      crNumber: '12345678',
      timeAgo: '2 days ago',
      status: 'pending'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+966 50 987 6543',
      crNumber: '87654321',
      timeAgo: '1 week ago',
      status: 'approved',
      processedDate: '2023-05-15'
    },
    {
      id: 3,
      name: 'Ahmed Ali',
      email: 'ahmed@example.com',
      phone: '+966 50 555 1234',
      crNumber: '11223344',
      timeAgo: '3 days ago',
      status: 'pending'
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+966 50 789 0123',
      crNumber: '55667788',
      timeAgo: '2 weeks ago',
      status: 'rejected',
      processedDate: '2023-05-10'
    },
    {
      id: 5,
      name: 'Ahmed Ali',
      email: 'ahmed@example.com',
      phone: '+966 50 555 1234',
      crNumber: '11223344',
      timeAgo: '3 days ago',
      status: 'pending'
    },
  ];

  ngOnInit(): void {
    this.filterAgents();
  }

  setActive(link: string, event: MouseEvent) {
    event.preventDefault();
    this.activeLink = link;
    this.filterAgents();
  }

  filterAgents(): void {
    let filtered = this.agents;
    filtered = filtered.filter(agent => 
        agent.status.toLowerCase() === this.activeLink.toLowerCase() );  
    this.filteredAgents = filtered;
  }

  approveAgent(id: number): void {
    const agent = this.agents.find(a => a.id === id);
    if (agent) {
      agent.status = 'approved';
      agent.processedDate = new Date().toISOString();
      this.filterAgents();
    }
  }

  rejectAgent(id: number): void {
    const agent = this.agents.find(a => a.id === id);
    if (agent) {
      agent.status = 'rejected';
      agent.processedDate = new Date().toISOString();
      this.filterAgents();
    }
  }

  copyToClipboard(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      const text = element.innerText;
      navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard:', text);
      });
    }
  }
}