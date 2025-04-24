import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';

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
export class BookAppointmentComponent {
  @ViewChild('scrollWrapper') scrollWrapper!: ElementRef;

  days: Day[] = [];
  selectedDate: Date | null = null;
  hoveredDate: Date | null = null;

  showLeftControl = false;
  showRightControl = false;

  constructor() {
    this.generateDays(10); // Generate 14 days starting from today
  }

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
activeImageIndex = 0;
images = [
  { main: 'https://images.unsplash.com/photo-1648840887119-a9d33c964054?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', thumb: 'https://images.unsplash.com/photo-1648840887119-a9d33c964054?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { main: 'https://images.unsplash.com/photo-1635108198979-9806fdf275c6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', thumb: 'https://images.unsplash.com/photo-1635108198979-9806fdf275c6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { main: 'https://plus.unsplash.com/premium_photo-1734549547878-9de3d46d8fc2?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', thumb: 'https://plus.unsplash.com/premium_photo-1734549547878-9de3d46d8fc2?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { main: 'https://plus.unsplash.com/premium_photo-1734549547944-cd118bca8e14?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', thumb: 'https://plus.unsplash.com/premium_photo-1734549547944-cd118bca8e14?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { main: 'https://images.unsplash.com/photo-1611005893660-34445879f48a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', thumb: 'https://images.unsplash.com/photo-1611005893660-34445879f48a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { main: 'https://images.unsplash.com/photo-1648840887119-a9d33c964054?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', thumb: 'https://images.unsplash.com/photo-1648840887119-a9d33c964054?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { main: 'https://images.unsplash.com/photo-1635108198979-9806fdf275c6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', thumb: 'https://images.unsplash.com/photo-1635108198979-9806fdf275c6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { main: 'https://plus.unsplash.com/premium_photo-1734549547878-9de3d46d8fc2?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', thumb: 'https://plus.unsplash.com/premium_photo-1734549547878-9de3d46d8fc2?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { main: 'https://plus.unsplash.com/premium_photo-1734549547944-cd118bca8e14?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', thumb: 'https://plus.unsplash.com/premium_photo-1734549547944-cd118bca8e14?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { main: 'https://images.unsplash.com/photo-1611005893660-34445879f48a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', thumb: 'https://images.unsplash.com/photo-1611005893660-34445879f48a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
];

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
}
