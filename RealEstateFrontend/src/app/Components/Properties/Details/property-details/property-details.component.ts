import { CommonModule } from '@angular/common';
import { Component, HostListener, ViewChild, ElementRef, AfterViewInit, Renderer2, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RecommendedComponent } from '../recommended/recommended.component';
import { CardmapComponent } from '../cardmap/cardmap.component';
import { PropertyDetialsLeafletMapComponent } from '../property-detials-leaflet-map/property-detials-leaflet-map.component';
import { PropertyPhotoModalComponent } from '../property-photo-modal/property-photo-modal.component';
import { ChatmodalComponent } from '../../../Chat/chatmodal/chatmodal.component';
import { PropertyDTO, PropertyService } from '../../../../Services/ApiServices/property.service';
import { AuthService } from '../../../../Services/ApiServices/auth.service';
import { WishListService } from '../../../../Services/ApiServices/wish-list.service';
import { ToastrService } from '../../../../Services/toastr.service';
import { lastValueFrom } from 'rxjs';
import { API_CONFIG } from '../../../../app.config';

declare var bootstrap: any; // Required for Bootstrap modal handling

@Component({
  selector: 'app-property-details',
  imports: [
    CommonModule, RouterModule, PropertyPhotoModalComponent, RecommendedComponent, CardmapComponent,
    PropertyDetialsLeafletMapComponent, ChatmodalComponent,
  ],
  templateUrl: './property-details.component.html',
  styleUrl: './property-details.component.css'
})
export class PropertyDetailsComponent implements AfterViewInit {
  Math = Math;
  icons: any;

  showMore: boolean = false;

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

  constructor(private renderer: Renderer2, private elRef: ElementRef, private cdr: ChangeDetectorRef,
    private propertyService: PropertyService, private wishListService: WishListService,
    private auth: AuthService, private route: ActivatedRoute, private toastr: ToastrService
  ) { }

  openPhotosModal() {
    this.photosModalComp.openModal();
  }

  apiConfig = API_CONFIG;
  property!: PropertyDTO | null;

  isLoading = true;

  async ngOnInit() {
    try {
      const propertyId = Number(this.route.snapshot.paramMap.get('id'));
      await this.loadProperty(propertyId);

      // Initialize icons after property is loaded
      this.icons = this.createIcons();
    } catch (error) {
      // Handle error
    } finally {
      this.isLoading = false;
    }
  }

  async loadProperty(id: number) {
    try {
      const property$ = this.propertyService.getById(id);
      const result = await lastValueFrom(property$);

      if (!result) {
        throw new Error('Property not found');
      }

      this.property = result;
    } catch (err) {
      this.property = null;
      console.error('Error loading property:', err);
      // Consider redirecting to error page or showing message
    }
  }

  private createIcons() {
    return [
      {
        src: 'icons/Bed.svg',
        alt: 'Bedroom Icon',
        value: this.property?.bedRooms ?? 0,
        label: 'Bedrooms'
      },
      {
        src: 'icons/Bath.svg',
        alt: 'Bathroom Icon',
        value: this.property?.bathRooms ?? 0,  // Fix typo: bathRooms
        label: 'Bathrooms'
      },
      {
        src: 'icons/Area.svg',
        alt: 'Indoor Area Icon',
        value: this.property?.space ?? 0,
        label: 'Indoor Area'
      },
      {
        src: 'icons/Complete.svg',
        alt: 'Completed Icon',
        value: this.property?.addedDate,  // Keep as undefined if missing
        label: 'Completed'
      }
    ];
  }



  toggleFavorite(property: PropertyDTO | null) {
    // Optimistic UI update
    if (property != null) {
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

  toggleMapCard(property: PropertyDTO) {
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
        // console.log('sticky remove 1');

      }
      else if (!scrollingDown && scrollPosition < stopPoint) {
        flag = true;
        tabBar.classList.add('sticky'); // Re-add when scrolling up above stop section
        // console.log('**************************************');

      }


    }
    if (scrollingDown && scrollY >= tabBarOffset && flag) {
      tabBar.classList.add('sticky');
      // console.log('sticky added 2');

      // console.log('///////////////////////////////////////////////////');

    }
    else if (!scrollingDown && scrollY <= tabBarOffset + 500) {
      flag = true;
      tabBar.classList.remove('sticky'); // Return to original position when scrolling up
      // console.log('sticky remove 2');

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
        // console.log('fixed-event-card added');
        this.renderer.setStyle(card, 'top', `${this.navBarHeight + 20}px`);
      }
      // Position absolute at stop point to keep it from going further
      else if (scrollY >= stopPoint) {
        this.renderer.removeClass(card, 'fixed-event-card');
        this.renderer.setStyle(card, 'top', `${stopPoint - card.offsetHeight - 400}px`);

        // console.log('fixed-event-card removed');
        // this.renderer.setStyle(card, 'position', 'absolute');
        // this.renderer.setStyle(card, 'top', `${stopPoint}px`);
      }
      // Return to initial position only if we're above the cardInitialOffset
      else if (scrollY < cardInitialOffset + 250) {
        this.renderer.removeClass(card, 'fixed-event-card');
        // console.log('fixed-event-card removed');
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
    this.locationUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.property?.location ?? '')}`;

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
}
