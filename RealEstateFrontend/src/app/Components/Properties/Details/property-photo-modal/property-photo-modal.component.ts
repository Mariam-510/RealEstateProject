import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
declare var bootstrap: any; // Required for Bootstrap modal handling

@Component({
  selector: 'app-property-photo-modal',
  imports: [CommonModule],
  templateUrl: './property-photo-modal.component.html',
  styleUrl: './property-photo-modal.component.css'
})
export class PropertyPhotoModalComponent {

  @ViewChild('photosModal', { static: true }) modalElement!: ElementRef;
images: string[] = [
    'details/d1.jpg',
    'details/d2.jpg',
    'details/d3.jpg',
    'details/terras.jpg',
    'details/d6.jpg',
    'details/property2.jpg',
    'details/property3.jpg',
    'details/property4.jpg'
  ];
  openModal() {
    const modal = new bootstrap.Modal(this.modalElement.nativeElement);
    modal.show();
   
  }

}
