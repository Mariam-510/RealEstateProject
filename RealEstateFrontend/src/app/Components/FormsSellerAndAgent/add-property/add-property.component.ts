import { Component, OnInit, AfterViewInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { CreatePropertyDTO, PropertyService } from '../../../Services/ApiServices/property.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { ToastrService } from '../../../Services/toastr.service';

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
  userType: 'Agent' | 'Seller' = 'Agent';
  contractFile: File | undefined = undefined;
  contractPreview: string | null = null;

  private map!: L.Map;
  private marker: L.Marker | null = null;
  private provider = new OpenStreetMapProvider();

  constructor(private fb: FormBuilder, private router: Router, private propertyService: PropertyService,
    private auth: AuthService, private toastr: ToastrService) {
    this.propertyForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(15)]],
      description: ['', [Validators.required, Validators.maxLength(40)]],
      price: ['', [Validators.required, Validators.min(0)]],
      propertyCategory: ['', Validators.required],
      // status: ['', Validators.required],
      type: ['', Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      buildingNum: ['', Validators.required],
      apartment: ['', Validators.required],
      floor: ['', Validators.required],
      images: [null as File[] | null, [Validators.required, this.minImages(2)]],
      bedRooms: [0, [Validators.required, Validators.min(1)]], // Changed from bedrooms
      bathRooms: [0, [Validators.required, Validators.min(1)]], // Changed from bathrooms
      space: [100, [Validators.required, Validators.min(20)]],
      contract: [null, this.hasRole('Seller') ? Validators.required : null],
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

  ngOnInit(): void {

    if (!this.auth.hasRole('Agent') && !this.auth.hasRole('Seller')) {

      this.toastr.error('Unauthorized access!');
      this.router.navigate(['/login']);
    }

    if (this.hasRole('Agent')) {
      this.userType = 'Agent';
    } else if (this.hasRole('Seller')) {
      this.userType = 'Seller';
    }
  }

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

  private minImages(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const files = control.value as File[] | null;
      return files && files.length >= min
        ? null
        : { minImages: { required: min, actual: files?.length || 0 } };
    };
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

  // onFileChange(event: any): void {
  //   const files = event.target.files;
  //   if (files) {
  //     for (let i = 0; i < files.length; i++) {
  //       const file = files[i];
  //       const reader = new FileReader();
  //       reader.onload = (e: any) => {
  //         this.images.push({ file, preview: e.target.result });
  //         this.propertyForm.get('images')?.setValue(this.images);
  //         this.propertyForm.get('images')?.markAsTouched();
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   }
  // }

  onFileChange(event: any): void {
    const input = event.target as HTMLInputElement;
    const newFiles = input.files;

    if (newFiles && newFiles.length > 0) {
      // Convert FileList to array of Files
      const newFilesArray: File[] = Array.from(newFiles);

      // Get current files from form control
      const currentFiles: File[] = this.propertyForm.get('images')?.value || [];

      // Merge existing files with new files
      const mergedFiles = [...currentFiles, ...newFilesArray];

      // Update form control with merged files
      this.propertyForm.get('images')?.setValue(mergedFiles);
      this.propertyForm.get('images')?.markAsTouched();

      // Generate previews for new files only
      newFilesArray.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            this.images.push({ file, preview: result });
          }
        };
        reader.readAsDataURL(file);
      });

      // Reset input to allow re-selecting same files
      input.value = '';
    }
  }

  removeImage(index: number): void {
    const currentFiles: File[] = [...(this.propertyForm.get('images')?.value || [])];
    currentFiles.splice(index, 1);

    // Update both form control and previews
    this.propertyForm.get('images')?.setValue(currentFiles);
    this.images.splice(index, 1);

    // Force validation update
    this.propertyForm.get('images')?.updateValueAndValidity();
  }

  // removeImage(index: number): void {
  //   this.images.splice(index, 1);
  //   this.propertyForm
  //     .get('images')
  //     ?.setValue(this.images.length > 0 ? this.images : null);
  //     this.propertyForm.get('images')?.updateValueAndValidity();
  // }

  onContractChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF or Word document');
        return;
      }

      this.contractFile = file;
      this.contractPreview = file.name;
      this.propertyForm.get('contract')?.setValue(file);
      this.propertyForm.get('contract')?.markAsTouched();
    }
    else {
      this.contractFile = undefined; // Clear as undefined instead of null
    }
  }

  // onSubmit(): void {
  //   if (this.propertyForm.valid && this.images.length > 0) {
  //     // const formData = new FormData();

  //     // // Append all form values
  //     // Object.keys(this.propertyForm.value).forEach((key) => {
  //     //   if (key !== 'images' && key !== 'contract') {
  //     //     formData.append(key, this.propertyForm.value[key]);
  //     //   }
  //     // });

  //     // // Append images
  //     // this.images.forEach((image) => {
  //     //   formData.append('images', image.file);
  //     // });

  //     // // Append contract if agent
  //     // if (this.userType === 'agent' && this.contractFile) {
  //     //   formData.append('contract', this.contractFile);
  //     // }

  //     // // Here you would typically send formData to your backend
  //     // console.log('Property data:', formData);

  //     // // For demonstration, just navigate after "submitting"
  //     // this.router.navigate(['/properties']);

  //     const location = [
  //       this.propertyForm.value.city,
  //       this.propertyForm.value.street,
  //       this.propertyForm.value.buildingNum,
  //       this.propertyForm.value.apartment,
  //       this.propertyForm.value.floor
  //     ].filter(Boolean).join(', ');

  //     // Prepare the DTO
  //     const createDto: CreatePropertyDTO = {
  //       title: this.propertyForm.value.title,
  //       description: this.propertyForm.value.description,
  //       location: location,
  //       price: this.propertyForm.value.price,
  //       type: this.propertyForm.value.type,
  //       propertyCategory: this.propertyForm.value.propertyCategory,
  //       bedRooms: this.propertyForm.value.bedrooms,
  //       bathRooms: this.propertyForm.value.bathrooms,
  //       space: this.propertyForm.value.space,
  //       status: this.propertyForm.value.status,
  //       images: this.images.map(img => img.file),
  //       contractFile: this.contractFile ?? undefined
  //     };

  //     // Call the service
  //     this.propertyService.addProperty(createDto).subscribe({
  //       next: (createdProperty) => {
  //         console.log('Property created:', createdProperty);
  //         this.router.navigate(['/properties']);
  //       },
  //       error: (err) => {
  //         console.error('Error creating property:', err);
  //         // Handle error (show message to user)
  //         alert(`Error creating property: ${err.error?.message || err.message}`);
  //       }
  //     });
  //   }
  //   }

  onSubmit(): void {
    if (this.propertyForm.valid && this.images.length >= 2) {
      // this.isSubmitting = true;

      const files: File[] = this.propertyForm.get('images')?.value || [];

      // Combine location fields
      const location = [
        this.propertyForm.value.street,
        this.propertyForm.value.city,
        // this.propertyForm.value.buildingNum,
        // this.propertyForm.value.apartment,
        // this.propertyForm.value.floor
      ].filter(Boolean).join(', ');

      const buildingNo: string = this.propertyForm.value.buildingNum;
      const apartmentNo: string = this.propertyForm.value.apartment;
      const floorNo: string = this.propertyForm.value.floor;

      // Prepare the DTO with correct field names
      const createDto: CreatePropertyDTO = {
        title: this.propertyForm.value.title,
        description: this.propertyForm.value.description
          .concat('\nBuilding: ', buildingNo)
          .concat(', Apartment: ', apartmentNo)
          .concat(', Floor: ', floorNo),
        location: location,
        price: Number(this.propertyForm.value.price),
        type: this.propertyForm.value.type,
        propertyCategory: this.propertyForm.value.propertyCategory,
        bedRooms: this.propertyForm.value.bedRooms, // Corrected field name
        bathRooms: this.propertyForm.value.bathRooms, // Corrected field name
        space: Number(this.propertyForm.value.space),
        // status: this.propertyForm.value.status,
        images: files,
        contractFile: this.contractFile ? this.contractFile : undefined
      };

      // Call the service
      this.propertyService.addProperty(createDto).subscribe({
        next: (createdProperty) => {
          // this.isSubmitting = false;
          this.toastr.success('Property created successfully!');
          this.router.navigate(['/properties']);
        },
        error: (err) => {
          // this.isSubmitting = false;
          this.toastr.error('Error creating property!', err);
          alert(`Error creating property: ${err.error?.message || err.message}`);
        }
      });
    } else {
      // Mark all fields as touched to show validation messages
      this.markFormGroupTouched(this.propertyForm);
    }
  }

  // Add this helper method
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
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
