import { CommonModule, } from '@angular/common';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { AuctionDTOShow, AuctionService } from '../../../../Services/ApiServices/auction.service';
import { API_CONFIG } from '../../../../app.config';
import { ToastrService } from '../../../../Services/toastr.service';
import { AuthService } from '../../../../Services/ApiServices/auth.service';
import { lastValueFrom } from 'rxjs';
import { SignalRService } from '../../../../Services/SignalRServices/signal-r.service';


@Component({
  selector: 'app-auction-home',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auction-home.component.html',
  styleUrl: './auction-home.component.css'
})
export class AuctionHomeComponent implements OnInit, OnDestroy {

  days: string = '12';
  hours: string = '23';
  minutes: string = '23';
  seconds: string = '35';
  Math = Math;
  searchQuery: string = '';
  private countdownSubscription: Subscription | undefined;
  filteredAuctions: AuctionDTOShow[] = [];
  auctions: AuctionDTOShow[] = [];
  apiConfig = API_CONFIG;

  nearestAuction: AuctionDTOShow | null = null;

  constructor(private auth: AuthService, private route: ActivatedRoute,
    private toastr: ToastrService, private cdr: ChangeDetectorRef,
    private auctionService: AuctionService, private signalrService: SignalRService) {
  }


  isLoading = true;
  errorMessage = '';

  async ngOnInit() {
    await this.signalrService.startConnection(); // Add this first

    await this.loadAuctions();

    // Bind handlers
    this.signalrService.listenToAuctionListUpdates(this.updateSingleAuction.bind(this));
    this.signalrService.listenToAllAuctions(this.updateAuctions.bind(this));
    this.signalrService.listenToNewAuctions(this.addNewAuction.bind(this));
    this.signalrService.listenToDeletedAuctions(this.removeAuction.bind(this));

    // Update the countdown every 1 second using RxJS interval
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.updateCountdown();
      this.updateAuctionsStatus(); // This now handles progress updates
    });
    // Initialize filtered auctions and pagination
    this.filteredAuctions = [...this.auctions];
    this.applyFilters(); // Add this line
  }


  async loadAuctions(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      // Get auctions from service
      const auctions = await lastValueFrom(
        this.auctionService.getAllAuctions()
      );

      // Update component state
      this.auctions = auctions;

      this.auctions = auctions.map(auction => ({
        ...auction,
        startTime: new Date(auction.startTime),  // Convert string to Date
        endTime: new Date(auction.endTime)      // Convert string to Date
      }));

      console.log(this.auctions);

      this.nearestAuction = this.getNearestAuction(this.auctions);

      this.filteredAuctions = [...this.auctions];
      this.applyFilters();
    } catch (error) {
      console.error('Error loading auctions:', error);
      this.errorMessage = 'Failed to load auctions. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }


  private addNewAuction(auction: AuctionDTOShow) {
    const processedAuction = {
      ...auction,
      startTime: new Date(auction.startTime),
      endTime: new Date(auction.endTime)
    };

    if (!this.auctions.some(a => a.id === processedAuction.id)) {
      this.auctions = [processedAuction, ...this.auctions];
      this.auctions = this.auctions.map(auction => ({
        ...auction,
        startTime: new Date(auction.startTime),  // Convert string to Date
        endTime: new Date(auction.endTime)      // Convert string to Date
      }));

      // this.filteredAuctions = [...this.auctions];
      this.applyFilters(false);
      this.updatePagination();
      this.nearestAuction = this.getNearestAuction(this.auctions);
    }
  }

  private removeAuction(auctionId: number) {
    this.auctions = this.auctions.filter(a => a.id !== auctionId);
    this.auctions = this.auctions.map(auction => ({
      ...auction,
      startTime: new Date(auction.startTime),  // Convert string to Date
      endTime: new Date(auction.endTime)      // Convert string to Date
    }));

    // Update filteredAuctions and pagination
    // this.filteredAuctions = [...this.auctions];
    this.applyFilters(false);
    this.nearestAuction = this.getNearestAuction(this.auctions);
  }

  private updateSingleAuction(updatedAuction: AuctionDTOShow) {
    const index = this.auctions.findIndex(a => a.id === updatedAuction.id);

    if (index > -1) {
      // Merge updates
      this.auctions[index] = {
        ...this.auctions[index],
        ...updatedAuction,
        bids: updatedAuction.bids || this.auctions[index].bids,
      };
    } else {
      this.auctions = [updatedAuction, ...this.auctions];
    }

    this.auctions = this.auctions.map(auction => ({
      ...auction,
      startTime: new Date(auction.startTime),  // Convert string to Date
      endTime: new Date(auction.endTime)      // Convert string to Date
    }));

    // Update filteredAuctions and pagination
    // this.filteredAuctions = [...this.auctions];
    this.applyFilters(false);
    this.updatePagination();
    this.nearestAuction = this.getNearestAuction(this.auctions);
  }

  private updateAuctions(auctions: AuctionDTOShow[]) {
    this.auctions = auctions;
    this.auctions = this.auctions.map(auction => ({
      ...auction,
      startTime: new Date(auction.startTime),  // Convert string to Date
      endTime: new Date(auction.endTime)      // Convert string to Date
    }));

    // Update filteredAuctions and pagination
    // this.filteredAuctions = [...this.auctions];
    this.applyFilters(false);
    this.nearestAuction = this.getNearestAuction(this.auctions);
  }


  ngOnDestroy() {
    this.countdownSubscription?.unsubscribe();
    this.signalrService.hubConnection.stop();
    // Clean up listeners
    this.signalrService.hubConnection.off('ReceiveAllAuctions');
    this.signalrService.hubConnection.off('NewAuctionCreated');
    this.signalrService.hubConnection.off('AuctionDeleted');
    this.signalrService.hubConnection.off('AuctionListUpdate');

    // Unsubscribe to prevent memory leaks
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
  }


  private getNearestAuction(auctions: AuctionDTOShow[]): AuctionDTOShow | null {
    const now = new Date();

    // Filter and sort in one pass for better performance
    const upcomingAuctions = auctions.filter(auction =>
      auction.startTime.getTime() > now.getTime()
    );

    if (upcomingAuctions.length === 0) return null;

    // Find the minimum start time using reduce
    return upcomingAuctions.reduce((prev, current) =>
      (prev.startTime.getTime() < current.startTime.getTime()) ? prev : current
    );
  }


  // Add to your component class
  getProgress(auction: AuctionDTOShow): number {
    const now = new Date().getTime();
    const start = auction.startTime.getTime();
    const end = auction.endTime.getTime();

    if (now < start) return 0;
    if (now > end) return 100;

    const elapsed = now - start;
    const totalDuration = end - start;
    return (elapsed / totalDuration) * 100;
  }



  getTimeProgress(auction: AuctionDTOShow): number {
    const now = new Date().getTime();
    const start = auction.startTime.getTime();
    const end = auction.endTime.getTime();

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
      if (now < auction.startTime) {
        auction.status = 'Scheduled';
      } else if (now > auction.endTime) {
        auction.status = 'Finished';
      } else {
        auction.status = 'Active';
      }

      // Calculate progress here
      auction.timeProgress = this.getTimeProgress(auction);
    });
  }
  // Modify your existing ngOnInit to include status updates

  private updateCountdown(): void {
    // Get today's date and time
    const now = new Date().getTime();

    let countDown = new Date().getTime();
    if (this.nearestAuction) {
      countDown = this.nearestAuction?.startTime.getTime();
    }

    // Find the distance between now and the count down date
    const distance = countDown - now;

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

    { label: 'This week', icon: 'bi-calendar-week', active: false },
    { label: 'Scheduled auctions', icon: 'bi-hourglass-top', active: false },
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
    else {
      this.selectedCategoryLabel = 'Select Category';
      this.selectedCategoryIcon = 'bi-funnel'; // Sell icon

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
  startImageSlider(auction: AuctionDTOShow): void {
    if (!this.imageSlideIntervals[auction.id]) {
      this.imageSlideIntervals[auction.id] = setInterval(() => {
        this.nextImage(auction);
      }, 1000); // change interval time as needed
    }
  }

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

  // auction-list.component.ts
  handleMouseMove(auction: AuctionDTOShow, event: MouseEvent): void {
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

  goToImage(auction: AuctionDTOShow, index: number): void {
    auction.currentImageIndex = index;
  }

  nextImage(auction: AuctionDTOShow): void {
    auction.currentImageIndex =
      ((auction.currentImageIndex ?? 0) + 1) % (auction.propertyDto?.images?.length ?? 0);
  }

  prevImage(auction: AuctionDTOShow): void {
    auction.currentImageIndex =
      ((auction.currentImageIndex ?? 0) - 1 + (auction.propertyDto?.images?.length ?? 0)) % (auction.propertyDto?.images?.length ?? 0);
  }

  resetSlider(auction: AuctionDTOShow): void {
    auction.currentImageIndex = 0;
    delete auction?.mouseStartX;
  }
  // --------------------------------------------------------------------------
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

  showTimeTooltip(auction: AuctionDTOShow): void {
    this.hoveredAuction = auction.id;
  }

  hideTimeTooltip(): void {
    this.hoveredAuction = null;
  }

  getElapsedTime(auction: AuctionDTOShow): string {
    const now = new Date().getTime();
    const start = auction.startTime.getTime();
    const end = auction.endTime.getTime();

    if (now < start) return 'Not started';
    if (now > end) return 'Auction ended';

    const elapsed = now - start;
    return this.formatDuration(elapsed);
  }

  getRemainingTime(auction: AuctionDTOShow): string {
    const now = new Date().getTime();
    const end = auction.endTime.getTime();

    if (now > end) return '0h 0m';
    if (now < auction.startTime.getTime()) {
      const untilStart = auction.startTime.getTime() - now;
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

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  // @ViewChild('scrollContainer') scrollContainerRef!: ElementRef<HTMLDivElement>;

  isLeftDisabled = true;
  isRightDisabled = true;

  ngAfterViewInit() {

    this.startAutoScroll();
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
  applyFilters(changePage: boolean = true): void {
    this.filteredAuctions = this.auctions.filter(auction => {
      // Search Filter
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        const titleMatch = auction.propertyDto?.title.toLowerCase().includes(query);
        const locationMatch = auction.propertyDto?.location.toLowerCase().includes(query);
        if (!titleMatch && !locationMatch) return false;
      }

      // Starting Bid Filter
      if (this.startingBidMin !== null && auction.startPrice < this.startingBidMin) return false;
      if (this.startingBidMax !== null && auction.startPrice > this.startingBidMax) return false;

      // Date Filters
      if (this.startDate) {
        const filterStart = new Date(this.startDate);
        if (auction.startTime < filterStart) return false;
      }
      if (this.endDate) {
        const filterEnd = new Date(this.endDate);
        if (auction.endTime > filterEnd) return false;
      }
      // if(this.listedBy){
      //   if(auction.ListedBy.toLowerCase()!=this.listedBy.toLowerCase())return false;
      // }
      // Sale Type Filter (Listed By)
      const listByStr = auction.agentId ? 'Agent' : 'Seller';
      if (this.listedBy && listByStr.toLowerCase() !== this.listedBy.toLowerCase()) return false;

      const activeCategory = this.categories.find(c => c.active);

      // Category-specific filters
      if (activeCategory) {
        const now = new Date();
        switch (activeCategory.label) {
          case 'All': // This case can be removed since we check above
            return true;
          case 'This week':
            const weekRange = this.getWeekRange();
            return auction.startTime >= weekRange.start &&
              auction.startTime <= weekRange.end;

          case 'Scheduled auctions':
            return auction.status === 'Scheduled';

          case 'Live auctions':
            return auction.status === 'Active';

          // In applyFilters() method
          case 'Ending Soon':
            return auction.status === 'Active' && (auction?.timeProgress ?? 0) > 90;

          case 'Ended auctions':
            return auction.status === 'Finished';

          case 'For Sale':
            return auction.propertyDto?.type === 'Sell';

          case 'For Rent':
            return auction.propertyDto?.type === 'Rent';

          default:
            return true;
        }
      }
      return true;
    });

    if (changePage) {
      this.updatePagination();
      this.currentPage = 1;
    }

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
  get paginatedAuctions(): AuctionDTOShow[] {
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
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredAuctions.length / this.itemsPerPage);
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

