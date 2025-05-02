import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { AuctionDTOShow, AuctionService } from '../../../../Services/ApiServices/auction.service';
import { API_CONFIG } from '../../../../app.config';
import { SignalRService } from '../../../../Services/SignalRServices/signal-r.service';
import { lastValueFrom } from 'rxjs';


@Component({
  selector: 'app-more-auctions',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './more-auctions.component.html',
  styleUrl: './more-auctions.component.css'
})
export class MoreAuctionsComponent implements OnInit, OnDestroy {

  Math = Math;

  auctions: AuctionDTOShow[] = [];
  apiConfig = API_CONFIG;

  constructor(private auctionService: AuctionService, private signalrService: SignalRService,
    private cdr: ChangeDetectorRef
  ) { }

  isLoading = true;
  errorMessage = '';
  @Input() auctionModel: AuctionDTOShow | null = null;

  async ngOnInit() {
    await this.signalrService.startConnection(); // Add this first

    await this.loadAuctions();

    // Bind handlers
    this.signalrService.listenToAuctionListUpdates(this.updateSingleAuction.bind(this));
    this.signalrService.listenToAllAuctions(this.updateAuctions.bind(this));
    this.signalrService.listenToNewAuctions(this.addNewAuction.bind(this));
    this.signalrService.listenToDeletedAuctions(this.removeAuction.bind(this));
    this.signalrService.listenToCheckStatusUpdates(this.checkStatus.bind(this));


    this.updateAuctionsStatus();
  }

  // Add this inside your component class
  getSimilarAuctions(): AuctionDTOShow[] {
    if (!this.auctionModel || !this.auctions?.length) return [];

    // Filter auctions with the same property type, excluding the current auction
    return this.auctions.filter(auction =>
      auction.propertyDto?.type === this.auctionModel?.propertyDto?.type &&
      auction.id !== this.auctionModel?.id
    ).slice(0, 3); // Get first 3 matches
  }

  // Usage in template or elsewhere:
  similarAuctions = this.getSimilarAuctions();


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


      this.similarAuctions = this.getSimilarAuctions();

      console.log(this.auctions);

    } catch (error) {
      console.error('Error loading auctions:', error);
      this.errorMessage = 'Failed to load auctions. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }

  private updateAuctions(auctions: AuctionDTOShow[]) {
    this.auctions = auctions;
    this.auctions = this.auctions.map(auction => ({
      ...auction,
      startTime: new Date(auction.startTime),  // Convert string to Date
      endTime: new Date(auction.endTime)      // Convert string to Date
    }));
    this.similarAuctions = this.getSimilarAuctions();

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
    }

    this.similarAuctions = this.getSimilarAuctions();
  }

  private removeAuction(auctionId: number) {
    this.auctions = this.auctions.filter(a => a.id !== auctionId);
    this.auctions = this.auctions.map(auction => ({
      ...auction,
      startTime: new Date(auction.startTime),  // Convert string to Date
      endTime: new Date(auction.endTime)      // Convert string to Date
    }));
    this.similarAuctions = this.getSimilarAuctions();
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
    this.similarAuctions = this.getSimilarAuctions();
  }

  private checkStatus(auctions: AuctionDTOShow[]) {

    console.log('checkstatus');

    this.auctions = auctions;
    this.auctions = this.auctions.map(auction => ({
      ...auction,
      startTime: new Date(auction.startTime),  // Convert string to Date
      endTime: new Date(auction.endTime)      // Convert string to Date
    }));

    console.log('signal r more auctions', this.auctions);
    this.similarAuctions = this.getSimilarAuctions();

    this.updateAuctionsStatus();
    this.cdr.detectChanges();
  }


  ngOnDestroy() {
    this.signalrService.hubConnection.stop();
    // Clean up listeners
    this.signalrService.hubConnection.off('ReceiveAllAuctions');
    this.signalrService.hubConnection.off('NewAuctionCreated');
    this.signalrService.hubConnection.off('AuctionDeleted');
    this.signalrService.hubConnection.off('AuctionListUpdate');
    this.signalrService.hubConnection.off('CheckStatusAllAuctions');

  }


  //---------------------------------------------------------------------------------------------
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
      // if (now < auction.startTime) {
      //   auction.status = 'Scheduled';
      // } else if (now > auction.endTime) {
      //   auction.status = 'Finished';
      // } else {
      //   auction.status = 'Active';
      // }
      // Calculate progress here
      auction.timeProgress = this.getTimeProgress(auction);
    });
  }


  // Starting bid filter
  startingBidMin: number | null = null;
  startingBidMax: number | null = null;

  imageSlideIntervals: { [auctionId: number]: any } = {};

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

}
