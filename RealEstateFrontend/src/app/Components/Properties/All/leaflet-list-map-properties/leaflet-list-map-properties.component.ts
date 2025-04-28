import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ToastrService } from '../../../../Services/toastr.service';
import { PropertyDTO } from '../../../../Services/ApiServices/property.service';
import { API_CONFIG } from '../../../../app.config';
import { Router } from '@angular/router';

type CustomMarkerOptions = L.MarkerOptions & {
  property: PropertyDTO;
};

@Component({
  selector: 'app-leaflet-list-map-properties',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaflet-list-map-properties.component.html',
  styleUrl: './leaflet-list-map-properties.component.css'
})
// OnChanges
export class LeafletListMapPropertiesComponent implements AfterViewInit {
  @Input() properties: PropertyDTO[] = [];
  apiConfig = API_CONFIG;
  map!: L.Map;
  private viewInitialized = false;
  private markers: L.Marker[] = [];

  constructor(private toastr: ToastrService, private http: HttpClient, private router: Router) { }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.handleMapInitialization();
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (this.viewInitialized && changes['properties']) {
  //     this.handleMapInitialization();
  //   }
  // }

  private initializeLeafletIcons() {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
    });
  }

  private handleMapInitialization(): void {
    if (!this.properties?.length) return;

    if (this.map) {
      this.map.remove();
      const container = document.getElementById('map');
      container?.replaceChildren();
    }

    this.initMap();
    this.addAllMarkers();
  }


  private initMap(): void {
    this.initializeLeafletIcons();
    this.map = L.map('map', { attributionControl: false }).setView([30.9, 28.9], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);
  }

  private async getCoordinates(location: string): Promise<{ lat: number; lon: number }> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;

    try {
      const data = await lastValueFrom(this.http.get<any[]>(url));
      if (!data?.length) throw new Error('Location not found');

      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  private async addAllMarkers(): Promise<void> {
    this.markers = [];
    const bounds = L.latLngBounds([]);

    for (const prop of this.properties) {
      try {
        const { lat, lon } = await this.getCoordinates(prop.location);
        const marker = L.marker([lat, lon], { property: prop } as CustomMarkerOptions)
          .addTo(this.map);

        const popupContent = this.createPopupWithImages(prop);

        // Bind popup for click
        marker.bindPopup(popupContent);

        // Show popup on hover
        marker.on('mouseover', () => {
          marker.openPopup();
        });

        marker.on('click', () => {
          this.router.navigate(['/properties', prop.id]);
        });

        // Optional: Close popup on mouseout
        marker.on('mouseout', () => {
          marker.closePopup();
        });

        this.markers.push(marker);
        bounds.extend([lat, lon]);
      } catch (error) {
        console.error(`Failed to add marker for ${prop.location}`, error);
        this.toastr.warning(`Could not find coordinates for: ${prop.location}`);
      }
    }

    if (bounds.isValid()) {
      this.map.fitBounds(bounds.pad(0.2));
    }
  }


  private createPopupWithImages(property: PropertyDTO): string {
    return `
  <div class="map-popup p-4" style="font-family: 'Segoe UI', sans-serif; max-width: 300px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
    <div class="popup-header mb-3">
      <h5 class="mb-2 fs-5 fw-bold text-dark" style="color: #2d3748;">🏠 ${property.title}</h5>
      <div class="price-badge mb-2" style="border-radius: 8px;">
        <p class="mb-0 fw-bold" style="color: #c38e79; font-size: 1.1rem;">
          EGP ${property.price.toLocaleString()}
        </p>
      </div>
      <p class="mb-3 text-secondary d-flex align-items-center" style="font-size: 0.9rem;">
        <svg class="me-1" width="16" height="16" viewBox="0 0 24 24" fill="#718096">
          <path d="M12 0C7.802 0 4 3.403 4 7.602 4 11.8 7.469 16.812 12 24c4.531-7.188 8-12.2 8-16.398C20 3.403 16.199 0 12 0zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
        </svg>
        ${property.location}
      </p>
    </div>

    ${property.images?.length ? `
    <div class="property-images mb-3">
      <div class="row g-2">
        ${property.images.slice(0, 3).map(img => `
        <div class="col-4">
          <img src="${this.apiConfig.apiUrl + img}" class="img-fluid rounded-2" style="height: 70px; width:70px; object-fit: cover;" alt="Property image">
        </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <div class="property-details mt-1">
      <div class="row g-2 mb-2">
        <div class="col-4">
          <div class="text-center p-1 rounded-2" style="background-color: #f8f9fa;">
            <small class="d-block text-secondary fw-semibold">Type</small>
            <span class="text-dark fw-bold">${property.type}</span>
          </div>
        </div>
        <div class="col-4">
          <div class="text-center p-1 rounded-2" style="background-color: #f8f9fa;">
            <small class="d-block text-secondary fw-semibold">Space</small>
            <span class="text-dark fw-bold">${property.space} m²</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
  }


  highlightProperty(property: PropertyDTO): void {
    const marker = this.markers.find(m => (m.options as CustomMarkerOptions).property.id === property.id);
    if (marker) {
      marker.openPopup();
      marker.setZIndexOffset(1000); // bring to front
      marker.getElement()?.classList.add('highlighted-marker');
    }
  }

  clearHighlight(): void {
    for (const marker of this.markers) {
      marker.closePopup();
      marker.setZIndexOffset(0);
      marker.getElement()?.classList.remove('highlighted-marker');
    }
  }



}
