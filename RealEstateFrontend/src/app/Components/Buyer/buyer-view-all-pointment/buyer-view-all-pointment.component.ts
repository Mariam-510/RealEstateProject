import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AppointmentDto, AppointmentService, AppointmentStatus } from '../../../Services/ApiServices/appointment.service';
import { FormsModule } from '@angular/forms';
import { API_CONFIG } from '../../../app.config';

@Component({
  selector: 'app-buyer-view-all-pointment',
  imports: [CommonModule,FormsModule],
  templateUrl: './buyer-view-all-pointment.component.html',
  styleUrl: './buyer-view-all-pointment.component.css'
})
export class BuyerViewAllPointmentComponent implements OnInit{
  propertyLinks = ['All Appointment', 'Pending', 'Confirmed', 'Cancelled', 'Completed'];
  activeLink = 'All Appointment';
  
  // setActive(link: string, event: MouseEvent) {
  //   event.preventDefault();   
  //   this.activeLink = link;
  //   this.filteredappoinment();
  // }




  // appointments = [
  //   {
  //     Id: 1001,
  //     ScheduledTime: new Date(2023, 5, 15, 10, 30),  
  //     Type: 'Virtual',
  //     Status: 'Pending',
  //     IsDeleted: false,
  //     SellerID: 1,
  //     Seller: {
  //       Id: 1,
  //       Name: "John Doe",
  //       Type: "Seller",
  //       Email: "john@gmail.com"
  //     },
  //     PropertyId: 101,
  //     Property: {
  //       Id: 101,
  //       name: "Villa",
  //       Address: "123 Main St, Cityville",
  //       Price: 350000
  //     }
  //   },
  //   {
  //     Id: 1002,
  //     ScheduledTime: new Date(2023, 5, 18, 14, 0),
  //     Type: 'InPerson',
  //     Status: 'Confirmed',
  //     SellerID: 2,
  //     Seller: {
  //       Id: 2,
  //       Name: "John Doe",
  //       Type: "Agent",
  //       Email: "john@gmail.com"
  //     },
  //     PropertyId: 102,
  //     Property: {
  //       Id: 102,
  //       name: "Villa",
  //       Address: "456 Oak Dr, Townsville",
  //       Price: 425000
  //     }
  //   },
  //   {
  //     Id: 1003,
  //     ScheduledTime: new Date(2023, 5, 18, 14, 0),
  //     Type: 'Virtual',
  //     Status: 'Confirmed',
  //     SellerID: 3,
  //     Seller: {
  //       Id: 3,
  //       Name: "John Doe",
  //       Type: "Seller",
  //       Email: "john@gmail.com"
  //     },
  //     PropertyId: 102,
  //     Property: {
  //       Id: 102,
  //       name: "Apartment",
  //       Address: "456 Oak Dr, Townsville",
  //       Price: 425000
  //     }
  //   },
  //   {
  //     Id: 1004,
  //     ScheduledTime: new Date(2023, 5, 18, 14, 0),
  //     Type: 'InPerson',
  //     Status: 'Completed',
  //     SellerID: 1,
  //     Seller: {
  //       Id: 1,
  //       Name: "John Doe",
  //       Type: "Agent",
  //       Email: "john@gmail.com"
  //     },
  //     PropertyId: 102,
  //     Property: {
  //       Id: 102,
  //       name: "Apartment",
  //       Address: "456 Oak Dr, Townsville",
  //       Price: 425000
  //     }
  //   }
  // ];

  // updateStatus(appointment: any, newStatus: string) 
  // {
  //   const index = this.appointments.findIndex(a => a.Id === appointment.Id);
  //   if (index !== -1) {
  //     this.appointments[index].Status = newStatus;
  //   }
    
  // }
  // filteredappoinments = this.appointments;
  // filteredappoinment() {
  //   let filtered = this.appointments;
    
  //   if (this.activeLink !== 'All Appointment') {
  //     filtered = filtered.filter(appointment => appointment.Status === this.activeLink);
  //   }

  //   this.filteredappoinments = filtered;
  // }
    apiConfig = API_CONFIG;
  
  appointments: AppointmentDto[] = [];
  filteredappoinments: AppointmentDto[] = [];
  error: string | null = null;

  constructor(private appointmentService: AppointmentService) {}
  AppointmentStatus = AppointmentStatus;

  ngOnInit() {
    this.loadAppointments();
  }

  setActive(link: string, event: MouseEvent) {
    event.preventDefault();
    this.activeLink = link;
    this.loadAppointments();
  }

  loadAppointments() {
    this.error = null;
    const status = this.activeLink !== 'All Appointment' ? this.activeLink : undefined;
    
    this.appointmentService.GetAppointmentsByBuyer('desc', status).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.filteredappoinments = [...appointments];
        console.log('Appointments loaded:', this.appointments);
      },
      error: (error) => {
        console.error('Failed to load appointments.', error);
        this.error = 'Failed to load appointments. Please try again later.';
      }
    });
  }

  updateStatus(appointment: AppointmentDto, newStatus: AppointmentStatus) {
    const index = this.appointments.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      // Update in frontend immediately for better UX
      this.appointments[index].status = newStatus;
      this.filteredappoinments = [...this.appointments];
  
      // Then call the backend to persist the change
      this.appointmentService.updateStatus(appointment.id, newStatus).subscribe({
        next: (response) => {
          console.log('Appointment status updated successfully.');
        },
        error: (error) => {
          console.error('Failed to update appointment status.', error);
          // Optional: Revert the change if API fails
        }
      });
    }
  }
  
}
