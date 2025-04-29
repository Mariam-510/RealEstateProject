import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AppointmentDto, AppointmentService, AppointmentStatus } from '../../../Services/ApiServices/appointment.service';
import { FormsModule } from '@angular/forms';
import { API_CONFIG } from '../../../app.config';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-buyer-view-all-pointment',
  imports: [CommonModule,FormsModule,RouterLink,RouterModule],
  templateUrl: './buyer-view-all-pointment.component.html',
  styleUrl: './buyer-view-all-pointment.component.css'
})
export class BuyerViewAllPointmentComponent implements OnInit{
  propertyLinks = ['All Appointment', 'Pending', 'Confirmed', 'Cancelled', 'Completed'];
  activeLink = 'All Appointment';
  
    apiConfig = API_CONFIG;
  
  appointments: AppointmentDto[] = [];
  filteredappoinments: AppointmentDto[] = [];
  error: string | null = null;
  currentPage = 1;
  pageSize = 4;
  totalPages = 1;
  paginatedAppointments: AppointmentDto[] = [];
  constructor(private appointmentService: AppointmentService,private auth: AuthService,private router: Router) {}
  AppointmentStatus = AppointmentStatus;

  async  ngOnInit() {
 
    if (this.hasRole('Buyer')) {
      this.loadAppointments();
    } 
    else{
      this.router.navigate(['/login']);
    }
  }
 sortAppointment: 'asc' | 'desc' = 'desc';

  get sortedAppointments(): AppointmentDto[] {
    return [...this.filteredappoinments].sort((a, b) => {
      // Convert date strings to timestamps
      const dateA = new Date(a.scheduledTime).getTime();
      const dateB = new Date(b.scheduledTime).getTime();

      // Handle potential invalid dates (optional)
      if (isNaN(dateA) || isNaN(dateB)) {
        return 0; // or handle differently if needed
      }

      // Sort based on current order
      return this.sortAppointment === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }
  toggleSortAppointment(): void {
    this.sortAppointment = this.sortAppointment === 'desc' ? 'asc' : 'desc';
    this.applySorting();

  }
  applySorting(): void {
    // Sort the filtered appointments based on the new sort order
    this.filteredappoinments.sort((a, b) => {
      const dateA = new Date(a.scheduledTime).getTime();
      const dateB = new Date(b.scheduledTime).getTime();
  
      if (isNaN(dateA) || isNaN(dateB)) {
        return 0;
      }
  
      return this.sortAppointment === 'desc' ? dateB - dateA : dateA - dateB;
    });
  
    // After sorting, update the pagination
    this.updatePagination();
  }
  
  setActive(link: string, event: MouseEvent) {
    event.preventDefault();
    this.activeLink = link;
    this.loadAppointments();
  }

  async loadAppointments() {
    this.error = null;
    const status = this.activeLink !== 'All Appointment' ? this.activeLink : undefined;
  
    this.appointmentService.GetAppointments(this.sortAppointment, status).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.filteredappoinments = [...appointments];
        this.currentPage = 1; // Reset to page 1 whenever we load new data
        this.updatePagination();  // <- ADD THIS
        console.log('Appointments loaded:', this.appointments);
      },
      error: (error) => {
        console.error('Failed to load appointments.', error);
        this.error = 'Failed to load appointments. Please try again later.';
      }
    });
  }
  
  updateStatus(appointment: AppointmentDto, newStatus: AppointmentStatus) {
    this.appointmentService.updateStatus(appointment.id, newStatus).subscribe({
      next: (updatedAppointment: AppointmentDto) => {
        // Update the appointment status locally
        appointment.status = updatedAppointment.status;
  
        // After updating, re-filter appointments based on the active link
        this.applyFilter();
      },
      error: (error) => {
        console.error('Failed to update status', error);
      }
    });
  }
  

  applyFilter(): void {
    const status = this.activeLink !== 'All Appointment' ? this.activeLink : undefined;
    
    if (status) {
      this.filteredappoinments = this.appointments.filter(app => app.status === status);
    } else {
      this.filteredappoinments = [...this.appointments];
    }
  
    this.currentPage = 1; // Reset page to 1 after filter change
    this.updatePagination();
  }
  
  updatePagination(): void {
    // Calculate total pages
    this.totalPages = Math.ceil(this.filteredappoinments.length / this.pageSize);
    
    // Ensure current page stays within valid bounds
    this.currentPage = Math.max(1, Math.min(this.currentPage, this.totalPages));
    
    // Calculate slice indices
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    
    // Update paginated properties
    this.paginatedAppointments = this.filteredappoinments.slice(startIndex, endIndex);
  }
    getPages(): number[] {
      const pagesToShow = 5;
      const startPage = Math.max(1, this.currentPage - Math.floor(pagesToShow / 2));
      const endPage = Math.min(this.totalPages, startPage + pagesToShow - 1);
  
      return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    }
  
    previousPage(): void {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.updatePagination();
      }
    }
  
    nextPage(): void {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.updatePagination();
      }
    }
  
    goToPage(page: number): void {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.updatePagination();
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
