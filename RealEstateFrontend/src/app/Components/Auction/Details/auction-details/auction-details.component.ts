import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertyPhotoModalComponent } from '../../../Properties/Details/property-photo-modal/property-photo-modal.component';
import { PropertyDetialsLeafletMapComponent } from '../../../Properties/Details/property-detials-leaflet-map/property-detials-leaflet-map.component';
import { LeafletMapComponent } from '../../../Map/leaflet-map/leaflet-map.component';
import { MoreAuctionsComponent } from '../more-auctions/more-auctions.component';
import { AuctionDTOShow, AuctionService } from '../../../../Services/ApiServices/auction.service';
import { AuthService } from '../../../../Services/ApiServices/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from '../../../../Services/toastr.service';
import { CreatePropertyBidDto, PropertyBidDto, PropertyBidService } from '../../../../Services/ApiServices/property-bid.service';
import { lastValueFrom } from 'rxjs';
import { API_CONFIG } from '../../../../app.config';
import { SignalRService } from '../../../../Services/SignalRServices/signal-r.service';
import { AuctionBuyerDto, AuctionBuyerService, CreateAuctionBuyerDto } from '../../../../Services/ApiServices/auction-buyer.service';
import { MatDialog } from '@angular/material/dialog';
import { AuctionBuyerPaymentComponent } from '../auction-buyer-payment/auction-buyer-payment.component';

// export enum Status {
//   Scheduled = 'Scheduled',
//   Active = 'Active',
//   Finished = 'Finished'
// }

declare var bootstrap: any; // Required for Bootstrap modal handling

@Component({
  selector: 'app-auction-details',
  imports: [CommonModule, FormsModule, RouterModule,
    PropertyPhotoModalComponent, LeafletMapComponent, MoreAuctionsComponent],
  templateUrl: './auction-details.component.html',
  styleUrl: './auction-details.component.css'
})
export class AuctionDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  showAllBids = false;
  showMore: boolean = false;
  auction: AuctionDTOShow | null = null;
  // propertyBids: PropertyBidDto[] = [];
  // lastBid: PropertyBidDto | null = null;
  apiConfig = API_CONFIG;
  auctionBuyerDto: AuctionBuyerDto | null = null;

  constructor(private elRef: ElementRef, private renderer: Renderer2, private auth: AuthService,
    private route: ActivatedRoute, private toastr: ToastrService, private cdr: ChangeDetectorRef,
    private auctionService: AuctionService, private propertyBidService: PropertyBidService,
    private signalrService: SignalRService, private router: Router,
    private auctionBuyerService: AuctionBuyerService, private dialog: MatDialog) {
  }


  // Component properties
  // targetDate: Date = new Date(); // Set your auction end date
  days: string = '00';
  hours: string = '00';
  minutes: string = '00';
  seconds: string = '00';
  private timer: any;
  icons: any;
  auctionFees: number = 0;

  // Add to ngOnInit()
  async ngOnInit() {
    // Extract ID from route
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (isNaN(id)) {
      throw new Error('Invalid auction ID');
    }
    // await this.loadAuction(id);

    await this.signalrService.startConnection();
    await this.loadAuction(id);
    if (this.hasRole('Buyer')) {
      await this.getAuctionBuyer(id);
      this.auctionFees = Number(((this.auction?.startPrice ?? 0) * 0.01).toFixed(2));
    }

    // Set up SignalR listeners
    this.signalrService.listenToAuctionDetails(this.handleAuctionUpdate.bind(this));
    this.signalrService.listenToAuctionListUpdates(this.handleListUpdate.bind(this));
    this.signalrService.listenToDeletedAuctions(this.handleAuctionDeletion.bind(this));
    this.signalrService.listenToCheckStatusUpdates(this.checkStatus.bind(this));

    this.icons = this.createIcons();

    this.startCountdown();

    this.startStatusTimer();
  }


  isLoading = true;
  errorMessage = '';

  async loadAuction(id: number): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      // Fetch single auction
      const auction = await lastValueFrom(
        this.auctionService.getAuctionById(id)
      );

      // Convert date strings to Date objects
      auction.startTime = new Date(auction.startTime);
      auction.endTime = new Date(auction.endTime);

      // Update component state with the single auction
      this.auction = auction; // Add a 'auction' property to your component

      console.log(this.auction);

    } catch (error) {
      console.error('Error loading auction:', error);
      this.errorMessage = 'Failed to load auction. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }

  //-------------------------------------------------------------------------------
  private handleAuctionUpdate(updatedAuction: AuctionDTOShow) {
    if (updatedAuction.id === this.auction?.id) {
      this.auction = this.processAuctionDates(updatedAuction);
    }
    console.log('u', this.auction);
    this.cdr.detectChanges(); // Add change detection
  }

  private handleListUpdate(updatedAuction: AuctionDTOShow) {
    if (updatedAuction.id === this.auction?.id) {
      this.auction = this.processAuctionDatesCreateBid({
        ...this.auction,
        ...updatedAuction
      });
    }
    console.log('l', this.auction);
    this.cdr.detectChanges(); // Add change detection
  }

  private handleAuctionDeletion(deletedId: number) {
    if (deletedId === this.auction?.id) {
      this.router.navigate(['/auctions'], {
        state: { message: 'This auction has been deleted' }
      });
    }
    this.cdr.detectChanges(); // Add change detection
  }

  private checkStatus(auctions: AuctionDTOShow[]) {

    var auction = auctions.find(a => a.id === this.auction?.id) || null;
    if (auction != null) {
      this.auction = this.processAuctionDates(auction);
    }

    console.log('checkstatus');

    console.log('signal r auction', this.auction);

    this.startCountdown();
    this.cdr.detectChanges();
  }

  //--------------------------------------------------------------------------

  // Get auction buyer with async/await
  async getAuctionBuyer(auctionId: number) {
    try {
      const response = await lastValueFrom(
        this.auctionBuyerService.getByAuctionAndBuyerId(auctionId)
      );
      console.log('Auction Buyer:', response);
      if (response) {
        this.auctionBuyerDto = response;
      }
      return response;
    } catch (err) {
      console.error('Error fetching auction buyer:', err);
      // Handle error appropriately
      throw err; // Re-throw if you want calling code to handle the error
    }
  }


  openMethodDialog() {
    const dialogRef = this.dialog.open(AuctionBuyerPaymentComponent, {
      width: '480px',
      minHeight: '440px',
      panelClass: ['centered-dialog', 'mt-5', 'pt-5'],
      data: { auctionData: this.auction }
    });

    // Add this subscription
    dialogRef.afterClosed().subscribe(() => {
      this.getAuctionBuyer(this.auction?.id ?? 0);
    });
  }

  //-------------------------------------------------------------------------------
  private processAuctionDates(auction: AuctionDTOShow): AuctionDTOShow {
    return {
      ...auction,
      startTime: new Date(auction.startTime),
      endTime: new Date(auction.endTime),
      bids: auction.bids?.map(bid => ({
        ...bid,
        timestamp: new Date(bid.timestamp)
      }))
    };
  }

  private processAuctionDatesCreateBid(auction: AuctionDTOShow): AuctionDTOShow {
    return {
      ...auction,
      startTime: new Date(auction.startTime),
      endTime: new Date(auction.endTime),
      bids: auction.bids?.map((bid, index) => ({
        ...bid,
        timestamp: new Date(
          new Date(bid.timestamp).setHours(
            new Date(bid.timestamp).getHours() - (index === 0 ? 1 : 0)
          )
        )
      }))
    };
  }

  private startCountdown() {
    this.timer = setInterval(() => {
      const now = new Date().getTime();
      // Determine target date based on auction status
      const targetDate = this.auction?.status === 'Scheduled'
        ? this.auction.startTime.getTime()
        : this.auction?.endTime.getTime();

      const distance = targetDate! - now;

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

  // Cleanup
  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.signalrService.hubConnection.stop();
    this.signalrService.hubConnection.off('ReceiveAuctionDetails');
    this.signalrService.hubConnection.off('AuctionDeleted');
    this.signalrService.hubConnection.off('AuctionListUpdate');
    this.signalrService.hubConnection.off('CheckStatusAllAuctions');

    this.clearTimer();

  }

  //--------------------------------------------------------------------------
  private timeout: any;
  private nextCheckTime: Date | null = null;

  startStatusTimer() {
    this.clearTimer();
    this.checkAuctionStatusEndpoint();
  }

  private clearTimer() {
    clearTimeout(this.timeout);
  }

  private calculateNextCheck(auctions: AuctionDTOShow[]) {
    const now = new Date().getTime();
    console.log(new Date().toLocaleString());
    let nearestTime = Infinity;

    auctions.forEach(auction => {
      const start = auction.startTime.getTime();
      const end = auction.endTime.getTime();

      if (now < start) {
        nearestTime = Math.min(nearestTime, start);
      }
      else if (now < end) {
        nearestTime = Math.min(nearestTime, end);
      }

    });

    return nearestTime !== Infinity ? new Date(nearestTime) : null;
  }

  checkAuctionStatusEndpoint() {
    console.log('check status endpoint');

    this.auctionService.checkAuctionStatus().subscribe({
      next: (auctions) => {
        auctions = auctions.map(auction => ({
          ...auction,
          startTime: new Date(auction.startTime),  // Convert string to Date
          endTime: new Date(auction.endTime)      // Convert string to Date
        }));

        console.log('Status changes detected:', auctions);

        // Always set up next check even if no changes
        this.nextCheckTime = this.calculateNextCheck(auctions);
        this.setNextTimeout();

        // Update SignalR listeners or other real-time features here
      },
      error: (err) => console.error('Error checking status:', err)
    });
  }

  private setNextTimeout() {
    this.clearTimer();

    if (!this.nextCheckTime) {
      console.log('No upcoming status changes');
      return;
    }

    const now = new Date().getTime();
    const timeDiff = this.nextCheckTime.getTime() - now;

    if (timeDiff > 0) {
      console.log('Next check scheduled at', this.nextCheckTime);
      this.timeout = setTimeout(() => {
        this.checkAuctionStatusEndpoint();
      }, timeDiff);
    }
    else {
      // If time already passed, check immediately
      this.checkAuctionStatusEndpoint();
    }
  }


  //----------------------------------------------------------------------------
  private createIcons() {
    return [
      {
        src: 'icons/Bed.svg',
        alt: 'Bedroom Icon',
        value: this.auction?.propertyDto?.bedRooms ?? 0,
        label: 'Bedrooms'
      },
      {
        src: 'icons/Bath.svg',
        alt: 'Bathroom Icon',
        value: this.auction?.propertyDto?.bathRooms ?? 0,  // Fix typo: bathRooms
        label: 'Bathrooms'
      },
      {
        src: 'icons/Area.svg',
        alt: 'Indoor Area Icon',
        value: this.auction?.propertyDto?.space ?? 0,
        label: 'Indoor Area'
      },
      {
        src: 'icons/Complete.svg',
        alt: 'Completed Icon',
        value: this.auction?.propertyDto?.addedDate,  // Keep as undefined if missing
        label: 'Completed'
      }
    ];
  }

  //---------------------------------------------------------------------------------------------

  // Add these properties to the component class
  bidAmount: number | null = null;
  showBidSuccess = false;
  showBidError = false;
  bidErrorMessage = '';

  get highestBid(): number {

    if (!this.auction?.lastPropertyBidDto || this.auction?.bids.length === 0) {
      return this.auction?.startPrice ?? 0;
    }
    return this.auction?.lastPropertyBidDto.bidAmount;
  }

  isPlacingBid = false;

  async createBid(): Promise<void> {
    if (!this.bidAmount || this.bidAmount <= 0) {
      this.bidErrorMessage = 'Please enter a valid bid amount';
      return;
    }

    try {
      this.showBidSuccess = false;
      this.showBidError = false;

      // Basic validation
      if (!this.bidAmount || this.bidAmount <= this.highestBid) {
        this.showBidError = true;
        this.bidErrorMessage = 'Bid must be higher than current bid';
        return;
      }

      if (this.auction?.status !== 'Active') {
        this.showBidError = true;
        this.bidErrorMessage = 'Auction is not active';
        return;
      }

      this.isPlacingBid = true;

      const createDto: CreatePropertyBidDto = {
        bidAmount: this.bidAmount,
        auctionId: this.auction?.id ?? 0
      };

      const newBid = await lastValueFrom(
        this.propertyBidService.createBid(createDto)
      );

      // console.log('nnn', newBid);

      // Update local state with new bid
      // this.auction?.bids.unshift(newBid);
      // this.auction.lastPropertyBidDto = newBid;

      // Show success feedback
      this.showBidSuccess = true;

      // Reset form
      this.bidAmount = null;

    } catch (error) {
      console.error('Bid creation failed:', error);
      this.bidErrorMessage = this.getBidErrorMessage(error);
    } finally {
      this.isPlacingBid = false;
    }
  }

  private getBidErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    return 'Failed to place bid. Please try again.';
  }



  //-----------------------------------------------------------------------------
  @ViewChild('heroSection') heroSection!: ElementRef;
  @ViewChild('AuctionCard') auctionCard!: ElementRef;
  @ViewChild('tabLinks') tabLinks!: ElementRef;

  sections!: NodeListOf<HTMLElement>;
  stopSection!: HTMLElement;
  isNavigationSticky: boolean = false;
  currentActiveSection: string = 'overview';
  private initialCardTop = 0;
  private stickyThreshold = 0;

  ngAfterViewInit() {
    setTimeout(() => {
      this.calculateInitialPosition();

      this.sections = this.elRef.nativeElement.querySelectorAll('section');
      this.stopSection = this.elRef.nativeElement.querySelector('#stop-scroll')!;

      if (!this.tabLinks) {
        console.warn("tabLinks is not available in ngAfterViewInit");
        return;
      }
      // Initial check for scroll position (if page is refreshed while scrolled)
      this.onWindowScroll();
    }, 0);

  }
  private calculateInitialPosition() {
    const hero = this.heroSection.nativeElement;
    const card = this.auctionCard.nativeElement;
    this.stickyThreshold = hero.offsetTop + hero.offsetHeight - card.offsetHeight;
  }

  private lastScrollTop: number = 0;
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.auctionCard?.nativeElement) return;

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
    this.locationUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.auction?.propertyDto?.location ?? '')}`;

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
