import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyDto } from '../../../Service/shared.service';
import { ToastrService } from '../../../Services/toastr.service';
// Import Modal from bootstrap
import { Modal } from 'bootstrap';
@Component({
  selector: 'app-approve-property',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './approve-property.component.html',
  styleUrls: ['./approve-property.component.css'],
})
export class ApprovePropertyComponent {
  isPDFModalOpen = false;
  @ViewChild('pdfModal') pdfModal!: ElementRef;
  private modalInstance?: Modal;

  properties: PropertyDto[] = [
    {
      id: 1,
      title: 'Apartment in Maadi',
      description:
        'Luxurious apartment with green view.Spacious villa with a beautiful garden.Spacious villa with a beautiful garden.',
      location: 'Maadi, Cairo, Egypt',
      price: 4561180,
      type: 'Sell',
      propertyCategory: 'Apartment',
      status: 'Pending',
      images: [
        'propertyImages/1.jpg',
        'propertyImages/2.jpg',
        'propertyImages/1.jpg',
        'propertyImages/2.jpg',
      ],
      agentId: 5,
      bedrooms: 3,
      bathrooms: 3,
      space: 130,
      isFavorite: true,
      userImage: '',
      userName: '',
      date: new Date('2024-03-15'),
      activeMap: false,
    },
    {
      id: 2,
      title: 'Apartment in Zamalek',
      description:
        'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'Zamalek, Cairo, Egypt',
      price: 9500000,
      type: 'Sell',
      propertyCategory: 'Villa',
      status: 'Pending',
      images: ['propertyImages/3.jpg', 'propertyImages/4.jpg'],
      sellerId: 3,
      bedrooms: 4,
      bathrooms: 4,
      space: 250,
      isFavorite: false,
      userImage: '',
      userName: '',
      date: new Date('2023-11-22'),
      activeMap: false,
    },
    {
      id: 3,
      title: 'Apartment in Giza',
      description:
        'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'Haram, Giza',
      price: 30000,
      type: 'Rent',
      propertyCategory: 'Villa',
      status: 'Auctioned',
      images: ['propertyImages/5.jpg', 'propertyImages/6.jpg'],
      sellerId: 3,
      bedrooms: 5,
      bathrooms: 4,
      space: 250,
      isFavorite: false,
      userImage: '',
      userName: '',
      date: new Date('2024-01-10'),
      activeMap: false,
    },
    {
      id: 4,
      title: 'Apartment in Gouna',
      description:
        'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'El Gouna Conference & Culture Center, El Gouna, Egypt',
      price: 9500000,
      type: 'Sell',
      propertyCategory: 'Duplexes',
      status: 'Pending',
      images: ['propertyImages/3.jpg', 'propertyImages/4.jpg'],
      sellerId: 3,
      bedrooms: 5,
      bathrooms: 4,
      space: 250,
      isFavorite: false,
      userImage: '',
      userName: '',
      date: new Date('2023-09-05'),
      activeMap: false,
    },
    {
      id: 5,
      title: 'Apartment in Bibliotheca Alexandrina',
      description:
        'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'Bibliotheca Alexandrina, Alexandria, Egypt',
      price: 30000,
      type: 'Rent',
      propertyCategory: 'Twin Houses',
      status: 'Pending',
      images: ['propertyImages/5.jpg', 'propertyImages/6.jpg'],
      sellerId: 3,
      bedrooms: 8,
      bathrooms: 4,
      space: 250,
      isFavorite: false,
      userImage: '',
      userName: '',
      date: new Date('2024-02-28'),
      activeMap: false,
    },
    {
      id: 6,
      title: 'Apartment in Maadi',
      description:
        'Luxurious apartment with green view.Spacious villa with a beautiful garden.Spacious villa with a beautiful garden.',
      location: 'Maadi, Cairo, Egypt',
      price: 4561180,
      type: 'Sell',
      propertyCategory: 'Apartment',
      status: 'pending',
      images: [
        'propertyImages/1.jpg',
        'propertyImages/2.jpg',
        'propertyImages/1.jpg',
        'propertyImages/2.jpg',
      ],
      agentId: 5,
      bedrooms: 3,
      bathrooms: 3,
      space: 130,
      isFavorite: true,
      userImage: '',
      userName: '',
      date: new Date('2024-03-15'),
      activeMap: false,
    },
    {
      id: 7,
      title: 'Apartment in Zamalek',
      description:
        'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'Zamalek, Cairo, Egypt',
      price: 9500000,
      type: 'Sell',
      propertyCategory: 'Villa',
      status: 'Pending',
      images: ['propertyImages/3.jpg', 'propertyImages/4.jpg'],
      sellerId: 3,
      bedrooms: 4,
      bathrooms: 4,
      space: 250,
      isFavorite: false,
      userImage: '',
      userName: '',
      date: new Date('2023-11-22'),
      activeMap: false,
    },
    {
      id: 8,
      title: 'Apartment in Giza',
      description:
        'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'Haram, Giza',
      price: 30000,
      type: 'Rent',
      propertyCategory: 'Villa',
      status: 'Pending',
      images: ['propertyImages/5.jpg', 'propertyImages/6.jpg'],
      sellerId: 3,
      bedrooms: 5,
      bathrooms: 4,
      space: 250,
      isFavorite: false,
      userImage: '',
      userName: '',
      date: new Date('2024-01-10'),
      activeMap: false,
    },
    {
      id: 9,
      title: 'Apartment in Gouna',
      description:
        'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'El Gouna Conference & Culture Center, El Gouna, Egypt',
      price: 9500000,
      type: 'Sell',
      propertyCategory: 'Duplexes',
      status: 'Pending',
      images: ['propertyImages/3.jpg', 'propertyImages/4.jpg'],
      sellerId: 3,
      bedrooms: 5,
      bathrooms: 4,
      space: 250,
      isFavorite: false,
      userImage: '',
      userName: '',
      date: new Date('2023-09-05'),
      activeMap: false,
    },
    {
      id: 10,
      title: 'Apartment in Bibliotheca Alexandrina',
      description:
        'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'Bibliotheca Alexandrina, Alexandria, Egypt',
      price: 30000,
      type: 'Rent',
      propertyCategory: 'Twin Houses',
      status: 'Auctioned',
      images: ['propertyImages/5.jpg', 'propertyImages/6.jpg'],
      sellerId: 3,
      bedrooms: 8,
      bathrooms: 4,
      space: 250,
      isFavorite: false,
      userImage: '',
      userName: '',
      date: new Date('2024-02-28'),
      activeMap: false,
    },
  ];

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {}

  approveProperty(property: PropertyDto): void {
    // Mock approval since PropertyService is not available
    this.toastr.success('Property approved successfully');
    property.status = 'Approved';
    this.properties = this.properties.filter((p) => p.id !== property.id);
  }

  rejectProperty(property: PropertyDto): void {
    // Mock rejection since PropertyService is not available
    this.toastr.success('Property rejected successfully');
    property.status = 'Rejected';
    this.properties = this.properties.filter((p) => p.id !== property.id);
  }

  downloadContract(property: PropertyDto): void {
    // Mock download since PropertyService is not available
    this.toastr.success('Contract downloaded successfully');
  }

  showModal(): void {
    if (!this.modalInstance) {
      this.modalInstance = new Modal(this.pdfModal.nativeElement);
    }
    this.modalInstance.show();
  }
 
}
