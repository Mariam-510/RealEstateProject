import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-buyer-view-all-pointment',
  imports: [CommonModule],
  templateUrl: './buyer-view-all-pointment.component.html',
  styleUrl: './buyer-view-all-pointment.component.css'
})
export class BuyerViewAllPointmentComponent {
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
      SellerID: 1,
      Seller: {
        Id: 1,
        Name: "John Doe",
        Type: "Seller",
        Email: "john@gmail.com"
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
      SellerID: 2,
      Seller: {
        Id: 2,
        Name: "John Doe",
        Type: "Agent",
        Email: "john@gmail.com"
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
      SellerID: 3,
      Seller: {
        Id: 3,
        Name: "John Doe",
        Type: "Seller",
        Email: "john@gmail.com"
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
      Status: 'Completed',
      SellerID: 1,
      Seller: {
        Id: 1,
        Name: "John Doe",
        Type: "Agent",
        Email: "john@gmail.com"
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
