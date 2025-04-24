import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-all-pointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-all-pointment.component.html',
  styleUrl: './view-all-pointment.component.css'
})
export class ViewAllPointmentComponent {
  propertyLinks = ['All Appointment', 'Pending', 'Confirmed', 'Cancelled', 'Completed'];
  activeLink = 'All Appointment';
  
  setActive(link: string, event: MouseEvent) {
    event.preventDefault();   
    this.activeLink = link;
    this.filteredappoinment();
  }




  appointments = [
    {
      Id: 1001,
      ScheduledTime: new Date(2023, 5, 15, 10, 30),  
      Type: 'Virtual',
      Status: 'Pending',
      IsDeleted: false,
      BuyerId: 1,
      Buyer: {
        Id: 1,
        Name: "John Doe",
        Phone: "+1 (555) 123-4567",
        Email: "john@example.com"
      },
      PropertyId: 101,
      Property: {
        Id: 101,
        name: "Villa",
        Address: "123 Main St, Cityville",
        Price: 350000
      }
    },
    {
      Id: 1002,
      ScheduledTime: new Date(2023, 5, 18, 14, 0),
      Type: 'InPerson',
      Status: 'Confirmed',
      BuyerId: 2,
      Buyer: {
        Id: 2,
        Name: "Jane Smith",
        Phone: "+1 (555) 987-6543",
        Email: "jane@example.com"
      },
      PropertyId: 102,
      Property: {
        Id: 102,
        name: "Villa",
        Address: "456 Oak Dr, Townsville",
        Price: 425000
      }
    },
    {
      Id: 1003,
      ScheduledTime: new Date(2023, 5, 18, 14, 0),
      Type: 'Virtual',
      Status: 'Confirmed',
      BuyerId: 2,
      Buyer: {
        Id: 2,
        Name: "Jane Smith",
        Phone: "+1 (555) 987-6543",
        Email: "jane@example.com"
      },
      PropertyId: 102,
      Property: {
        Id: 102,
        name: "Apartment",
        Address: "456 Oak Dr, Townsville",
        Price: 425000
      }
    },
    {
      Id: 1004,
      ScheduledTime: new Date(2023, 5, 18, 14, 0),
      Type: 'InPerson',
      Status: 'Confirmed',
      BuyerId: 2,
      Buyer: {
        Id: 2,
        Name: "Jane Smith",
        Phone: "+1 (555) 987-6543",
        Email: "jane@example.com"
      },
      PropertyId: 102,
      Property: {
        Id: 102,
        name: "Apartment",
        Address: "456 Oak Dr, Townsville",
        Price: 425000
      }
    }
  ];

  updateStatus(appointment: any, newStatus: string) 
  {
    const index = this.appointments.findIndex(a => a.Id === appointment.Id);
    if (index !== -1) {
      this.appointments[index].Status = newStatus;
    }
    
  }
  filteredappoinments = this.appointments;
  filteredappoinment() {
    let filtered = this.appointments;
    
    if (this.activeLink !== 'All Appointment') {
      filtered = filtered.filter(appointment => appointment.Status === this.activeLink);
    }

    this.filteredappoinments = filtered;
  }
  
}