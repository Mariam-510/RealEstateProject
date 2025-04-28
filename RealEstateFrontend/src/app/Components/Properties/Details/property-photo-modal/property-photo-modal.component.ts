import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { API_CONFIG } from '../../../../app.config';
declare var bootstrap: any; // Required for Bootstrap modal handling

@Component({
  selector: 'app-property-photo-modal',
  imports: [CommonModule],
  templateUrl: './property-photo-modal.component.html',
  styleUrl: './property-photo-modal.component.css'
})
export class PropertyPhotoModalComponent {

  @ViewChild('photosModal', { static: true }) modalElement!: ElementRef;
  @Input() images: string[] = [];
  apiConfig = API_CONFIG;
  openModal() {
    const modal = new bootstrap.Modal(this.modalElement.nativeElement);
    modal.show();

  }

}
