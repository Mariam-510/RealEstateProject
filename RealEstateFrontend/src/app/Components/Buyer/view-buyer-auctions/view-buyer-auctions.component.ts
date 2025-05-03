import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { AuctionDTO, AuctionDTOShow, AuctionService } from '../../../Services/ApiServices/auction.service';
import { API_CONFIG } from '../../../app.config';
import { AuthService } from '../../../Services/ApiServices/auth.service';
interface Auction {
  id: number;
  title: string;
  images: string[];
  currentImageIndex: number;
  startPrice: number;
  startDate: Date;
  endDate: Date;
  location: string;
  status: 'Scheduled' | 'Active' | 'Finished';
  saleType: 'Sell' | 'Rent';
  bidsCount: number;
  endingBid?: number;
  timeProgress: number;
  ListedBy: string;
  mouseStartX?: number;
}

@Component({
  selector: 'app-view-buyer-auctions',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './view-buyer-auctions.component.html',
  styleUrl: './view-buyer-auctions.component.css'
})
export class ViewBuyerAuctionsComponent implements OnInit {

  days: string = '12';
  hours: string = '23';
  minutes: string = '23';
  seconds: string = '35';
  Math = Math;
  searchQuery: string = '';
  private countDownDate: number;
  private countdownSubscription: Subscription | undefined;
  auctions: AuctionDTOShow[] = [];
  filteredAuctions: AuctionDTOShow[] = [];

  constructor(private auctionService: AuctionService, private auth: AuthService, private router: Router,
    private cdr: ChangeDetectorRef) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 12);
    this.countDownDate = futureDate.getTime();
  }


  async ngOnInit() {

    if (!this.hasRole('Buyer')) {
      this.router.navigate(['/login']);
    }
    else {
      this.loadUserAuctions();
      this.setupCountdown();
    }
    // else{
    //   this.router.navigate(['/login']);
    // }
  }

  private setupCountdown(): void {
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.updateCountdown();
      this.updateAuctionsStatus();
    });
  }

  isLoading = false;

  loadUserAuctions(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.auctionService.getAuctionsByBuyerId().subscribe({
      next: (auctions) => {
        this.auctions = auctions.map(dto => ({
          ...dto,
          currentImageIndex: dto.currentImageIndex ?? 0,
          timeProgress: dto.timeProgress ?? 0,
          mouseStartX: dto.mouseStartX ?? undefined
        }));

        this.filteredAuctions = [...this.auctions];
        this.initializeAuctionStates();
        this.currentPage = 1;
        this.updatePagination();
        console.log('Auctions loaded:', this.auctions);
      },
      error: (error) => {
        console.error('Failed to load auctions.', error);
        // this.error = 'Failed to load auctions. Please try again later.'; // Add error message
      },
      complete: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }

    });
  }

  private calculateStatus(auction: AuctionDTOShow): string {
    const now = new Date();
    const start = new Date(auction.startTime);
    const end = new Date(auction.endTime);

    if (now < start) return 'Scheduled';
    if (now > end) return 'Finished';
    return 'Active';
  }

  private initializeAuctionStates(): void {
    this.auctions.forEach(auction => {
      auction.status = this.calculateStatus(auction);
      auction.timeProgress = this.getTimeProgress(auction);
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
  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }
  getTimeProgress(auction: AuctionDTOShow): number {
    const now = new Date().getTime();
    const start = new Date(auction.startTime).getTime();
    const end = new Date(auction.endTime).getTime();

    if (now < start) return 0;
    if (now > end) return 100;

    const totalDuration = end - start;
    const elapsed = now - start;
    const progress = (elapsed / totalDuration) * 100;

    return Math.min(progress, 100);
  }

  private updateAuctionsStatus(): void {
    const now = new Date();
    this.auctions.forEach(auction => {
      auction.status = this.calculateStatus(auction);
      auction.timeProgress = this.getTimeProgress(auction);
    });
  }
  get paginatedAuctions(): AuctionDTOShow[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.auctions.slice(startIndex, startIndex + this.itemsPerPage);
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
  apiConfig = API_CONFIG;

  stopImageSlider(auction: AuctionDTOShow): void {
    const intervalId = this.imageSlideIntervals[auction.id];
    if (intervalId) {
      clearInterval(intervalId);
      delete this.imageSlideIntervals[auction.id];
      this.resetSlider(auction);
    }
  }

  startSlider(auction: AuctionDTOShow, event: MouseEvent): void {
    auction.mouseStartX = event.clientX;
  }

  handleMouseMove(auction: AuctionDTOShow, event: MouseEvent): void {
    if (!auction.mouseStartX) return;

    const sensitivity = 50;
    const deltaX = event.clientX - auction.mouseStartX;

    if (Math.abs(deltaX) > sensitivity) {
      auction.currentImageIndex = deltaX > 0
        ? (auction.currentImageIndex! + 1) % (auction.propertyDto?.images?.length || 1)
        : (auction.currentImageIndex! - 1 + (auction.propertyDto?.images?.length || 1)) % (auction.propertyDto?.images?.length || 1);
      auction.mouseStartX = event.clientX;
    }
  }


  goToImage(auction: AuctionDTOShow, index: number): void {
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

  resetSlider(auction: AuctionDTOShow): void {
    auction.currentImageIndex = 0;
    auction.mouseStartX = null;
  }



  getDaysLeft(endTime: Date, status: string): string {
    if (status === 'Finished') return 'Auction Ended';

    const now = new Date();
    const end = new Date(endTime);
    const timeDiff = end.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysLeft < 0) return 'Auction Ended';
    if (daysLeft === 0) return 'Last Day';
    return `${daysLeft} Day${daysLeft !== 1 ? 's' : ''} Left`;
  }

  // In your component class
  hoveredAuction: number | null = null;

  showTimeTooltip(auction: AuctionDTOShow): void {
    this.hoveredAuction = auction.id;
  }

  hideTimeTooltip(): void {
    this.hoveredAuction = null;
  }

  getElapsedTime(auction: AuctionDTOShow): string {
    const now = new Date().getTime();
    const start = new Date(auction.startTime).getTime(); // Add explicit Date conversion
    const end = new Date(auction.endTime).getTime(); // Add explicit Date conversion

    if (now < start) return 'Not started';
    if (now > end) return 'Auction ended';

    const elapsed = now - start;
    return this.formatDuration(elapsed);
  }

  getRemainingTime(auction: AuctionDTOShow): string {
    const now = new Date().getTime();
    const end = new Date(auction.endTime).getTime(); // Add explicit Date conversion

    if (now > end) return '0h 0m';
    const start = new Date(auction.startTime).getTime(); // Add explicit Date conversion
    if (now < start) {
      const untilStart = start - now;
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

  getAuctionStatusMessage(auction: AuctionDTOShow): string {
    const now = new Date();
    if (now < auction.startTime) return 'Starting Soon';
    if (now > auction.endTime) return 'Ended';
    return 'Live Auction';
  }
  currentPage: number = 1;
  itemsPerPage: number = 6; // adjust per your layout

  totalPages: number = 1;
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
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.auctions.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
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
