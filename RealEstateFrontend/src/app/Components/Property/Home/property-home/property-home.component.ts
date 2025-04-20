import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyDto, SharedService } from '../../../../Services/shared.service';
import { LeafletMapComponent } from "../../../leaflet-map/leaflet-map.component";
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';

@Component({
  selector: 'app-property-home',
  imports: [CommonModule, RouterModule, FormsModule, LeafletMapComponent, NgxSliderModule],
  templateUrl: './property-home.component.html',
  styleUrl: './property-home.component.css'
})
export class PropertyHomeComponent implements OnInit {

  HomePageProperties: PropertyDto[] = [];
  filteredProperties: PropertyDto[] = [];

  // Filters
  searchQuery = '';
  selectedType = '';
  selectedCategory = '';
  selectedBeds: number[] = [];
  selectedBaths: number[] = [];
  selectedCity = '';
  minPrice = 0;
  maxPrice = 1000000;
  minSpace = 0;
  maxSpace = 1000;

  // Sorting & View
  sortBy = '';
  // viewMode: 'grid3' | 'grid4' | 'list' | 'map' = 'grid3';
  viewModes: { id: 'grid3' | 'grid4' | 'list' | 'map'; icon: string }[] = [
    { id: 'grid3', icon: 'bi-grid-3x3-gap' },
    { id: 'grid4', icon: 'bi-grid' },
    { id: 'list', icon: 'bi-list' },
    { id: 'map', icon: 'bi-map' }
  ];

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;


  private _viewMode: 'grid3' | 'grid4' | 'list' | 'map' = 'grid3';

  get viewMode() {
    return this._viewMode;
  }

  set viewMode(mode: 'grid3' | 'grid4' | 'list' | 'map') {
    this._viewMode = mode;
    this.itemsPerPage = mode === 'grid4' ? 8 : 6;
  }

  // Options
  bedOptions = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
    { label: '6', value: 6 },
    { label: '7+', value: 7 }
  ];

  bathOptions = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
    { label: '6', value: 6 },
    { label: '7+', value: 7 }
  ];

  cities = [
    { name: 'New Cairo' },
    { name: 'Maadi' },
    { name: 'Giza' },
    { name: 'Nasr City' }
  ];


  // sliderOptions: Options = {
  //   floor: 0,
  //   ceil: 1000000,
  //   translate: (value: number) => `${value.toLocaleString()} EGP`
  // };

  sliderOptions: Options = {
    floor: 0,
    ceil: 1000000,
    translate: () => '',          // Remove value labels
    hideLimitLabels: true,        // Hide default min/max labels (0 and 1,000,000)
    hidePointerLabels: true,      // Hide handle labels
    showTicks: false,             // Remove tick marks
    showTicksValues: false        // Remove numbers under ticks
  };

  sliderOptionsSpace: Options = {
    floor: this.minSpace,
    ceil: this.maxSpace,
    translate: (value: number) => `${value}m²`
  };

  constructor(private cdr: ChangeDetectorRef, private sharedService: SharedService, private elRef: ElementRef) { }

  // featuredAgents: Agent[] = [];

  ngOnInit(): void {
    this.sliderStartAutoScroll();

    this.HomePageProperties = this.sharedService.HomePageProperties;

    this.HomePageProperties.forEach(HomePageProperties => {
      this.currentImageIndices[HomePageProperties.id] = 0;
    });

    this.minPrice = Math.min(...this.HomePageProperties.map(p => p.price));
    this.maxPrice = Math.max(...this.HomePageProperties.map(p => p.price));
    this.sliderOptions.ceil = this.maxPrice;

    this.minSpace = Math.min(...this.HomePageProperties.map(p => p.space));
    this.maxSpace = Math.max(...this.HomePageProperties.map(p => p.space));
    this.sliderOptionsSpace.ceil = this.maxSpace;

    // this.featuredAgents = this.sharedService.featuredAgents;

    this.sliderOptions = {
      floor: this.minPrice,
      ceil: this.maxPrice,
      translate: (value: number) => `${value.toLocaleString()} EGP`
    };

    this.sliderOptionsSpace = {
      floor: this.minSpace,
      ceil: this.maxSpace,
      translate: (value: number) => `${value}m²`
    };

    this.applyFilters();
  }

  get currentCategoryCount(): number {
    if (!this.selectedCategory) return this.HomePageProperties.length;
    const category = this.categoriesWithCounts.find(c => c.name === this.selectedCategory);
    return category ? category.count : 0;
  }

  // Filtering & Sorting
  applyFilters(): void {
    this.filteredProperties = this.HomePageProperties
      .filter(property => {
        const matchesSearch = !this.searchQuery ||
          property.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          property.location.toLowerCase().includes(this.searchQuery.toLowerCase());

        const matchesType = !this.selectedType || property.type === this.selectedType;
        const matchesCategory = !this.selectedCategory || property.propertyCategory === this.selectedCategory;
        const matchesPrice = property.price >= this.minPrice && property.price <= this.maxPrice;
        const matchesSpace = property.space >= this.minSpace && property.space <= this.maxSpace;

        const matchesBeds = this.selectedBeds.length === 0 || this.selectedBeds.some(b => {
          if (b === 7) {
            return (property.bedrooms || 0) >= 7;
          }
          return (property.bedrooms || 0) === b;
        });

        const matchesBaths = this.selectedBaths.length === 0 || this.selectedBaths.some(b => {
          if (b === 7) {
            return (property.bathrooms || 0) >= 7;
          }
          return (property.bathrooms || 0) === b;
        });

        
        return matchesSearch && matchesType && matchesCategory && matchesPrice && matchesBeds && matchesBaths && matchesSpace;
      })
      .sort((a, b) => {
        switch (this.sortBy) {
          case 'priceAsc': return a.price - b.price;
          case 'priceDesc': return b.price - a.price;
          case 'dateNewest': return new Date(b.date).getTime() - new Date(a.date).getTime();
          case 'dateOldest': return new Date(a.date).getTime() - new Date(b.date).getTime();
          default: return 0;
        }
      });

    this.currentPage = 1;
  }

  // Getters
  get categoriesWithCounts() {
    const counts = new Map<string, number>();
    this.HomePageProperties.forEach(p => {
      counts.set(p.propertyCategory, (counts.get(p.propertyCategory) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  }

  get propertyTypes() {
    return [
      { label: 'For Sell', value: 'Sell', count: this.HomePageProperties.filter(p => p.type === 'Sell').length },
      { label: 'For Rent', value: 'Rent', count: this.HomePageProperties.filter(p => p.type === 'Rent').length }
    ];
  }

  getSortLabel(value: string): string {
    switch (value) {
      case 'priceAsc': return 'Price: Low to High';
      case 'priceDesc': return 'Price: High to Low';
      case 'dateNewest': return 'Newest First';
      case 'dateOldest': return 'Oldest First';
      default: return '';
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProperties.length / this.itemsPerPage);
  }

  get paginatedProperties(): PropertyDto[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProperties.slice(start, start + this.itemsPerPage);
  }

  // UI Handlers
  toggleCategory(category: string): void {
    this.selectedCategory = this.selectedCategory === category ? '' : category;
    this.applyFilters();
  }

  togglePropertyType(type: string): void {
    this.selectedType = this.selectedType === type ? '' : type;
    this.applyFilters();
  }

  toggleCityType(type: string): void {
    this.selectedCity = this.selectedCity === type ? '' : type;
    this.applyFilters();
  }

  toggleBed(value: number): void {
    const index = this.selectedBeds.indexOf(value);
    index === -1 ? this.selectedBeds.push(value) : this.selectedBeds.splice(index, 1);
    this.applyFilters();
  }

  toggleBath(value: number): void {
    const index = this.selectedBaths.indexOf(value);
    index === -1 ? this.selectedBaths.push(value) : this.selectedBaths.splice(index, 1);
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedType = '';
    this.selectedCategory = '';
    this.selectedCity = '';
    this.minPrice = Math.min(...this.HomePageProperties.map(p => p.price));
    this.maxPrice = Math.max(...this.HomePageProperties.map(p => p.price));
    this.minSpace = Math.min(...this.HomePageProperties.map(p => p.space));
    this.maxSpace = Math.max(...this.HomePageProperties.map(p => p.space));
    this.selectedBeds = [];
    this.selectedBaths = [];
    this.sortBy = '';
    this.applyFilters();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  Math = Math;
  activeSlide = 0;
  private sliderAutoScrollSubscription: Subscription | null = null;
  private sliderAutoScrollInterval = 3000;

  currentImageIndices: { [key: number]: number } = {};
  canScrollLeftProduct = false;
  canScrollRightProduct = true;

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
  

  // properties = [
  //   {
  //     id: 1,
  //     title: 'Jacklinnnnnnnnn sddd dsdsd sd sd sd sdfsdf',
  //     description: 'Upholstered King Size Bed with Tufted Headboarddddddddddddddddddddddddddd',
  //     location: '25 El Tahrir Street, Dokki, Giza, Cairo Governorate, Egyptttttttttttttttttttttttttttttttttttttt',
  //     beds: 3,
  //     bathrooms: 2,
  //     type: 'Rent',
  //     price: 70000,
  //     status: 'Available',
  //     category: 'Apartment',
  //     images: [
  //       'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg',
  //       'https://images.prop24.com/331109780/Crop600x400',
  //       'https://www.brinkpm.com/images/blog/bigstock-Luxurious-New-Construction-Hom-165493040.webp'
  //     ],
  //     wishlisted: true
  //   },
  //   {
  //     id: 2,
  //     title: 'Jacklinnnnnnnnn sddd dsdsd sd sd sd sdfsdf',
  //     description: 'Upholstered King Size Bed with Tufted Headboarddddddddddddddddddddddddddd',
  //     location: 'Building 12, South 90th Street, Fifth Settlement, New Cairo, Egypt',
  //     beds: 3,
  //     bathrooms: 2,
  //     type: 'Sell',
  //     price: 700,
  //     status: 'Sold',
  //     category: 'Villa',
  //     images: [
  //       'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg',
  //       'https://images.prop24.com/331109780/Crop600x400',
  //       'https://www.brinkpm.com/images/blog/bigstock-Luxurious-New-Construction-Hom-165493040.webp'
  //     ],
  //     wishlisted: true
  //   },
  //   {
  //     id: 3,
  //     title: 'Jacklinnnnnnnnn sddd dsdsd sd sd sd sdfsdf',
  //     description: 'Upholstered King Size Bed with Tufted Headboarddddddddddddddddddddddddddd',
  //     location: 'Unit 3B, Katameya Heights, New Cairo, Cairo Governorate, Egypt',
  //     beds: 3,
  //     bathrooms: 2,
  //     type: 'Sell',
  //     price: 700,
  //     status: 'Auctioned',
  //     category: 'Studio',
  //     images: [
  //       'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg',
  //       'https://images.prop24.com/331109780/Crop600x400',
  //       'https://www.brinkpm.com/images/blog/bigstock-Luxurious-New-Construction-Hom-165493040.webp'
  //     ],
  //     wishlisted: true
  //   },
  //   {
  //     id: 4,
  //     title: 'Jacklinnnnnnnnn sddd dsdsd sd sd sd sdfsdf',
  //     description: 'Upholstered King Size Bed with Tufted Headboarddddddddddddddddddddddddddd',
  //     location: 'Apartment B3-12, Porto Marina, El Alamein, North Coast, Egypt',
  //     beds: 3,
  //     bathrooms: 2,
  //     type: 'Rent',
  //     price: 70000,
  //     status: 'Available',
  //     category: 'Apartment',
  //     images: [
  //       'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg',
  //       'https://images.prop24.com/331109780/Crop600x400',
  //       'https://www.brinkpm.com/images/blog/bigstock-Luxurious-New-Construction-Hom-165493040.webp'
  //     ],
  //     wishlisted: true
  //   },
  //   {
  //     id: 5,
  //     title: 'Jacklinnnnnnnnn sddd dsdsd sd sd sd sdfsdf',
  //     description: 'Upholstered King Size Bed with Tufted Headboarddddddddddddddddddddddddddd',
  //     location: 'Villa 7, El Gouna Hilltop, Hurghada, Red Sea Governorate, Egypt',
  //     beds: 3,
  //     bathrooms: 2,
  //     type: 'Sell',
  //     price: 700,
  //     status: 'Sold',
  //     category: 'Villa',
  //     images: [
  //       'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg',
  //       'https://images.prop24.com/331109780/Crop600x400',
  //       'https://www.brinkpm.com/images/blog/bigstock-Luxurious-New-Construction-Hom-165493040.webp'
  //     ],
  //     wishlisted: true
  //   },
  //   {
  //     id: 6,
  //     title: 'Jacklinnnnnnnnn sddd dsdsd sd sd sd sdfsdf',
  //     description: 'Upholstered King Size Bed with Tufted Headboarddddddddddddddddddddddddddd',
  //     location: 'Flat 2, 101 Nile Street, Luxor West Bank, Luxor, Egypt',
  //     beds: 3,
  //     bathrooms: 2,
  //     type: 'Sell',
  //     price: 700,
  //     status: 'Auctioned',
  //     category: 'Studio',
  //     images: [
  //       'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg',
  //       'https://images.prop24.com/331109780/Crop600x400',
  //       'https://www.brinkpm.com/images/blog/bigstock-Luxurious-New-Construction-Hom-165493040.webp'
  //     ],
  //     wishlisted: true
  //   },
  // ]

  listings = [
    {
      img: 'https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg',
      tags: ['LISTED BY REDFIN 3 HRS AGO', '3D WALKTHROUGH'],
      price: '$559,900',
      beds: 5,
      baths: 3,
      size: '2,700 sq ft',
      address: '4249 N Central Park Ave, Chicago, IL 60618'
    },
    {
      img: 'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg',
      tags: ['LISTED BY REDFIN 5 HRS AGO', '3D WALKTHROUGH'],
      price: '$429,000',
      beds: 2,
      baths: 2,
      size: '1,201 sq ft',
      address: '2317 W Wolfram St #211, Chicago, IL 60618'
    },
    {
      img: 'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg',
      tags: ['REDFIN OPEN SAT, 1PM TO 3PM', '3D WALKTHROUGH'],
      price: '$195,000',
      beds: 3,
      baths: 1.5,
      size: '1,000 sq ft',
      address: '1700 W Jarvis Ave Unit B, Chicago, IL 60626'
    }
  ];

  sliderStartAutoScroll(): void {
    this.sliderStopAutoScroll(); // Ensure we don't have multiple subscriptions

    this.sliderAutoScrollSubscription = interval(this.sliderAutoScrollInterval).subscribe(() => {
      this.next();
    });
  }

  sliderStopAutoScroll(): void {
    if (this.sliderAutoScrollSubscription) {
      this.sliderAutoScrollSubscription.unsubscribe();
      this.sliderAutoScrollSubscription = null;
    }
  }

  next(): void {
    this.activeSlide = (this.activeSlide + 1) % this.slides.length;
  }

  prev(): void {
    this.activeSlide = (this.activeSlide - 1 + this.slides.length) % this.slides.length;
  }

  setActiveSlide(index: number): void {
    this.activeSlide = index;
    this.resetAutoScroll();
  }

  resetAutoScroll(): void {
    // Reset the timer when manually changing slides
    this.sliderStartAutoScroll();
    this.sliderStopAutoScroll();
  }

  @ViewChild('slider', { static: false }) slider!: ElementRef;
  
  scrollLeft() {
    this.slider.nativeElement.scrollBy({ left: -326, behavior: 'smooth' });
  }

  scrollRight() {
    this.slider.nativeElement.scrollBy({ left: 326, behavior: 'smooth' });
  }

  checkScroll() {
    const el = this.slider.nativeElement;
    this.canScrollLeftProduct = el.scrollLeft > 0;
    this.canScrollRightProduct = el.scrollLeft < el.scrollWidth - (el.clientWidth + 5);
    // Trigger change detection manually to prevent the ExpressionChangedAfterItHasBeenCheckedError
    this.cdr.detectChanges();
  }

  nextImage(propertyId: number) {
    const property = this.HomePageProperties.find(p => p.id === propertyId);
    if (property) {
      this.currentImageIndices[propertyId] = 
        (this.currentImageIndices[propertyId] + 1) % property.images.length;
    }
  }

  prevImage(propertyId: number) {
    const property = this.HomePageProperties.find(p => p.id === propertyId);
    if (property) {
      this.currentImageIndices[propertyId] = 
        (this.currentImageIndices[propertyId] - 1 + property.images.length) % property.images.length;
    }
  }

  // toggleWishList(propertyId: number) {
  //   const property = this.properties.find(p => p.id === propertyId);
  //   if (property) {
  //     property.wishlisted = !property.wishlisted;
  //   }
  // }

  addToCart(propertyId: number) {
    const property = this.HomePageProperties.find(p => p.id === propertyId);
    if (property) {
      // this.cartService.addToCart(product);
    }
  }

  toggleFavorite(event: any) {
    event.isFavorite = !event.isFavorite;
  }

  shareItem(item: any): void {
    const shareText = `Check out this event: ${item.title} - ${item.description} at ${item.location} on ${item.date}. Price: $${item.price}`;
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: shareText,
        url: window.location.href
      }).then(() => console.log('Shared successfully'))
        .catch(err => console.error('Sharing failed', err));
    } else {
      // Fallback for browsers that don’t support navigator.share
      console.error(`Copy and share this: ${shareText}`);
    }
  }

  toggleMap(property: PropertyDto) {
    property.activeMap = !property.activeMap;
  }
}
