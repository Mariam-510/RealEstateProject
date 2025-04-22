import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyDto } from '../../../Service/shared.service';
import { ToastrService } from '../../../Services/toastr.service';

@Component({
  selector: 'app-approve-property',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './approve-property.component.html',
  styleUrls: ['./approve-property.component.css']
})
export class ApprovePropertyComponent {
  properties: PropertyDto[] = [];

  // Static properties from property-home component
  slides = [
    {
      imageUrl: 'https://www.crossegyptchallenge.com/wp-content/uploads/2022/07/cairo01.jpg',
      alt: 'Cairo cityscape',
      title: 'ROI1 for property in Cairo reaches 10%-15%',
      subtitle: 'Buy property and gain profit'
    },
    {
      imageUrl: 'https://www.atlys.com/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FW3Iz4WACAy2J0qT0cCT3xA%2Fdidi%2Farticles%2Fl6ozcxn3e3a6lzrs6n6pg9lq%2Fpublic&w=1920&q=75',
      alt: 'Cairo street view',
      title: 'ROI2 for property in Cairo reaches 10%-15%',
      subtitle: 'Buy property and gain profit'
    },
    {
      imageUrl: 'https://digital.ihg.com/is/image/ihg/intercontinental-cairo-10367348719-2x1',
      alt: 'Cairo hotel',
      title: 'ROI3 for property in Cairo reaches 10%-15%',
      subtitle: 'Buy property and gain profit'
    }
  ];

  locations = [
    { name: 'New Cairo', image: 'https://se-developers.com/wp-content/uploads/2021/08/F-H-Front-Back.jpg' },
    { name: 'Maadi', image: 'https://cairogossip.com/app/uploads/2020/02/caf268d7b5e3978ce944d44b6a144653.jpg' },
    { name: 'Giza', image: 'https://c8.alamy.com/comp/2JDXC5N/egypt-giza-governorate-giza-motorboats-moored-in-front-of-apartments-in-dokki-2JDXC5N.jpg' },
    { name: 'Nasr City', image: 'https://melsa-nasr-city-29.cairo-hotels-eg.com/data/Photos/OriginalPhoto/6657/665761/665761917/cairo-melsa-nasr-city-29-photo-12.JPEG' }
  ];

  propertyCategories = [
    { name: 'Apartment', icon: 'bi bi-building' },
    { name: 'Villa', icon: 'bi bi-house' },
    { name: 'House', icon: 'bi bi-house-door' },
    { name: 'Studio', icon: 'bi bi-door-open' },
    { name: 'Penthouse', icon: 'bi bi-house-up' },
    { name: 'Duplex', icon: 'bi bi-houses' },
    { name: 'Townhouse', icon: 'bi bi-house-check' },
    { name: 'Mansion', icon: 'bi bi-bank' }
  ];

  featuredProperties = [
    {
      image: 'https://images.eq3.com/image-service/a0067633-232a-4dff-b0b9-bc26c0651211/Joan-Chair-30215-02-Panama-Grey-Black-Ash-Legs-Front-Web_ORIGINAL.jpg',
      title: 'Modern Apartment',
      location: 'London, UK',
      price: 450000
    },
    {
      image: 'https://wasilaah.com/cdn/shop/products/IMG_9996.jpg?v=1679343647&width=2048',
      title: 'Luxury Villa',
      location: 'Manchester, UK',
      price: 950000
    },
    {
      image: 'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg',
      title: 'Cozy Studio',
      location: 'Birmingham, UK',
      price: 220000
    }
  ];

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadPendingProperties();
  }

  loadPendingProperties(): void {
    // Mock data since PropertyService is not available
    this.properties = [
      {
        id: 1,
        title: 'Modern Apartment in New Cairo',
        description: 'Spacious 3 bedroom apartment with great view',
        location: 'New Cairo, Egypt',
        bedrooms: 3,
        bathrooms: 2,
        type: 'Sell',
        price: 2500000,
        status: 'Pending',
        propertyCategory: 'Apartment',
        images: [
          'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg',
          'https://images.prop24.com/331109780/Crop600x400',
          'https://www.brinkpm.com/images/blog/bigstock-Luxurious-New-Construction-Hom-165493040.webp'
        ],
        isFavorite: false,
        space: 150,
        activeMap: false,
        date: new Date(),
        userImage: 'https://example.com/user-image.jpg',
        userName: 'John Doe',

      },
      {
        id: 2,
        title: 'Luxury Villa in Maadi',
        description: 'Beautiful 5 bedroom villa with private pool',
        location: 'Maadi, Egypt',
        bedrooms: 5,
        bathrooms: 4,
        type: 'Rent',
        price: 35000,
        status: 'Pending',
        propertyCategory: 'Villa',
        images: [
          'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg',
          'https://images.prop24.com/331109780/Crop600x400',
          'https://www.brinkpm.com/images/blog/bigstock-Luxurious-New-Construction-Hom-165493040.webp'
        ],
        isFavorite: false,
        space: 300,
        activeMap: false,
        date: new Date(),
        userImage: 'https://example.com/user-image.jpg',
        userName: 'John Doe',
      }
    ];
  }

  approveProperty(property: PropertyDto): void {
    // Mock approval since PropertyService is not available
    this.toastr.success('Property approved successfully');
    property.status = 'Approved';
    this.properties = this.properties.filter(p => p.id !== property.id);
  }

  rejectProperty(property: PropertyDto): void {
    // Mock rejection since PropertyService is not available
    this.toastr.success('Property rejected successfully');
    property.status = 'Rejected';
    this.properties = this.properties.filter(p => p.id !== property.id);
  }

  downloadContract(property: PropertyDto): void {
    // Mock download since PropertyService is not available
    this.toastr.success('Contract downloaded successfully');
  }
}