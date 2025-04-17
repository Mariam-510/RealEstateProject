import { Component, OnInit, AfterViewInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-property.component.html',
  styleUrls: ['./add-property.component.css'],
})
export class AddPropertyComponent implements OnInit, AfterViewInit {
  propertyForm: FormGroup;
  images: { file: File; preview: string }[] = [];
  propertyCategories = [
    'Apartment',
    'Villa',
    'House',
    'Studio',
    'Penthouse',
    'Duplex',
    'Townhouse',
    'Mansion',
  ];
  propertyStatuses = ['Available', 'Sold', 'Auctioned'];
  propertyTypes = ['Sell', 'Rent'];

  private map!: L.Map;
  private marker: L.Marker | null = null;
  private provider = new OpenStreetMapProvider();

  constructor(private fb: FormBuilder, private router: Router) {
    this.propertyForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(15)]],
      description: ['', [Validators.required, Validators.maxLength(40)]],
      price: ['', [Validators.required, Validators.min(0)]],
      propertyCategory: ['', Validators.required],
      status: ['', Validators.required],
      type: ['', Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      buildingNum: ['', Validators.required],
      apartment: ['', Validators.required],
      floor: ['', Validators.required],
      images: [[], Validators.required],
      bedrooms: [3, [Validators.required, Validators.min(1)]],
      bathrooms: [2, [Validators.required, Validators.min(1)]],
      space: [100, [Validators.required, Validators.min(20)]],
    });

    // Set default marker icon
    L.Marker.prototype.options.icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  increment(field: string): void {
    const currentValue = this.propertyForm.get(field)?.value || 0;
    const incrementBy = field === 'space' ? 5 : 1;
    this.propertyForm.get(field)?.setValue(currentValue + incrementBy);
  }

  decrement(field: string): void {
    const currentValue = this.propertyForm.get(field)?.value || 0;
    const decrementBy = field === 'space' ? 5 : 1;
    const minValue = field === 'space' ? 20 : 1;
    if (currentValue > minValue) {
      this.propertyForm.get(field)?.setValue(currentValue - decrementBy);
    }
  }

  private initMap(): void {
    this.map = L.map('property-map').setView([30.0444, 31.2357], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

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

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.placeMarker(e.latlng);
      this.reverseGeocode(e.latlng).catch(console.error);
    });

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
      this.propertyForm.patchValue({
        street: `Near ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`,
      });
    }
  }

  private async fillAddressFromResult(result: any): Promise<void> {
    try {
      const address = result.address || result.raw?.address || {};

      this.propertyForm.patchValue({
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

  onFileChange(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.images.push({ file, preview: e.target.result });
          this.propertyForm.get('images')?.setValue(this.images);
          this.propertyForm.get('images')?.markAsTouched();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
    this.propertyForm
      .get('images')
      ?.setValue(this.images.length > 0 ? this.images : null);
  }

  onSubmit(): void {
    if (this.propertyForm.valid && this.images.length > 0) {
      const formData = new FormData();

      // Append all form values
      Object.keys(this.propertyForm.value).forEach((key) => {
        if (key !== 'images') {
          formData.append(key, this.propertyForm.value[key]);
        }
      });

      // Append images
      this.images.forEach((image) => {
        formData.append('images', image.file);
      });

      // Here you would typically send formData to your backend
      console.log('Property data:', formData);

      // For demonstration, just navigate after "submitting"
      this.router.navigate(['/properties']);
    }
  }
}
