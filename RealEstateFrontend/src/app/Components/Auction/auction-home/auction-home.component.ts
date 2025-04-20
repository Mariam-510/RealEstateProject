import { CommonModule, } from '@angular/common';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
interface Auction {
  id: number;
  title: string;
  images: string[];
  currentImageIndex: number;
  startPrice: number;
  startDate: Date;
  location: string;
  status: 'Scheduled' | 'Active' | 'Finished';
  saleType: 'Sell' | 'Rent';
  // timeLeft:string;
  bidsCount:number;
  mouseStartX?: number;
  endDate:Date;
  endingBid?: number;
  timeProgress: number; // Add this
  ListedBy:string

}


@Component({
  selector: 'app-auction-home',
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './auction-home.component.html',
  styleUrl: './auction-home.component.css'
})
export class AuctionHomeComponent implements OnInit, OnDestroy {
  
  days: string = '12';
  hours: string = '23';
  minutes: string = '23';
  seconds: string = '35';
  Math=Math;
  searchQuery: string = '';
  private countdownSubscription: Subscription | undefined;
  private countDownDate: number;
  filteredAuctions: Auction[] = [];

  constructor() {
    // Set the count down date (12 days, 23 hours, 23 minutes, 35 seconds from now)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 12);
    futureDate.setHours(futureDate.getHours() + 23);
    futureDate.setMinutes(futureDate.getMinutes() + 23);
    futureDate.setSeconds(futureDate.getSeconds() + 35);
    
    this.countDownDate = futureDate.getTime();
  }

  ngOnInit(): void {
    // Update the countdown every 1 second using RxJS interval
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.updateCountdown();
      this.updateAuctionsStatus(); // This now handles progress updates
    });
// Initialize filtered auctions and pagination
this.filteredAuctions = [...this.auctions];
this.updatePagination(); // Add this line
  }
  // Add to your component class
getProgress(auction: Auction): number {
  const now = new Date().getTime();
  const start = auction.startDate.getTime();
  const end = auction.endDate.getTime();

  if (now < start) return 0;
  if (now > end) return 100;
  
  const elapsed = now - start;
  const totalDuration = end - start;
  return (elapsed / totalDuration) * 100;
}

getTimeProgress(auction: Auction): number {
  const now = new Date().getTime();
  const start = auction.startDate.getTime();
  const end = auction.endDate.getTime();

  if (now < start) return 0; // Auction hasn't started
  if (now > end) return 100; // Auction finished
  
  const totalDuration = end - start;
  const elapsed = now - start;
  const progress = (elapsed / totalDuration) * 100;

  return Math.min(progress, 100); // Cap at 100%
}



private updateAuctionsStatus(): void {
  const now = new Date();
  this.auctions.forEach(auction => {
    // Update status
    if (now < auction.startDate) {
      auction.status = 'Scheduled';
    } else if (now > auction.endDate) {
      auction.status = 'Finished';
    } else {
      auction.status = 'Active';
    }
    
    // Calculate progress here
    auction.timeProgress = this.getTimeProgress(auction);
  });
}
// Modify your existing ngOnInit to include status updates

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    window.removeEventListener('resize', this.resizeListener);
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
  }

  private updateCountdown(): void {
    // Get today's date and time
    const now = new Date().getTime();
    
    // Find the distance between now and the count down date
    const distance = this.countDownDate - now;
    
    if (distance > 0) {
      // Time calculations for days, hours, minutes and seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      // Format values with leading zeros if needed
      this.days = days < 10 ? '0' + days : days.toString();
      this.hours = hours < 10 ? '0' + hours : hours.toString();
      this.minutes = minutes < 10 ? '0' + minutes : minutes.toString();
      this.seconds = seconds < 10 ? '0' + seconds : seconds.toString();
    } else {
      // If the countdown is finished
      this.days = '00';
      this.hours = '00';
      this.minutes = '00';
      this.seconds = '00';
    }
  }

  categories = [
    { label: 'All', icon: 'bi-grid', active: true }, // New "All" category

    { label: 'This week', icon: 'bi-calendar-week'  , active: false},
    { label: 'Scheduled auctions', icon: 'bi-hourglass-top' , active: false },
    { label: 'Live auctions', icon: 'bi-broadcast', active: false },
    { label: 'Ending Soon', icon: 'bi-hourglass-split', active: false },
    { label: 'Ended auctions', icon: 'bi-clock-history', active: false },
    { label: 'For Sale', icon: 'bi-cash', active: false },
    { label: 'For Rent', icon: 'bi-house-door', active: false }
  ];
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
  
  setActive(selected: any) {
    this.categories.forEach(c => c.active = false);
    selected.active = true;
    
    // If "All" is selected, clear category-specific filters
    if (selected.label === 'All') {
      this.applyFilters();
    } else {
      this.applyFilters();
    }
    
  }

  selectedSortLabel = 'Sort by Starting Bid';
selectedSortIcon = 'bi-filter';

sortByPrice(order: 'asc' | 'desc' | 'none') {
  switch (order) {
    case 'asc':
      this.selectedSortLabel = 'High to Low';
      this.selectedSortIcon = 'bi-sort-down';
    

      // this.displayedAuctions.sort((a, b) => a.startPrice - b.startPrice);
      break;
    case 'desc':
      this.selectedSortLabel = 'Low to High';
      this.selectedSortIcon = 'bi-sort-up';

      // this.displayedAuctions.sort((a, b) => b.startPrice - a.startPrice);
      break;
    default:
      this.selectedSortLabel = 'Sort by Starting Bid';
      this.selectedSortIcon = 'bi-filter';
      // this.displayedAuctions = [...this.originalAuctions];
  }
}
selectedCategoryLabel: string = 'Select Category'; // Default label
selectedCategoryIcon: string = 'bi-funnel'; // Default icon (Rent)
  
selectCategory(category: string) {
  if (category === 'rent') {
    this.selectedCategoryLabel = 'Rent';
    this.selectedCategoryIcon = 'bi-house-door'; // Rent icon
  } else if (category === 'sell') {
    this.selectedCategoryLabel = 'Sell';
    this.selectedCategoryIcon = 'bi-cash'; // Sell icon
  }
  else{
    this.selectedCategoryLabel = 'Select Category';
    this.selectedCategoryIcon =  'bi-funnel'; // Sell icon

  }
  this.applyFilters(); // Add this line to trigger filtering

}
// Starting bid filter
startingBidMin: number | null = null;
startingBidMax: number | null = null;

// Date filters
startDate: string | null = null;
endDate: string | null = null;
listedBy: string = ''; // '' for all, 'seller' or 'agent'




imageSlideIntervals: { [auctionId: number]: any } = {};
startImageSlider(auction: Auction): void {
  if (!this.imageSlideIntervals[auction.id]) {
    this.imageSlideIntervals[auction.id] = setInterval(() => {
      this.nextImage(auction);
    }, 1000); // change interval time as needed
  }
}

stopImageSlider(auction: Auction): void {
  const intervalId = this.imageSlideIntervals[auction.id];
  if (intervalId) {
    clearInterval(intervalId);
    delete this.imageSlideIntervals[auction.id];
    this.resetSlider(auction);
  }
}



startSlider(auction: Auction, event: MouseEvent): void {
  auction.mouseStartX = event.clientX;
}

// auction-list.component.ts
handleMouseMove(auction: Auction, event: MouseEvent): void {
  if (!auction.mouseStartX) return;
  
  const sensitivity = 50; // Pixels needed to move for slide change
  const deltaX = event.clientX - auction.mouseStartX;

  if (Math.abs(deltaX) > sensitivity) {
    if (deltaX > 0) {
      this.nextImage(auction); // Right movement
    } else {
      this.prevImage(auction); // Left movement
    }
    auction.mouseStartX = event.clientX;
  }
}

goToImage(auction: Auction, index: number): void {
  auction.currentImageIndex = index;
}

nextImage(auction: Auction): void {
  auction.currentImageIndex = 
    (auction.currentImageIndex + 1) % auction.images.length;
}

prevImage(auction: Auction): void {
  auction.currentImageIndex =
    (auction.currentImageIndex - 1 + auction.images.length) % auction.images.length;
}

resetSlider(auction: Auction): void {
  auction.currentImageIndex = 0;
  delete auction.mouseStartX;
}
// --------------------------------------------------------------------------
auctions: Auction[] = [
  {
   
    images: [
      'https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg',
      // 'https://unsplash.com/photos/outdoor-lamps-turned-on-XbwHrt87mQ0.jpg',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg'
    ],
    currentImageIndex: 0,
    startPrice: 1000,
    startDate:new Date('2025-04-16'),
    endDate: new Date('2025-04-21'),

    id: 1,
    title: "Luxury Villa with Pool in Maadi",
    location: "Maadi, Cairo",
    status: "Active",
    saleType: "Sell",
    // timeLeft: "2h 15m",
    bidsCount:2,
    timeProgress: 0, // Add this
    ListedBy:"seller"

  },
  {
 
    images: [
      'https://images.unsplash.com/photo-1534655610770-dd69616f05ff?q=80&w=2156&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg',
      // 'https://unsplash.com/photos/outdoor-lamps-turned-on-XbwHrt87mQ0.jpg',
      'https://images.unsplash.com/photo-1595330449916-e7c3e1962bd3?q=80&w=1973&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg',
      'https://images.unsplash.com/photo-1585129777188-94600bc7b4b3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGFwYXJ0bWVudCUyMGJ1aWxkaW5nfGVufDB8fDB8fHww.jpg',
      'https://images.unsplash.com/photo-1718660762165-311e0f8e4818?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg',
      'https://images.unsplash.com/photo-1721567216621-b5305de86a68?q=80&w=1982&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg'

    ],
    currentImageIndex: 0,
    startPrice:50000,
    startDate:new Date('2025-05-19'),
    endDate: new Date('2025-07-25'),
    id: 2,
    title: "Modern Apartment in New Cairo",
    location: "New Cairo, Cairo",
    status: "Scheduled",
    saleType: "Rent",
    // timeLeft: "1d 4h",
    bidsCount:3,
    timeProgress: 0, // Add this
    ListedBy:"seller"


  },
  {
 
    images: [
      'https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg',
      // 'https://unsplash.com/photos/outdoor-lamps-turned-on-XbwHrt87mQ0.jpg',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg'
    ],
    currentImageIndex: 0,
    startPrice: 7000,
    startDate:new Date('2025-03-18'),
    endDate: new Date('2025-04-17'),
    id: 3,
    title: "Beachfront Chalet in North Coast",
    location: "North Coast, Alexandria",
    status: "Finished",
    saleType: "Sell",
    // timeLeft: "5h 30m",
    bidsCount:5,
    endingBid:4000000,
    timeProgress: 0,
    ListedBy:"seller"


  },
  {
    images: [
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg',
      // 'https://unsplash.com/photos/outdoor-lamps-turned-on-XbwHrt87mQ0.jpg',
      'https://images.unsplash.com/photo-1592595896551-12b371d546d5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg',
    ],

    currentImageIndex: 0,
    startPrice: 1500000,
    startDate:new Date('2025-04-18'),
    endDate: new Date('2025-05-18'),
    id: 4,
    title: "Beachfront Chalet in North Coast",
    location: "North Coast, Alexandria",
    status: "Active",
    saleType: "Sell",
    // timeLeft: "5h 30m",
    bidsCount:7,
    timeProgress: 0,
    ListedBy:"agent"



  },
  {
    images: [
      'https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg',
      // 'https://unsplash.com/photos/outdoor-lamps-turned-on-XbwHrt87mQ0.jpg',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg'
    ],
    currentImageIndex: 0,
    startPrice: 1500000,
    startDate:new Date('2025-04-19'),
    endDate: new Date('2025-05-4'),
    id: 5,
    title: "Beachfront Chalet in North Coast",
    location: "North Coast, Alexandria",
    status: "Scheduled",
    saleType: "Sell",
    // timeLeft: "5h 30m",
    bidsCount:0,    
    timeProgress: 0,
    ListedBy:"agent"




  },
  {
  
    images: [
      'https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg',
      // 'https://unsplash.com/photos/outdoor-lamps-turned-on-XbwHrt87mQ0.jpg',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg'
    ],
    currentImageIndex: 0,
    startPrice: 1500000,
    endingBid: 6600000,
    startDate:new Date('2025-03-18'),
    endDate: new Date('2025-04-20'),
    id: 6,
    title: "Beachfront Chalet in North Coast",
    location: "Bibliotheca Alexandrina, Alexandria, Egypt",
    status: "Finished",
    saleType: "Sell",
    // timeLeft: "5h 30m",
    bidsCount:20,
    timeProgress: 0,
    ListedBy:"agent"



  },
  {
    images: [
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg',
      // 'https://unsplash.com/photos/outdoor-lamps-turned-on-XbwHrt87mQ0.jpg',
      'https://images.unsplash.com/photo-1592595896551-12b371d546d5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg',
    ],

    currentImageIndex: 0,
    startPrice: 1500000,
    startDate:new Date('2025-04-20'),
    endDate: new Date('2025-05-18'),
    id: 4,
    title: "Beachfront Chalet in North Coast",
    location: "North Coast, Alexandria",
    status: "Active",
    saleType: "Sell",
    // timeLeft: "5h 30m",
    bidsCount:7,
    timeProgress: 0,
    ListedBy:"agent"



  },
  {
    images: [
      'https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg',
      // 'https://unsplash.com/photos/outdoor-lamps-turned-on-XbwHrt87mQ0.jpg',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg'
    ],
    currentImageIndex: 0,
    startPrice: 1500000,
    startDate:new Date('2025-04-22'),
    endDate: new Date('2025-10-4'),
    id: 5,
    title: "Beachfront Chalet in North Coast",
    location: "North Coast, Alexandria",
    status: "Scheduled",
    saleType: "Sell",
    // timeLeft: "5h 30m",
    bidsCount:0,    
    timeProgress: 0,
    ListedBy:"agent"




  },
  {
  
    images: [
      'https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg',
      // 'https://unsplash.com/photos/outdoor-lamps-turned-on-XbwHrt87mQ0.jpg',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg'
    ],
    currentImageIndex: 0,
    startPrice: 1100000,
    endingBid: 3400000,
    startDate:new Date('2025-04-25'),
    endDate: new Date('2026-01-25'),
    id: 6,
    title: "Beachfront Chalet in Gouna",
    location: "Gouna, Egypt",
    status: "Finished",
    saleType: "Rent",
    // timeLeft: "5h 30m",
    bidsCount:20,
    timeProgress: 0,
    ListedBy:"agent"



  },
 
  // Add more mock auctions
  
];
getDaysLeft(endDate: Date, status: string): string {
  if (status === 'Finished') {
    return 'Auction Ended';
  }

  const now = new Date();
  const end = new Date(endDate);
  const timeDiff = end.getTime() - now.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (daysLeft < 0) return 'Auction Ended';
  if (daysLeft === 0) return 'Last Day';
  return `${daysLeft} Day${daysLeft !== 1 ? 's' : ''} Left`;
}
// In your component class
hoveredAuction: number | null = null;

showTimeTooltip(auction: Auction): void {
  this.hoveredAuction = auction.id;
}

hideTimeTooltip(): void {
  this.hoveredAuction = null;
}

getElapsedTime(auction: Auction): string {
  const now = new Date().getTime();
  const start = auction.startDate.getTime();
  const end = auction.endDate.getTime();
  
  if (now < start) return 'Not started';
  if (now > end) return 'Auction ended';
  
  const elapsed = now - start;
  return this.formatDuration(elapsed);
}

getRemainingTime(auction: Auction): string {
  const now = new Date().getTime();
  const end = auction.endDate.getTime();
  
  if (now > end) return '0h 0m';
  if (now < auction.startDate.getTime()) {
    const untilStart = auction.startDate.getTime() - now;
    return `Starts in ${this.formatDuration(untilStart)}`;
  }
  
  const remaining = end - now;
  return this.formatDuration(remaining);
}
// Update the formatDuration method in your component
private formatDuration(ms: number): string {
  if (ms <= 0) return '0d 0h 0m';
  
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  let result = '';
  if (days > 0) result += `${days}d `;
  result += `${hours}h ${minutes}m`;
  return result;
}

getAuctionStatusMessage(auction: Auction): string {
  const now = new Date();
  if (now < auction.startDate) return 'Starting Soon';
  if (now > auction.endDate) return 'Ended';
  return 'Live Auction';
}

@ViewChild('scrollContainer') scrollContainer!: ElementRef;
@ViewChild('scrollContainer') scrollContainerRef!: ElementRef<HTMLDivElement>;

  isLeftDisabled = true;
  isRightDisabled = true;
  private resizeListener = () => {
    setTimeout(() => this.checkScrollButtons());
  };
  
  ngAfterViewInit() {
    setTimeout(() => this.checkScrollButtons());
    window.addEventListener('resize', this.resizeListener);
    setTimeout(() => {
      this.checkScrollButtons();
      this.startAutoScroll(); // Start auto-scroll after view initializes
    });
    window.addEventListener('resize', this.resizeListener);
    this.startAutoScroll();
  }



  checkScrollButtons(): void {
    const container = this.scrollContainerRef.nativeElement;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
  
    this.isLeftDisabled = scrollLeft <= 0;
    this.isRightDisabled = scrollLeft + clientWidth >= scrollWidth - 1;
  }
  
  scrollLeft(container: HTMLElement): void {
    container.scrollBy({ left: -200, behavior: 'smooth' });
    setTimeout(() => this.checkScrollButtons(), 300); // Wait for smooth scroll
  }
  
  scrollRight(container: HTMLElement): void {
    container.scrollBy({ left: 200, behavior: 'smooth' });
    setTimeout(() => this.checkScrollButtons(), 300); // Wait for smooth scroll
  }
  
  onScroll() {
    setTimeout(() => this.checkScrollButtons());
  }
  // Add these variables to the component class
private autoScrollInterval: any;
private isMouseOver = false;
  // Add new variable
  private scrollAmount = 0;
  private maxScroll = 0;
// Add these methods to the component class
public startAutoScroll() {
  this.autoScrollInterval = setInterval(() => {
    const el = this.sliderContainer.nativeElement;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
      const atStart = el.scrollLeft <= 1;

      if (this.isScrollingRight && atEnd) {
        this.isScrollingRight = false;
      } else if (!this.isScrollingRight && atStart) {
        this.isScrollingRight = true;
      }

      el.scrollBy({
        left: this.isScrollingRight ? 1 : -1,
        behavior: 'auto'
      });
    }, 10);
}

pauseAutoScroll(): void {
  this.isMouseOver = true;
}

resumeAutoScroll(): void {
  this.isMouseOver = false;
}
// ____________________________________________________________________________________




  private isScrollingRight = true;
  isContentVisible = false;

  @ViewChild('sliderContainer') sliderContainer!: ElementRef;

 
  public stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
  }

  toggleContent() {
    this.isContentVisible = !this.isContentVisible;
  }
// __________________________________FILTERS______________________________________
applyFilters(): void {
  this.filteredAuctions = this.auctions.filter(auction => {
    // Search Filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      const titleMatch = auction.title.toLowerCase().includes(query);
      const locationMatch = auction.location.toLowerCase().includes(query);
      if (!titleMatch && !locationMatch) return false;
    }

    // Starting Bid Filter
    if (this.startingBidMin !== null && auction.startPrice < this.startingBidMin) return false;
    if (this.startingBidMax !== null && auction.startPrice > this.startingBidMax) return false;

    // Date Filters
    if (this.startDate) {
      const filterStart = new Date(this.startDate);
      if (auction.startDate < filterStart) return false;
    }
    if (this.endDate) {
      const filterEnd = new Date(this.endDate);
      if (auction.endDate > filterEnd) return false;
    }
// if(this.listedBy){
//   if(auction.ListedBy.toLowerCase()!=this.listedBy.toLowerCase())return false;
// }
    // Sale Type Filter (Listed By)
    if (this.listedBy && auction.ListedBy.toLowerCase() !== this.listedBy.toLowerCase()) return false;
    const activeCategory = this.categories.find(c => c.active);

    // Category-specific filters
    if (activeCategory) {
      const now = new Date();
      switch (activeCategory.label) {
        case 'All': // This case can be removed since we check above
        return true;
        case 'This week':
          const weekRange = this.getWeekRange();
          return auction.startDate >= weekRange.start && 
                 auction.startDate <= weekRange.end;

        case 'Scheduled auctions':
          return auction.status === 'Scheduled';

        case 'Live auctions':
          return auction.status === 'Active';

       // In applyFilters() method
case 'Ending Soon':
  return auction.status === 'Active' && auction.timeProgress > 90;

        case 'Ended auctions':
          return auction.status === 'Finished';

        case 'For Sale':
          return auction.saleType === 'Sell';

        case 'For Rent':
          return auction.saleType === 'Rent';

        default:
          return true;
      }
    }
    return true;
  });
  this.updatePagination();
  this.currentPage = 1;


  
}
private getWeekRange(): { start: Date, end: Date } {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay()); // Sunday start
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}
resetFilters(): void {
  this.startingBidMin = null;
  this.startingBidMax = null;
  this.startDate = null;
  this.endDate = null;
  this.listedBy = '';
  this.applyFilters();
}
// Pagination variables
currentPage: number = 1;
itemsPerPage: number = 6;
totalPages: number = 1;
// Add this to your component class
Array = Array;
// Pagination methods
get paginatedAuctions(): Auction[] {
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  return this.filteredAuctions.slice(startIndex, startIndex + this.itemsPerPage);
}


previousPage(): void {
  if (this.currentPage > 1) this.currentPage--;
}

nextPage(): void {
  if (this.currentPage < this.totalPages) this.currentPage++;
}

goToPage(page: number): void {
  if (page >= 1 && page <= this.totalPages) this.currentPage = page;
}
// Update these methods in your component
getPageNumbers(): number[] {
  return Array.from({length: this.totalPages}, (_, i) => i + 1);
}

updatePagination(): void {
  this.totalPages = Math.ceil(this.filteredAuctions.length / this.itemsPerPage);
  this.currentPage = Math.min(this.currentPage, this.totalPages);
}
}

