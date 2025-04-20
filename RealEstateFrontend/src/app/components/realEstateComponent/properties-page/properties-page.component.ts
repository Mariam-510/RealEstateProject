import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { ListMapPropertiesComponent } from '../list-map-properties/list-map-properties.component';
import { GirdPropertiesComponent } from '../gird-properties/gird-properties.component';
import { ListPropertiesComponent } from '../list-properties/list-properties.component';
import { Agent, PropertyDto, SharedService } from '../../../Service/shared.service';

export type ViewMode = 'grid3' | 'grid4' | 'list' | 'map';

@Component({
  selector: 'app-properties-page',
  imports: [CommonModule, RouterModule, FormsModule, NgxSliderModule,
    ListMapPropertiesComponent, GirdPropertiesComponent, ListPropertiesComponent],
  templateUrl: './properties-page.component.html',
  styleUrls: ['./properties-page.component.css']
})

export class PropertiesPageComponent implements OnInit, AfterViewInit {
  properties: PropertyDto[] = [];
  filteredProperties: PropertyDto[] = [];

  // Filters
  searchQuery = '';
  selectedType = '';
  selectedCategory = '';
  selectedBeds: number[] = [];
  selectedBaths: number[] = [];
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

  constructor(private sharedService: SharedService, private elRef: ElementRef) {
  }

  featuredAgents: Agent[] = [];

  ngOnInit(): void {
    this.properties = this.sharedService.properties;

    this.minPrice = Math.min(...this.properties.map(p => p.price));
    this.maxPrice = Math.max(...this.properties.map(p => p.price));
    this.sliderOptions.ceil = this.maxPrice;

    this.minSpace = Math.min(...this.properties.map(p => p.space));
    this.maxSpace = Math.max(...this.properties.map(p => p.space));
    this.sliderOptionsSpace.ceil = this.maxSpace;

    this.featuredAgents = this.sharedService.featuredAgents;

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
    if (!this.selectedCategory) return this.properties.length;
    const category = this.categoriesWithCounts.find(c => c.name === this.selectedCategory);
    return category ? category.count : 0;
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
    this.properties.forEach(p => {
      counts.set(p.propertyCategory, (counts.get(p.propertyCategory) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  }

  get propertyTypes() {
    return [
      { label: 'All Types', value: '', count: this.properties.length },
      { label: 'For Sell', value: 'Sell', count: this.properties.filter(p => p.type === 'Sell').length },
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
    this.minPrice = Math.min(...this.properties.map(p => p.price));
    this.maxPrice = Math.max(...this.properties.map(p => p.price));
    this.minSpace = Math.min(...this.properties.map(p => p.space));
    this.maxSpace = Math.max(...this.properties.map(p => p.space));
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


  // ---------------------------------------------------------------------------------------------------

  // @ViewChild('heroSection') heroSection!: ElementRef;

  @ViewChild('tabLinks') tabLinks!: ElementRef;

  stopSection!: HTMLElement;
  private stickyThreshold = 0;

  ngAfterViewInit() {
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

}
