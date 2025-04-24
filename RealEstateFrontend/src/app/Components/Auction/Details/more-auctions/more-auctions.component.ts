import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
  selector: 'app-more-auctions',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './more-auctions.component.html',
  styleUrl: './more-auctions.component.css'
})
export class MoreAuctionsComponent implements OnInit {
  
  days: string = '12';
  hours: string = '23';
  minutes: string = '23';
  seconds: string = '35';
  Math=Math;
  searchQuery: string = '';
  private countDownDate: number;
  private countdownSubscription: Subscription | undefined;

  constructor() {
    // Set the count down date (12 days, 23 hours, 23 minutes, 35 seconds from now)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 12);
    futureDate.setHours(futureDate.getHours() + 23);
    futureDate.setMinutes(futureDate.getMinutes() + 23);
    futureDate.setSeconds(futureDate.getSeconds() + 35);
    
    this.countDownDate = futureDate.getTime();
  }

  auctions: Auction[] = [
    {
      images: [
        'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg',
        'https://images.unsplash.com/photo-1592595896551-12b371d546d5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg',
      ],
  
      currentImageIndex: 0,
      startPrice: 1000000,
      startDate:new Date('2025-03-18'),
      endDate: new Date('2025-05-18'),
      id: 4,
      title: "Beachfront Chalet in North Coast",
      location: "North Coast, Alexandria",
      status: "Active",
      saleType: "Sell",
      // timeLeft: "5h 30m",
      bidsCount:10,
      timeProgress: 0,
      ListedBy:"agent"
    },
    {
      images: [
        'https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg',
        'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg',
        'https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg'
      ],
      currentImageIndex: 0,
      startPrice: 60000,
      endingBid: 3400000,
      startDate:new Date('2025-03-21'),
      endDate: new Date('2025-05-23'),
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
    {
      images: [
        'https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg',
        'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg',
        'https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpg'
      ],
      currentImageIndex: 0,
      startPrice: 1500000,
      startDate:new Date('2025-03-14'),
      endDate: new Date('2025-05-24'),
      id: 5,
      title: "Beachfront Chalet in North Coast",
      location: "North Coast, Alexandria",
      status: "Scheduled",
      saleType: "Sell",
      // timeLeft: "5h 30m",
      bidsCount: 15,    
      timeProgress: 0,
      ListedBy:"agent"
    },
  ];

  ngOnInit(): void {
    // Update the countdown every 1 second using RxJS interval
      this.countdownSubscription = interval(1000).subscribe(() => {
        this.updateCountdown();
        this.updateAuctionsStatus(); // This now handles progress updates
      });
  }

  
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

  if (now < start) return 0;
  if (now > end) return 100;
  
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

// Starting bid filter
startingBidMin: number | null = null;
startingBidMax: number | null = null;

imageSlideIntervals: { [auctionId: number]: any } = {};

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

}
