import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { LeafletMapComponent } from '../../../Map/leaflet-map/leaflet-map.component';
import { PropertyDTO, PropertyService } from '../../../../Services/ApiServices/property.service';
import { API_CONFIG } from '../../../../app.config';
import { WishListService } from '../../../../Services/ApiServices/wish-list.service';
import { ToastrService } from '../../../../Services/toastr.service';
import { PropertyFilterService } from '../../../../Services/property-filter.service';
import { AuthService } from '../../../../Services/ApiServices/auth.service';

@Component({
  selector: 'app-property-home',
  imports: [CommonModule, RouterModule, FormsModule, LeafletMapComponent, NgxSliderModule],
  templateUrl: './property-home.component.html',
  styleUrl: './property-home.component.css'
})
export class PropertyHomeComponent implements OnInit {

  HomePageProperties: PropertyDTO[] = [];
  properties: PropertyDTO[] = [];
  filteredProperties: PropertyDTO[] = [];
  apiConfig = API_CONFIG;


  // Filters
  // searchQuery = '';
  selectedType = '';
  selectedCategory = '';
  selectedBeds: number[] = [];
  selectedBaths: number[] = [];
  selectedCity = '';
  minPrice = 0;
  maxPrice = Number.MAX_SAFE_INTEGER;
  minSpace = 0;
  maxSpace = Number.MAX_SAFE_INTEGER;

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

  // cities = [
  //   { name: 'New Cairo' },
  //   { name: 'Maadi' },
  //   { name: 'Giza' },
  //   { name: 'Nasr City' }
  // ];

  cities = [
    // Cairo Governorate
    { name: 'Cairo' },          // Capital

    // Alexandria Governorate
    { name: 'Alexandria' },      // Mediterranean port city

    // Giza Governorate
    { name: 'Giza' },            // Home of the Pyramids
    { name: '6th of October City' }, // Industrial hub
    { name: 'Sheikh Zayed City' },   // Suburban community

    // Upper Egypt
    { name: 'Luxor' },           // Ancient Thebes
    { name: 'Aswan' },           // Nile River city
    { name: 'Qena' },
    { name: 'Sohag' },
    { name: 'Minya' },

    // Delta Region
    { name: 'Tanta' },           // Gharbia Governorate
    { name: 'Mansoura' },        // Dakahlia Governorate
    { name: 'Zagazig' },         // Sharqia Governorate
    { name: 'Damietta' },        // Port city

    // Sinai Peninsula
    { name: 'Sharm El Sheikh' }, // Red Sea resort
    { name: 'Dahab' },           // Diving destination
    { name: 'El Arish' },        // North Sinai capital

    // Red Sea Governorate
    { name: 'Hurghada' },        // Tourist hotspot
    { name: 'Marsa Alam' },      // Southern resort

    // Canal Cities
    { name: 'Port Said' },       // Suez Canal entrance
    { name: 'Ismailia' },        // Suez Canal midpoint
    { name: 'Suez' },            // Southern canal city

    // Oases & Desert Cities
    { name: 'Siwa Oasis' },      // Western Desert
    { name: 'Bahariya Oasis' },
    { name: 'Kharga Oasis' },

    // New Cities (Under Construction)
    { name: 'New Administrative Capital' }, // Future capital
    { name: 'New Alamein City' }            // Mediterranean project
  ];



  sliderOptions: Options = {
    floor: 0,
    ceil: Number.MAX_SAFE_INTEGER,
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

  constructor(private cdr: ChangeDetectorRef, private elRef: ElementRef, private toastr: ToastrService,
    private propertyService: PropertyService, private wishListService: WishListService, private router: Router,
    private filterService: PropertyFilterService, private auth: AuthService) { }


  async ngOnInit() {
    await this.loadProperties();

    // In your component
    this.HomePageProperties = this.properties
      .filter(property => property.status.toLowerCase() !== 'sold')
      .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
      .slice(0, 3);

    this.sliderStartAutoScroll();

    this.HomePageProperties.forEach(HomePageProperties => {
      this.currentImageIndices[HomePageProperties.id] = 0;
    });

    this.minPrice = Math.min(...this.properties.map(p => p.price));
    this.maxPrice = Math.max(...this.properties.map(p => p.price));
    this.sliderOptions.ceil = this.maxPrice;

    this.minSpace = Math.min(...this.properties.map(p => p.space));
    this.maxSpace = Math.max(...this.properties.map(p => p.space));
    this.sliderOptionsSpace.ceil = this.maxSpace;


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

    // this.checkScroll();

  }

  // In your component
  async loadProperties(
    category?: string,
    status?: string,
    type?: string,
    searchByLocation?: string
  ) {
    try {
      this.properties = await this.propertyService.getAll(
        category,
        status,
        type,
        searchByLocation
      ).toPromise() ?? [];

      console.log('Loaded properties:', this.properties);
      this.cdr.detectChanges(); // If using ChangeDetectorRef
    } catch (err) {
      console.error('Error loading properties:', err);
      // Handle error (show message, etc.)
    }
  }


  categoriesName() {
    return [
      { name: 'Apartment' },
      { name: 'Villa' },
      { name: 'House' },
      { name: 'Studio' },
      { name: 'Penthouse' },
      { name: 'Duplex' },
      { name: 'Townhouse' },
      { name: 'Mansion' }
    ];
  }

  propertyTypes() {
    return [
      // { label: 'All Types', value: '', count: this.properties.length },
      { label: 'For Sale', value: 'Sell', count: this.properties.filter(p => p.type === 'Sell').length },
      { label: 'For Rent', value: 'Rent', count: this.properties.filter(p => p.type === 'Rent').length }
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

  // UI Handlers
  toggleCategory(category: string): void {
    // this.selectedCategory = category === 'All Categories' ? '' : category;
    this.selectedCategory = category;
  }

  togglePropertyType(type: string): void {
    // this.selectedType = this.selectedType === type ? '' : type;
    // this.selectedType = type === 'All Types' ? '' : type;
    this.selectedType = type;
  }

  toggleCityType(type: string): void {
    // this.selectedCity = this.selectedCity === type ? '' : type;
    // this.selectedCity = type === 'All Cities' ? '' : type;
    this.selectedCity = type;
  }

  toggleBed(value: number): void {
    const index = this.selectedBeds.indexOf(value);
    index === -1 ? this.selectedBeds.push(value) : this.selectedBeds.splice(index, 1);
  }

  toggleBath(value: number): void {
    const index = this.selectedBaths.indexOf(value);
    index === -1 ? this.selectedBaths.push(value) : this.selectedBaths.splice(index, 1);
  }

  // Update navigation method
  goToViewAll() {
    this.filterService.updateFilters({
      searchQuery: this.selectedCity,
      selectedType: this.selectedType,
      selectedCategory: this.selectedCategory,
      selectedBeds: this.selectedBeds,
      selectedBaths: this.selectedBaths,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      minSpace: this.minSpace,
      maxSpace: this.maxSpace
    });

    this.router.navigate(['/properties/all']);
  }

  locationView(location: string, event: Event) {
    event.preventDefault(); // Prevent default anchor behavior

    this.filterService.updateFilters({
      searchQuery: location
    });

    this.router.navigate(['/properties/all']);
  }

  CategoryView(cat: string, event: Event) {
    event.preventDefault(); // Prevent default anchor behavior

    this.filterService.updateFilters({
      selectedCategory: cat
    });

    this.router.navigate(['/properties/all']);
  }


  SellView(event: Event) {
    event.preventDefault(); // Prevent default anchor behavior

    this.filterService.updateFilters({
      selectedType: 'Sell'
    });

    this.router.navigate(['/properties/all']);
  }


  RentView(event: Event) {
    event.preventDefault(); // Prevent default anchor behavior

    this.filterService.updateFilters({
      selectedType: 'Rent'
    });

    this.router.navigate(['/properties/all']);
  }


  get totalPages(): number {
    return Math.ceil(this.filteredProperties.length / this.itemsPerPage);
  }

  get paginatedProperties(): PropertyDTO[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProperties.slice(start, start + this.itemsPerPage);
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


  toggleFavorite(property: PropertyDTO) {
    // Optimistic UI update
    const previousState = property.isFavorite;
    property.isFavorite = !previousState;

    this.wishListService.togglePropertyWishlist(property.id).subscribe({
      next: (response) => {
        this.toastr.success(response);
        // Optional: Update with actual API state if needed
      },
      error: (err) => {
        // Revert UI state on error
        property.isFavorite = previousState;
        this.toastr.error('Error updating wishlist');
        console.error(err);
      }
    });
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

  toggleMap(property: PropertyDTO) {
    property.activeMap = !property.activeMap;
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
