import { CommonModule } from '@angular/common';
import { Component, HostListener, ViewChild, ElementRef, AfterViewInit, Renderer2, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RecommendedComponent } from '../recommended/recommended.component';
import { CardmapComponent } from '../cardmap/cardmap.component';
import { PropertyDetialsLeafletMapComponent } from '../property-detials-leaflet-map/property-detials-leaflet-map.component';
import { PropertyPhotoModalComponent } from '../property-photo-modal/property-photo-modal.component';
import { SharedServiceService, PropertyDto } from '../../../../Services/shared-service.service';
import { ChatmodalComponent } from '../../../Chat/chatmodal/chatmodal.component';

declare var bootstrap: any; // Required for Bootstrap modal handling

export interface Seller {
  name: string;
  imageUrl: string;
  phone: string;
  email: string;
  type: 'Seller' | 'Agent';
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  type: 'Sell' | 'Rent';
  price: number;
  status: 'Available' | 'Sold' | 'Auctioned';
  propertyCategory: string;
  area: number;
  postedDate: number;
  images: string[];
  agent: {
    id: number;
    name: string;
  };
  isFavorite: boolean;
}
@Component({
  selector: 'app-property-details',
  imports: [
    CommonModule,
    RouterModule,
    PropertyPhotoModalComponent,
    RecommendedComponent,
    CardmapComponent,
    PropertyDetialsLeafletMapComponent,
    ChatmodalComponent
  ],
  templateUrl: './property-details.component.html',
  styleUrl: './property-details.component.css'
})
export class PropertyDetailsComponent implements AfterViewInit {
  properties: PropertyDto[] = [];
  Math = Math;
  icons = [
    {
      src: 'icons/Bed.svg',
      alt: 'Bedroom Icon',
      value: '5',
      label: 'Bedrooms'
    },
    {
      src: 'icons/Bath.svg',
      alt: 'Bathroom Icon',
      value: '5',
      label: 'Bathrooms'
    },
    {
      src: 'icons/Area.svg',
      alt: 'Indoor Area Icon',
      value: '350 SqM',
      label: 'Indoor Area'
    },
    {
      src: 'icons/Complete.svg',
      alt: 'Completed Icon',
      value: 'Jan 2022',
      label: 'Completed'
    }
  ];

  showMore: boolean = false;
  seller: Seller = {
    name: 'Property Hills',
    imageUrl: 'details/d2.jpg',
    phone: '+1 234 567 8901',
    email: 'sarah@example.com',
    type: 'Agent',
  };

  property: Property = {
    id: 'U921376',
    title: "5 Bedroom Villa for sale at El Rehab Extension",
    description: "This spacious and stylish 5-bedroom villa offers the perfect blend of luxury, comfort, and modern design. Located in a prestigious neighborhood, the villa features expansive living areas, a fully equipped gourmet kitchen, and large windows that flood the space with natural light. Each of the five bedrooms is generously sized, including a master suite with a walk-in closet and a spa-like ensuite bathroom. Outside, you'll find a beautifully landscaped garden, a private swimming pool, and ample space for entertaining guests. Ideal for families or those who love to host, this villa provides a serene retreat while being conveniently close to schools, shops, and recreational facilities.",
    location: "6th of October",
    type: "Sell",
    price: 250000,
    status: "Available",
    propertyCategory: "Villa",
    isFavorite: true,
    area: 350,
    postedDate: 7,
    images: [
      "details/property4.jpg",
      "details/property5.jpg"
    ],
    agent: {
      id: 5,
      name: "Marta Lazic"
    },

  };

  @ViewChild(PropertyPhotoModalComponent) photosModalComp!: PropertyPhotoModalComponent;
  @ViewChild('tabLinks') tabLinks!: ElementRef;
  @ViewChild('heroSection') heroSection!: ElementRef;
  @ViewChild('buyNowCard') buyNowCard!: ElementRef;

  sections!: NodeListOf<HTMLElement>;
  stopSection!: HTMLElement;
  isNavigationSticky: boolean = false;
  currentActiveSection: string = 'overview';
  isFavorited: boolean = false;

  private lastScrollTop: number = 0;
  private navBarHeight: number = 0;

  constructor(private renderer: Renderer2, private elRef: ElementRef, private sharedService: SharedServiceService) { }

  openPhotosModal() {
    this.photosModalComp.openModal();
  }


  ngOnInit(): void {
    this.properties = this.sharedService.properties;
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

  toggleMapCard(property: PropertyDto) {
    property.activeMap = !property.activeMap;
  }
  ngAfterViewInit(): void {
    console.log(scrollY);
    // Give DOM time to render completely
    setTimeout(() => {
      this.sections = this.elRef.nativeElement.querySelectorAll('section');
      this.stopSection = this.elRef.nativeElement.querySelector('#stop-scroll') ||
        document.createElement('div'); // Fallback if not found

      // Set navBarHeight for calculations
      if (this.tabLinks && this.tabLinks.nativeElement) {
        this.navBarHeight = this.tabLinks.nativeElement.offsetHeight;
      }

      // Initial check for scroll position (if page is refreshed while scrolled)
      this.onWindowScroll();
    }, 0);
    // Add this code to ensure modal z-index is set correctly after view init
    setTimeout(() => {
      const modalElement = document.getElementById('shareLocationModal');
      const modalBackdrop = document.querySelector('.modal-backdrop') as HTMLElement;

      if (modalElement) {
        modalElement.style.zIndex = '9999';
      }

      if (modalBackdrop) {
        modalBackdrop.style.zIndex = '9998';
      }
    }, 0);
  }
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollingDown = scrollY > this.lastScrollTop;

    // Handle tab bar stickiness
    if (!this.tabLinks || !this.tabLinks.nativeElement) return;

    let scrollPosition = scrollY + 100;
    const tabBar = this.tabLinks.nativeElement;
    const tabBarOffset = tabBar.offsetTop;
    let flag = true;
    if (this.stopSection) {
      const stopPoint = this.stopSection.offsetTop - 100;

      if (scrollingDown && scrollPosition >= stopPoint) {
        flag = false;
        tabBar.classList.remove('sticky'); // Remove when reaching stop section
        // console.log('---------------------------------');
        console.log('sticky remove 1');

      }
      else if (!scrollingDown && scrollPosition < stopPoint) {
        flag = true;
        tabBar.classList.add('sticky'); // Re-add when scrolling up above stop section
        // console.log('**************************************');

      }


    }
    if (scrollingDown && scrollY >= tabBarOffset && flag) {
      tabBar.classList.add('sticky');
      console.log('sticky added 2');

      // console.log('///////////////////////////////////////////////////');

    }
    else if (!scrollingDown && scrollY <= tabBarOffset + 500) {
      flag = true;
      tabBar.classList.remove('sticky'); // Return to original position when scrolling up
      console.log('sticky remove 2');

      // console.log('####################################################');

    }

    // Handle card stickiness
    if (this.buyNowCard && this.buyNowCard.nativeElement) {
      const card = this.buyNowCard.nativeElement;
      const cardInitialOffset = this.heroSection.nativeElement.offsetTop +
        this.heroSection.nativeElement.offsetHeight / 2;
      const stopPoint = this.stopSection ?
        this.stopSection.offsetTop - card.offsetHeight - 650 :
        Number.MAX_SAFE_INTEGER;

      // Apply fixed position when scrolled past initial position but before stop point
      if (scrollY >= cardInitialOffset + 250 && scrollY < stopPoint) {
        this.renderer.addClass(card, 'fixed-event-card');
        console.log('fixed-event-card added');
        this.renderer.setStyle(card, 'top', `${this.navBarHeight + 20}px`);
      }
      // Position absolute at stop point to keep it from going further
      else if (scrollY >= stopPoint) {
        this.renderer.removeClass(card, 'fixed-event-card');
        this.renderer.setStyle(card, 'top', `${stopPoint - card.offsetHeight - 400}px`);

        console.log('fixed-event-card removed');
        // this.renderer.setStyle(card, 'position', 'absolute');
        // this.renderer.setStyle(card, 'top', `${stopPoint}px`);
      }
      // Return to initial position only if we're above the cardInitialOffset
      else if (scrollY < cardInitialOffset + 250) {
        this.renderer.removeClass(card, 'fixed-event-card');
        console.log('fixed-event-card removed');
        this.renderer.removeStyle(card, 'position');
        this.renderer.removeStyle(card, 'top');
      }
    }

    // Update active section based on scroll position
    this.updateActiveSection(scrollY);

    // Store current scroll position for direction detection
    this.lastScrollTop = scrollY;
  }

  private updateActiveSection(scrollY: number) {
    // Add offset for the sticky header
    const offset = this.isNavigationSticky ? this.navBarHeight + 50 : 50;

    this.sections.forEach((section) => {
      const sectionTop = section.offsetTop - offset;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        this.setActiveTab(section.id);
      }
    });
  }

  scrollToSection(event: Event, sectionId: string) {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = this.isNavigationSticky ? this.navBarHeight : 0;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset + 20,
        behavior: 'smooth'
      });
    }
  }

  private setActiveTab(activeId: string) {
    if (!this.tabLinks || !this.tabLinks.nativeElement) return;

    const tabs = this.tabLinks.nativeElement.querySelectorAll('a');
    tabs.forEach((tab: HTMLElement) => {
      tab.classList.remove('active');
      if (tab.getAttribute('href')?.includes(activeId)) {
        tab.classList.add('active');
      }
    });
  }

  isMapVisible: boolean = true;

  toggleMap() {
    this.isMapVisible = !this.isMapVisible;
  }

  locationUrl: string = 'cairo, Egypt';

  openShareModal() {
    this.locationUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.property.location)}`;

    // Open Bootstrap Modal
    const modalElement = document.getElementById('shareLocationModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.locationUrl);
  }
<<<<<<< Updated upstream
=======


  get displayedDescription(): string {
    if (!this.property?.description) return '';
  
    const desc = this.property.description;
    const shortDesc = desc.slice(0, 200) + (desc.length > 200 ? '...' : '');
  
    return (this.showMore ? desc : shortDesc).replace(/\n/g, '<br>');
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
>>>>>>> Stashed changes
}
