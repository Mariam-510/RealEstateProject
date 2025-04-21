import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, inject, Input, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { ToastrService } from '../Service/toastr.service';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';


@Component({
  selector: 'app-leaflet-map',
  imports: [CommonModule],
  templateUrl: './leaflet-map.component.html',
  styleUrl: './leaflet-map.component.css'
})
export class LeafletMapComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  @Input() locationName: string = ''; // ✅ Change this to any location
  @Input() styleTxt: { [key: string]: string } = { height: '100%', width: '50%' };

  public mapId: string; // Add unique ID property

  // Add component destruction handler
  constructor(private toastr: ToastrService) {
    this.mapId = `map-${Math.random().toString(36).slice(2, 11)}`;
  }

  // Add cleanup logic
  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private http = inject(HttpClient); // ✅ Correct way to inject HttpClient

  ngAfterViewInit(): void {
    this.getCoordinates(this.locationName); // ✅ Convert "Maadi" to lat/lon
  }


  private initializeLeafletIcons() {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
    });
  }

  private initMap(lat: number, lon: number): void {
    this.initializeLeafletIcons();

    this.map = L.map(this.mapId).setView([lat, lon], 13); // Use unique ID

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);

    L.marker([lat, lon], {
      icon: new L.Icon.Default()
    }).addTo(this.map)
      .bindPopup(`📍 ${this.locationName}`)
      .openPopup();

  }

  private getCoordinates(location: string): void {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;

    this.http.get<any[]>(url).subscribe(data => {
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        this.initMap(lat, lon);
      } else {
        console.error('Location not found!');
      }
    });
  }


  private userMarker: any;

  public getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          // Center the map on the user's location
          this.map.setView([userLat, userLng], 13);

          // Add a marker for the user's location
          if (this.userMarker) {
            this.userMarker.setLatLng([userLat, userLng]);
          } else {
            this.userMarker = L.marker([userLat, userLng]).addTo(this.map)
              .bindPopup('You are here!')
              .openPopup();
          }
        },
        (error) => {
          console.error('Error getting user location:', error);
          this.toastr.error('Unable to retrieve your location. Please ensure location services are enabled.');
        }
      );
    } else {
      this.toastr.error('Geolocation is not supported by this browser.');
    }
  }

}
