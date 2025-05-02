import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { ListMapPropertiesComponent } from '../list-map-properties/list-map-properties.component';
import { GirdPropertiesComponent } from '../gird-properties/gird-properties.component';
import { ListPropertiesComponent } from '../list-properties/list-properties.component';
import { PropertyDTO, PropertyService } from '../../../../Services/ApiServices/property.service';
import { API_CONFIG } from '../../../../app.config';
import { Subscription } from 'rxjs';
import { PropertyFilterService } from '../../../../Services/property-filter.service';


export type ViewMode = 'grid3' | 'grid4' | 'list' | 'map';

@Component({
  selector: 'app-properties-page',
  imports: [CommonModule, RouterModule, FormsModule, NgxSliderModule,
    ListMapPropertiesComponent, GirdPropertiesComponent, ListPropertiesComponent],
  templateUrl: './properties-page.component.html',
  styleUrls: ['./properties-page.component.css']
})

export class PropertiesPageComponent implements OnInit, AfterViewInit, OnDestroy {
  properties: PropertyDTO[] = [];
  filteredProperties: PropertyDTO[] = [];
  apiConfig = API_CONFIG;

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



  // Filters
  searchQuery: string = '';
  selectedType: string = '';
  selectedCategory: string = '';
  selectedBeds: number[] = [];
  selectedBaths: number[] = [];
  minPrice = 0;
  maxPrice = Number.MAX_SAFE_INTEGER;
  minSpace = 0;
  maxSpace = 1000;
  sortBy: string = '';

  // viewMode: 'grid3' | 'grid4' | 'list' | 'map' = 'grid3';
  viewModes: { id: 'grid3' | 'grid4' | 'list' | 'map'; icon: string }[] = [
    { id: 'grid3', icon: 'bi-grid-3x3-gap' },
    { id: 'grid4', icon: 'bi-grid' },
    { id: 'list', icon: 'bi-list' },
    { id: 'map', icon: 'bi-map' }
  ];

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

  constructor(private elRef: ElementRef, private filterService: PropertyFilterService,
    private propertyService: PropertyService, private cdr: ChangeDetectorRef) {
  }


  private filterSub!: Subscription;

  async ngOnInit() {
    await this.loadProperties();

    this.minPrice = Math.min(...this.properties.map(p => p.price));
    this.maxPrice = Math.max(...this.properties.map(p => p.price));

    this.initializeComponent();
    this.setupFilterSubscription();

    this.cdr.detectChanges(); // If using ChangeDetectorRef
  }

  //------------------------------------------------------------------------------------------------------
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

  //------------------------------------------------------------------------------------------------------
  private initializeComponent() {
    this.minPrice = Math.min(...this.properties.map(p => p.price));
    this.maxPrice = Math.max(...this.properties.map(p => p.price));

    this.sliderOptions = {
      ...this.sliderOptions,
      floor: this.minPrice,
      ceil: this.maxPrice
    };

    this.minSpace = Math.min(...this.properties.map(p => p.space));
    this.maxSpace = Math.max(...this.properties.map(p => p.space));
    this.sliderOptionsSpace = {
      ...this.sliderOptionsSpace,
      floor: this.minSpace,
      ceil: this.maxSpace,
    };
    this.cdr.detectChanges(); // If using ChangeDetectorRef
  }

  private setupFilterSubscription() {
    this.filterSub = this.filterService.currentFilters.subscribe(filters => {
      this.searchQuery = filters.searchQuery;
      this.selectedType = filters.selectedType;
      this.selectedCategory = filters.selectedCategory;
      this.selectedBeds = filters.selectedBeds;
      this.selectedBaths = filters.selectedBaths;
      this.minPrice = filters.minPrice;
      this.maxPrice = filters.maxPrice;
      this.minSpace = filters.minSpace;
      this.maxSpace = filters.maxSpace;
      this.sortBy = filters.sortBy;

      this.applyFilters();
      this.cdr.detectChanges();
    });
  }

  // Update UI handlers to use service
  togglesearch(searchQuery: string): void {
    this.filterService.updateFilters({ searchQuery: searchQuery });
  }

  toggleCategory(category: string): void {
    const newCategory = category;
    this.filterService.updateFilters({ selectedCategory: newCategory });
  }

  togglePropertyType(type: string): void {
    const newType = type;
    this.filterService.updateFilters({ selectedType: newType });
  }

  toggleBed(value: number): void {
    const beds = [...this.selectedBeds];
    const index = beds.indexOf(value);
    index === -1 ? beds.push(value) : beds.splice(index, 1);
    this.filterService.updateFilters({ selectedBeds: beds });
  }

  toggleBath(value: number): void {
    const baths = [...this.selectedBaths];
    const index = baths.indexOf(value);
    index === -1 ? baths.push(value) : baths.splice(index, 1);
    this.filterService.updateFilters({ selectedBaths: baths });
  }

  updatePrice(): void {
    this.filterService.updateFilters({
      minPrice: this.minPrice,
      maxPrice: this.maxPrice
    });
    this.cdr.detectChanges(); // If using ChangeDetectorRef
  }

  updateSpace(): void {
    this.filterService.updateFilters({
      minSpace: this.minSpace,
      maxSpace: this.maxSpace
    });
  }

  updateSort(sortType: string): void {
    const newSort = sortType;
    this.filterService.updateFilters({ sortBy: newSort });
  }

  onPriceChange(): void {
    this.filterService.updateFilters({
      minPrice: this.minPrice,
      maxPrice: this.maxPrice
    });
    this.cdr.detectChanges(); // Force DOM update
  }

  clearFilters(): void {
    this.filterService.resetFilters();
    this.applyFilters();
  }

  ngOnDestroy() {
    this.filterService.resetFilters();
    if (this.filterSub) {
      this.filterSub.unsubscribe();
    }
  }


  // Filtering & Sorting
  applyFilters(): void {
    this.filteredProperties = this.properties
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
            return (property.bedRooms || 0) >= 7;
          }
          return (property.bedRooms || 0) === b;
        });

        const matchesBaths = this.selectedBaths.length === 0 || this.selectedBaths.some(b => {
          if (b === 7) {
            return (property.bathRooms || 0) >= 7;
          }
          return (property.bathRooms || 0) === b;
        });


        return matchesSearch && matchesType && matchesCategory && matchesPrice && matchesBeds && matchesBaths && matchesSpace;
      })
      .sort((a, b) => {
        switch (this.sortBy) {
          case 'priceAsc': return a.price - b.price;
          case 'priceDesc': return b.price - a.price;
          case 'dateNewest': return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
          case 'dateOldest': return new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime();
          default: return 0;
        }
      });

    this.currentPage = 1;
    this.cdr.detectChanges(); // Force DOM update
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
      { label: 'All Types', value: '', count: this.properties.length },
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

  //------------------------------------------------------------------------------------------------------

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


  // ---------------------------------------------------------------------------------------------------

  // @ViewChild('heroSection') heroSection!: ElementRef;

  @ViewChild('tabLinks') tabLinks!: ElementRef;

  stopSection!: HTMLElement;
  private stickyThreshold = 0;

  ngAfterViewInit() {
    // this.startAutoScroll();

    this.stopSection = this.elRef.nativeElement.querySelector('#stop-scroll')!;

  }
  isSticky: boolean = false;

  private lastScrollTop: number = 0;
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    // Handle tab bar stickiness
    if (!this.tabLinks || !this.tabLinks.nativeElement) return;

    let scrollPosition = scrollY;
    const tabBar = this.tabLinks.nativeElement;
    const tabBarOffset = tabBar.offsetTop;
    let flag = true;

    this.isSticky = tabBar.classList.contains('sticky');

    // Detect Scroll Direction
    const scrollingDown = (scrollY) > this.lastScrollTop;

    // Stop scrolling effect at "YOU MIGHT ALSO LIKE"
    if (this.stopSection) {

      const stopPoint = this.stopSection.offsetTop;

      if (scrollingDown) {
        //tabBar
        if (scrollingDown && scrollPosition >= stopPoint) {
          flag = false;
          tabBar.classList.remove('sticky'); // Remove when reaching stop section
          // console.log('---------------------------------');
        }

        //tabBar
        else if (!scrollingDown && scrollPosition < stopPoint) {
          flag = true;
          tabBar.classList.add('sticky'); // Re-add when scrolling up above stop section
          // console.log('**************************************');

        }
      }

      // Keep tabBar sticky only when scrolling down and past the tabBar's original position
      //tabBar
      if (scrollingDown && scrollY >= tabBarOffset && flag) {
        tabBar.classList.add('sticky');
        // console.log('///////////////////////////////////////////////////');

      }
      else if (!scrollingDown && scrollY <= tabBarOffset + 500) {
        flag = true;
        tabBar.classList.remove('sticky'); // Return to original position when scrolling up
        // console.log('####################################################');

      }

      this.lastScrollTop = scrollY; // Update last scroll position
    }

  }


  //------------------------------------------------------------------------------------------------
  auctioneers = [
    { name: 'MMB', logo: 'https://images.liveauctioneers.com/static/mail/images/auctioneers/featured_auctioneers_shapiro_368x208.jpg?quality=90&width=368' },
    { name: 'Shapiro Auctions', logo: 'https://images.liveauctioneers.com/static/mail/images/auctioneers/featured_auctioneers_lelandlittle_368x208.jpg?quality=90&width=184' },
    { name: 'Antique Arena', logo: 'https://images.liveauctioneers.com/static/mail/images/auctioneers/featured_auctioneers_woody_368x208.jpg?quality=90&width=184' },
    { name: 'Bonhams', logo: 'https://images.liveauctioneers.com/static/mail/images/auctioneers/featured_auctioneers_heritage_368x208.jpg?quality=90&width=184' },
    { name: 'Top Notch Collections', logo: 'https://images.liveauctioneers.com/static/mail/images/auctioneers/featured_auctioneers_hill_368x208.jpg?quality=90&width=184' },
    { name: 'New Orleans Auction Galleries', logo: "https://images.liveauctioneers.com/static/mail/images/auctioneers/featured_auctioneer_bonhams_368x208.jpg?quality=90&width=184" },
    { name: 'MMB', logo: 'https://images.liveauctioneers.com/static/mail/images/auctioneers/featured_auctioneers_shapiro_368x208.jpg?quality=90&width=368' },
    { name: 'Shapiro Auctions', logo: 'https://images.liveauctioneers.com/static/mail/images/auctioneers/featured_auctioneers_lelandlittle_368x208.jpg?quality=90&width=184' },
    { name: 'Antique Arena', logo: 'https://images.liveauctioneers.com/static/mail/images/auctioneers/featured_auctioneers_woody_368x208.jpg?quality=90&width=184' },
    { name: 'Bonhams', logo: 'https://images.liveauctioneers.com/static/mail/images/auctioneers/featured_auctioneers_heritage_368x208.jpg?quality=90&width=184' },
    { name: 'Top Notch Collections', logo: 'https://images.liveauctioneers.com/static/mail/images/auctioneers/featured_auctioneers_hill_368x208.jpg?quality=90&width=184' },
    { name: 'New Orleans Auction Galleries', logo: "https://images.liveauctioneers.com/static/mail/images/auctioneers/featured_auctioneer_bonhams_368x208.jpg?quality=90&width=184" }
  ];

  // @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  // isLeftDisabled = true;
  // isRightDisabled = true;


  // // Add these variables to the component class
  // private autoScrollInterval: any;
  // private isMouseOver = false;
  // // Add new variable
  // private scrollAmount = 0;
  // private maxScroll = 0;
  // // Add these methods to the component class
  // public startAutoScroll() {
  //   this.autoScrollInterval = setInterval(() => {
  //     const el = this.sliderContainer.nativeElement;
  //     const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
  //     const atStart = el.scrollLeft <= 1;

  //     if (this.isScrollingRight && atEnd) {
  //       this.isScrollingRight = false;
  //     } else if (!this.isScrollingRight && atStart) {
  //       this.isScrollingRight = true;
  //     }

  //     el.scrollBy({
  //       left: this.isScrollingRight ? 1 : -1,
  //       behavior: 'auto'
  //     });
  //   }, 10);
  // }

  // pauseAutoScroll(): void {
  //   this.isMouseOver = true;
  // }

  // resumeAutoScroll(): void {
  //   this.isMouseOver = false;
  // }


  // private isScrollingRight = true;
  // isContentVisible = false;

  // @ViewChild('sliderContainer') sliderContainer!: ElementRef;


  // public stopAutoScroll() {
  //   if (this.autoScrollInterval) {
  //     clearInterval(this.autoScrollInterval);
  //   }
  // }

}
