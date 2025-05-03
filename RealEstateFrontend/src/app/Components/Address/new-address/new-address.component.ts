import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { AddressService } from '../../../Services/ApiServices/address.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { ToastrService } from '../../../Services/toastr.service';

@Component({
  selector: 'app-new-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './new-address.component.html',
  styleUrls: ['./new-address.component.css'],
})
export class NewAddressComponent implements OnInit, AfterViewInit {
  addressForm: any;
  private map!: L.Map;
  private marker: L.Marker | null = null;
  private provider = new OpenStreetMapProvider();

  // Define default icon to fix missing marker issue
  private defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl:
      'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  constructor(private fb: FormBuilder, private router: Router,
    private addressService: AddressService, private auth: AuthService,private toaster:ToastrService) {
    // Set default icon
    L.Marker.prototype.options.icon = this.defaultIcon;
  }

  ngOnInit(): void {

    if (!this.hasRole('Buyer')) {
      // Redirect to login if not Buyer
      this.router.navigate(['/login']);
    }

    this.addressForm = this.fb.group({
      city: ['', Validators.required],
      street: ['', Validators.required],
      buildingNum: ['', Validators.required],
      apartment: ['', Validators.required],
      floor: ['', Validators.required],
      phoneNum: [
        '',
        [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)],
      ],
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Initialize map with better defaults
    this.map = L.map('map', {
      center: [30.0444, 31.2357],
      zoom: 13,
      zoomControl: true,
    });

    // Add tile layer with error handling
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      detectRetina: true,
    }).addTo(this.map);

    // Add search control with error handling
    try {
      const searchControl = new (GeoSearchControl as any)({
        provider: this.provider,
        style: 'bar',
        showMarker: true,
        autoClose: true,
        retainZoomLevel: false,
        animateZoom: true,
        keepResult: true,
        searchLabel: 'Enter address',
      });
      this.map.addControl(searchControl);
    } catch (error) {
      console.error('Error initializing search control:', error);
    }

    // Handle map click
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.placeMarker(e.latlng);
      this.reverseGeocode(e.latlng).catch(console.error);
    });

    // Handle search result
    this.map.on('geosearch/showlocation', (e: any) => {
      this.placeMarker(e.location);
      this.fillAddressFromResult(e.location).catch(console.error);
    });
  }

  private placeMarker(latlng: L.LatLng): void {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker(latlng, {
      draggable: true,
      icon: this.defaultIcon,
    }).addTo(this.map);

    this.marker.on('dragend', () => {
      const newLatLng = this.marker!.getLatLng();
      this.reverseGeocode(newLatLng).catch(console.error);
    });
  }

  private async reverseGeocode(latlng: L.LatLng): Promise<void> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      const data = await response.json();
      await this.fillAddressFromResult(data);
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      this.addressForm.patchValue({
        street: `Near ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`,
      });
    }
  }

  private async fillAddressFromResult(result: any): Promise<void> {
    try {
      const address = result.address || result.raw?.address || {};

      this.addressForm.patchValue({
        city:
          address.city ||
          address.town ||
          address.village ||
          address.county ||
          '',
        street: address.road || address.pedestrian || address.footway || '',
        buildingNum: address.house_number || '',
      });
    } catch (error) {
      console.error('Error filling address:', error);
    }
  }

  async detectLocation(): Promise<void> {
    if (!navigator.geolocation) {
      this.toaster.error("Your browser doesn't support geolocation.");
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      const pos = L.latLng(position.coords.latitude, position.coords.longitude);
      this.map.setView(pos, 16);
      this.placeMarker(pos);
      await this.reverseGeocode(pos);
    } catch (error) {
      console.error('Geolocation error:', error);
      this.toaster.error(
        'Error getting your location. Please make sure location services are enabled.'
      );
    }
  }

  errorMes = "";

  onSubmit(): void {
    if (this.addressForm.valid) {
      this.addressService.createAddress(this.addressForm.value).subscribe({
        next: (createdAddress) => {
          console.log('Address created successfully:', createdAddress);
          this.router.navigate(['/checkout/address']);
        },
        error: (err) => {
          console.error('Error creating address:', err);
          if (err.status === 400) {
            this.errorMes = err.error?.message || 'Bad request';
          }
          else {
            this.errorMes = 'Error creating address. Please try again.';
          }
        }
      });
    } else {
      this.errorMes = 'Please fill in all required fields correctly.';
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
