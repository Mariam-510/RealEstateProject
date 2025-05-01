import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, HostListener, ViewChild, ElementRef, OnInit } from '@angular/core';
import { AppointmentService, AppointmentStatus, AppointmentType, CreateAppointmentDto } from '../../../Services/ApiServices/appointment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '../../../Services/toastr.service';
import { PropertyService } from '../../../Services/ApiServices/property.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { API_CONFIG } from '../../../app.config';
import { AuthService } from '../../../Services/ApiServices/auth.service';

interface Day {
  date: Date;
  dayOfWeek: string;
  day: number;
  month: string;
}

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-appointment.component.html',
  styleUrl: './book-appointment.component.css'
})
export class BookAppointmentComponent implements OnInit { // Implement OnInit
  @ViewChild('scrollWrapper') scrollWrapper!: ElementRef;
  propertyId!: number;
  appointmentType!: AppointmentType; // No default
  status: AppointmentStatus = AppointmentStatus.Pending; // Required field
  property: any = null; // or define a Property model/interface
images: any[] = [];    // for images
  apiConfig = API_CONFIG;

  constructor(
    private appointmentService: AppointmentService,
    private route: ActivatedRoute // Inject ActivatedRoute
    ,private toastr: ToastrService,
    private router: Router, // <-- Inject Router
    private propertyService: PropertyService,
    private auth: AuthService
  ) {
    this.generateDays(10);
  }


  async ngOnInit() {
    if (this.hasRole('Buyer')) {
    try {
      const params = await firstValueFrom(this.route.paramMap);
      const id = params.get('id');
      if (id) {
        this.propertyId = +id;
        const propertyId = Number(this.route.snapshot.paramMap.get('id'));
        await this.loadProperty(propertyId);
      } else {
        console.error('No property ID in route');
        // Handle missing property ID (redirect or show error)
      }
  
      const queryParams = await firstValueFrom(this.route.queryParams);
      if (!queryParams['type']) {
        this.router.navigate(['/login']); 
      }
      this.appointmentType = queryParams['type'] as AppointmentType;
  
    } catch (error) {
      console.error('Error during initialization:', error);
      // Optionally handle the error, like redirecting or showing a user-friendly message
    }
  }
  else{
    this.router.navigate(['/login']); // Redirect to login if not authenticated
  }
  }
   async loadProperty(id: number) {
      try {
        const property$ = this.propertyService.getById(id);
        const result = await lastValueFrom(property$);
  
        if (!result) {
          throw new Error('Property not found');
        }
  
        this.property = result;
        this.images=result.images; // Assuming images is an array in the property object
      } catch (err) {
        this.property = null;
        console.error('Error loading property:', err);
        // Consider redirecting to error page or showing message
      }
    }
  
  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    // Return in ISO 8601 format WITHOUT timezone
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  
  onSubmit() {
    if (!this.propertyId || !this.selectedDate || !this.timeValue) {
      this.toastr.error('All fields are required', 'Error');
      return;
    }
  
    const scheduledTime = this.createScheduledTime();
  
    // Check if selected time is in the past
    if (scheduledTime <= new Date()) {
      this.toastr.error('Please select a future time', 'Invalid Time');
      return;
    }
  
    // Rest of your existing submission logic
    const formattedDateTime = this.formatDateTimeLocal(scheduledTime);
  
    const appointmentData: CreateAppointmentDto = {
      scheduledTime: formattedDateTime,
      type: this.appointmentType,
      status: 'Pending'
    };
  
    this.appointmentService.createAppointment(
      this.propertyId,
      this.appointmentType,
      appointmentData
    ).subscribe({
      next: (response) => {
        this.toastr.success('Appointment created successfully!', 'Success');
        setTimeout(() => {
          this.router.navigate(['/user/BuyerViewAllAppointment']);
        }, 1000);
      },
      error: (error) => {
        console.error('Error creating appointment:', error);
        this.toastr.error('Error creating appointment. Please try again.', 'Error');
      }
    });
  }
  
  days: Day[] = [];
  selectedDate: Date | null = null;
  hoveredDate: Date | null = null;

  showLeftControl = false;
  showRightControl = false;


  ngAfterViewInit() {
    setTimeout(() => {
      this.updateControls();
    }, 0);
  }

  private generateDays(count: number) {
    const today = new Date();
    for (let i = 0; i < count; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      this.days.push({
        date,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        day: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
      });
    }
  }

  scroll(direction: 'left' | 'right') {
    const scrollAmount = 200;
    this.scrollWrapper.nativeElement.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }

  selectDate(day: Day) {
    this.selectedDate = day.date;
  }

  @HostListener('window:resize')
  onResize() {
    this.updateControls();
  }

  updateControls() {
    const el = this.scrollWrapper?.nativeElement;
    if (!el) return;
    const threshold = 1;
    this.showLeftControl = el.scrollLeft > threshold;
    this.showRightControl = el.scrollLeft < (el.scrollWidth - el.clientWidth - threshold);
  }

  // Time Picker Logic
  hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1 to 12
  minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10, ..., 55

  selectedHour = 2;
  selectedMinute = 0;
  ampm: 'AM' | 'PM' = 'PM';

  // selectedTime = '02:00 PM';


  // Component properties
timeValue = '12:00'; // Initial value in 24h format
selectedTime = '12:00 PM'; // Display value

// Update when time changes
onTimeChange() {
  const [hours, minutes] = this.timeValue.split(':');
  this.selectedTime = this.convertTo12HourFormat(+hours, +minutes);
}

private convertTo12HourFormat(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  const twelveHour = hours % 12 || 12;
  return `${twelveHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}
private createScheduledTime(): Date {
  const [hours, minutes] = this.timeValue.split(':');
  
  // Create date in local timezone WITHOUT UTC conversion
  const localDate = new Date(this.selectedDate!);
  localDate.setHours(parseInt(hours), parseInt(minutes));
  
  // Return local time directly
  return localDate;
}

activeImageIndex = 0;

prevImage() {
  this.activeImageIndex = this.activeImageIndex === 0 
    ? this.images.length - 1 
    : this.activeImageIndex - 1;
}

nextImage() {
  this.activeImageIndex = this.activeImageIndex === this.images.length - 1 
    ? 0 
    : this.activeImageIndex + 1;
}

setActiveImage(index: number) {
  this.activeImageIndex = index;
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