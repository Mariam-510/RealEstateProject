import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertyPhotoModalComponent } from '../../../Properties/Details/property-photo-modal/property-photo-modal.component';
import { PropertyDetialsLeafletMapComponent } from '../../../Properties/Details/property-detials-leaflet-map/property-detials-leaflet-map.component';
import { LeafletMapComponent } from '../../../Map/leaflet-map/leaflet-map.component';
import { MoreAuctionsComponent } from '../more-auctions/more-auctions.component';
export enum Status {
  Scheduled = 'Scheduled',
  Active = 'Active',
  Finished = 'Finished'
}
declare var bootstrap: any; // Required for Bootstrap modal handling

export interface Auction {
  id: number;
  startTime: Date;
  endTime: Date;
  startPrice: number;
  isDeleted: boolean;
  status: Status;
  agentId?: number;
  agent?: Seller;
  sellerId?: number;
  seller: Seller;
  propertyId: number;
  property: Property;
  propertyBids: PropertyBid[];
}

export interface PropertyBid {
  id: number;
  amount: number;
  bidTime: Date;
  bidderId: number;
  bidderName: string;
  bidderImage:string;
}

// Existing interfaces from your component
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
  selector: 'app-auction-details',
  imports: [CommonModule,FormsModule,PropertyPhotoModalComponent,LeafletMapComponent,MoreAuctionsComponent],
  templateUrl: './auction-details.component.html',
  styleUrl: './auction-details.component.css'
})
export class AuctionDetailsComponent implements OnInit {
  showAllBids = false;
  showMore: boolean = false;
  statusEnum = Status;

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

  // Component properties
targetDate: Date = new Date('2025-04-25T23:59:59'); // Set your auction end date
days: string = '00';
hours: string = '00';
minutes: string = '00';
seconds: string = '00';
private timer: any;
seller: Seller = {
  name: 'Property Hills',
  imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D',
  phone: '+1 234 567 8901',
  email: 'sarah@example.com',
  type: 'Agent',
};
auction: Auction = {
  id: 1,
  startTime: new Date('2025-04-01T10:00:00'),
  endTime: new Date('2025-04-25T23:59:59'),
  startPrice: 250000,
  isDeleted: false,
  status: Status.Active,
  agentId: 5,
  sellerId: 1,
  propertyId: 921376,
  seller: this.seller,
  property: this.property,
  propertyBids: [
    {
      id: 1,
      amount: 255000,
      bidTime: new Date('2025-03-05T14:30:00'),
      bidderId: 101,
      bidderName: 'John Doe',
      bidderImage: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D'  
    },
    {
      id: 2,
      amount: 258000,
      bidTime: new Date('2025-03-06T09:15:00'),
      bidderId: 102,
      bidderName: 'Anna Müller',
      bidderImage: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D'  

    },
    {
      id: 3,
      amount: 260500,
      bidTime: new Date('2025-03-08T17:45:00'),
      bidderId: 103,
      bidderName: 'Ahmed Youssef',
      bidderImage: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D'  

    },
    {
      id: 4,
      amount: 263000,
      bidTime: new Date('2025-03-10T12:00:00'),
      bidderId: 104,
      bidderName: 'Li Wei',
      bidderImage: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D'  

    },
    {
      id: 5,
      amount: 265000,
      bidTime: new Date('2025-03-12T16:30:00'),
      bidderId: 105,
      bidderName: 'Carlos López',
      bidderImage: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D'  

    },
    {
      id: 6,
      amount: 267500,
      bidTime: new Date('2025-03-15T19:00:00'),
      bidderId: 106,
      bidderName: 'Sophie Dubois',
      bidderImage: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D'  

    }
  ]
};




// Add to ngOnInit()
ngOnInit() {
  this.startCountdown();
}


private startCountdown() {
  this.timer = setInterval(() => {
    const now = new Date().getTime();
    // Determine target date based on auction status
    const targetDate = this.auction.status === Status.Scheduled 
      ? this.auction.startTime.getTime() 
      : this.auction.endTime.getTime();
    
    const distance = targetDate - now;

    if (distance < 0) {
      clearInterval(this.timer);
      this.days = this.hours = this.minutes = this.seconds = '00';
      return;
    }

    this.days = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
    this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
    this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    this.seconds = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
  }, 1000);
}

// Cleanup
ngOnDestroy() {
  if (this.timer) {
    clearInterval(this.timer);
  }
}
get highestBid(): number {
  if (!this.auction.propertyBids || this.auction.propertyBids.length === 0) {
    return this.auction.startPrice;
  }
  return Math.max(...this.auction.propertyBids.map(bid => bid.amount));
}
transform(value: Date): string {
  const diff = +new Date() - +new Date(value);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return `just now`;
}
// Add these properties to the component class
bidAmount: number | null = null;
showBidSuccess = false;
showBidError = false;
bidErrorMessage = '';

// Add this method to the component class
placeBid() {
  // Reset alert states
  this.showBidSuccess = false;
  this.showBidError = false;

  // Basic validation
  if (!this.bidAmount || this.bidAmount <= this.highestBid) {
    this.showBidError = true;
    this.bidErrorMessage = 'Bid must be higher than current bid';
    return;
  }

  if (this.auction.status !== Status.Active) {
    this.showBidError = true;
    this.bidErrorMessage = 'Auction is not active';
    return;
  }

  // Create new bid
  const newBid: PropertyBid = {
    id: this.auction.propertyBids.length + 1,
    amount: this.bidAmount,
    bidderImage: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D',

    bidTime: new Date(),
    bidderId: Math.floor(Math.random() * 1000) + 100, // Simulate random user ID
    bidderName: 'You' // This should come from user service in real app
  };

  // Add to bids array
  this.auction.propertyBids.push(newBid);
  
  // Show success feedback
  // this.showBidSuccess = true;
  
  // Reset form
  this.bidAmount = null;
  
  // Optional: Scroll to show new bid
  setTimeout(() => {
    const bidsSection = document.querySelector('.bid-list');
    if (bidsSection) {
      bidsSection.scrollTop = 0;
    }
  }, 100);
}

//-----------------------------------------------------------------------------
@ViewChild('heroSection') heroSection!: ElementRef;
  @ViewChild('AuctionCard') auctionCard!: ElementRef;
  @ViewChild('tabLinks') tabLinks!: ElementRef;

  constructor(private elRef: ElementRef,private renderer: Renderer2) { }

  sections!: NodeListOf<HTMLElement>;
  stopSection!: HTMLElement;
  isNavigationSticky: boolean = false;
  currentActiveSection: string = 'overview';
  private initialCardTop = 0;
  private stickyThreshold = 0;

  ngAfterViewInit() {
    this.calculateInitialPosition();

    this.sections = this.elRef.nativeElement.querySelectorAll('section');
    this.stopSection = this.elRef.nativeElement.querySelector('#stop-scroll')!;

    if (!this.tabLinks) {
      console.warn("tabLinks is not available in ngAfterViewInit");
      return;
    }
  }
  private calculateInitialPosition() {
    const hero = this.heroSection.nativeElement;
    const card = this.auctionCard.nativeElement;
    this.stickyThreshold = hero.offsetTop + hero.offsetHeight - card.offsetHeight;
  }

  private lastScrollTop: number = 0;
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const card = this.auctionCard.nativeElement;

    // Handle tab bar stickiness
    if (!this.tabLinks || !this.tabLinks.nativeElement) return;

    let scrollPosition = scrollY + 100;
    const tabBar = this.tabLinks.nativeElement;
    const tabBarOffset = tabBar.offsetTop;
    let flag = true;

    // Detect Scroll Direction
    const scrollingDown = (scrollY) > this.lastScrollTop;
    // console.log(card.offsetHeight);

    // Stop scrolling effect at "YOU MIGHT ALSO LIKE"
    if (this.stopSection) {
      const stopPoint = this.stopSection.offsetTop - 300;

      if (scrollingDown) {
        //card
        if (scrollPosition >= stopPoint - 300) {
          this.renderer.removeClass(card, 'fixed-event-card');
          // this.renderer.setStyle(card, 'position', 'absolute');
          this.renderer.setStyle(card, 'top', `${stopPoint - card.offsetHeight + 100}px`);
          // console.log('card-----------------------------------------');
        }
        else {
          this.renderer.addClass(card, 'fixed-event-card');
          // console.log('card************************************************');
        }
      }
      //card
      if (!scrollingDown && scrollPosition < stopPoint - 300) {
        this.renderer.addClass(card, 'fixed-event-card');
        // console.log('card#################################################');
      }

      //tabBar
      if (scrollingDown && scrollPosition >= stopPoint) {
        flag = false;
        tabBar.classList.remove('sticky'); // Remove when reaching stop section
        // this.renderer.removeClass(card, 'mt-5');
        // console.log('---------------------------------');
      }

      //tabBar
      else if (!scrollingDown && scrollPosition < stopPoint) {
        flag = true;
        tabBar.classList.add('sticky'); // Re-add when scrolling up above stop section
        // this.renderer.addClass(card, 'mt-5');
        // console.log('**************************************');

      }
    }

    // Keep tabBar sticky only when scrolling down and past the tabBar's original position
    //tabBar
    if (scrollingDown && scrollY >= tabBarOffset && flag) {
      tabBar.classList.add('sticky');
      // this.renderer.addClass(card, 'mt-5');
      // console.log('///////////////////////////////////////////////////');

    }
    else if (!scrollingDown && scrollY <= tabBarOffset + 500) {
      flag = true;
      tabBar.classList.remove('sticky'); // Return to original position when scrolling up
      // this.renderer.removeClass(card, 'mt-5');
      // console.log('####################################################');

    }

    // Change active tab based on scroll
    this.sections.forEach((section) => {
      if (
        scrollPosition >= section.offsetTop - 50 &&
        scrollPosition < section.offsetTop + section.offsetHeight && scrollingDown
      ) {
        this.setActiveTab(section.id);
        // console.log("*************************************");
      }

      if (
        scrollPosition >= section.offsetTop - 250 &&
        scrollPosition < section.offsetTop + section.offsetHeight && !scrollingDown
      ) {
        this.setActiveTab(section.id);
        // console.log("---------------------------------------------");
      }
    });

    this.lastScrollTop = scrollY; // Update last scroll position
  }

  scrollToSection(event: Event, sectionId: string) {
    event.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private setActiveTab(activeId: string) {
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
  // ngAfterViewInit() {
  //   this.calculateInitialPosition();

  //   this.sections = this.elRef.nativeElement.querySelectorAll('section');
  //   this.stopSection = this.elRef.nativeElement.querySelector('#stop-scroll')!;

  //   if (!this.tabLinks) {
  //     console.warn("tabLinks is not available in ngAfterViewInit");
  //     return;
  //   }
  // }

}
