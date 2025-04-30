import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Product, PropertyDto, SharedService } from '../../../Services/shared.service';
import { RecommendedComponent } from '../../Properties/Details/recommended/recommended.component';
import { HomePropertiesComponent } from "../home-properties/home-properties.component";
import { HomeAuctionsComponent } from "../home-auctions/home-auctions.component";
import { CardmapComponent } from '../../Properties/Details/cardmap/cardmap.component';
import { LeafletMapComponent } from '../../Map/leaflet-map/leaflet-map.component';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { ToastrService } from '../../../Services/toastr.service';
import { WishListService } from '../../../Services/ApiServices/wish-list.service';
import { DaysUntilPipe } from '../../../Pipes/days-until.pipe';
import { ProductDTO, ProductService } from '../../../Services/ApiServices/product.service';
import { API_CONFIG } from '../../../app.config';
import { PropertyDTO, PropertyService } from '../../../Services/ApiServices/property.service';
import { MatDialog } from '@angular/material/dialog';
import { SignUpRoleComponentComponent } from '../../Authentication/sign-up-role-component/sign-up-role-component.component';
import { GoogleService } from '../../../Services/ApiServices/google.service';
import { SignalRService } from '../../../Services/SignalRServices/signal-r.service';
import { AuctionDTOShow, AuctionService } from '../../../Services/ApiServices/auction.service';
import { lastValueFrom } from 'rxjs';


interface PropertyListing {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  tag?: string;
}
interface Testimonial {
  id: number;
  name: string;
  type: string;
  quote: string;
  avatar: string;
}

interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, RouterModule, DaysUntilPipe],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})

export class HomePageComponent implements OnInit, OnDestroy {

  apiConfig = API_CONFIG;

  products: ProductDTO[] = [];
  properties: PropertyDTO[] = [];

  // Property listings data
  latestProperties: PropertyListing[] = [
    {
      id: 1,
      title: 'Modern Villa',
      description: '4 bed, 3 bath, 2 garage',
      price: '$850,000',
      image: 'https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg',
      tag: 'For Sale'
    },
    {
      id: 2,
      title: 'Downtown Apartment',
      description: '2 bed, 2 bath, furnished',
      price: '$2,200/mo',
      image: 'https://www.brinkpm.com/images/blog/bigstock-Luxurious-New-Construction-Hom-165493040.webp',
      tag: 'For Rent'
    },
    {
      id: 3,
      title: 'Suburban Home',
      description: '3 bed, 2 bath, large yard',
      price: '$425,000',
      image: 'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg',
      tag: 'New Listing'
    },
    {
      id: 4,
      title: 'Beach House',
      description: '5 bed, 4 bath, ocean view',
      price: '$1,250,000',
      image: 'https://images.prop24.com/331109780/Crop600x400',
      tag: 'Featured'
    }
  ];

  // Testimonials data
  testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      type: 'Furniture Buyer',
      quote: 'The furniture I purchased was exactly as described. The delivery was prompt and the assembly service was excellent. I\'ll definitely be shopping here again.',
      avatar: 'https://www.crossegyptchallenge.com/wp-content/uploads/2022/07/cairo01.jpg'
    },
    {
      id: 2,
      name: 'Michael Chen',
      type: 'Property Seller',
      quote: 'Listing my property was simple and straightforward. I received multiple offers within the first week and sold above my asking price!',
      avatar: 'https://www.crossegyptchallenge.com/wp-content/uploads/2022/07/cairo01.jpg'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      type: 'Auction Winner',
      quote: 'I was hesitant about property auctions at first, but the process was transparent and I ended up with my dream home at a price I could afford.',
      avatar: 'https://www.crossegyptchallenge.com/wp-content/uploads/2022/07/cairo01.jpg'
    }
  ];

  // Platform features data
  features: Feature[] = [
    {
      id: 1,
      icon: '★',
      title: 'All-in-One Solution',
      description: 'From furniture to properties, find everything you need for your home in one place.'
    },
    {
      id: 2,
      icon: '✓',
      title: 'Verified Listings',
      description: 'All our properties and sellers undergo a strict verification process.'
    },
    {
      id: 3,
      icon: '$',
      title: 'Best Value',
      description: 'Competitive prices across all our services with regular deals and discounts.'
    },
    {
      id: 4,
      icon: '?',
      title: '24/7 Support',
      description: 'Our customer service team is available round the clock to assist you.'
    }
  ];

  // Trust Stats
  stats = [
    { value: '5,000+', label: 'Properties Sold' },
    { value: '98%', label: 'Happy Clients' },
    { value: '4.9★', label: 'Average Rating' }
  ];

  activeSlideIndex = 0;
  autoSlideInterval: any;

  heroSlides = [
    {
      title: 'Find Your Dream Home',
      subtitle: 'Discover properties that match your lifestyle',
      image: 'https://digital.ihg.com/is/image/ihg/intercontinental-cairo-10367348719-2x1'
    },
    {
      title: 'Premium Furniture Collection',
      subtitle: 'Style your home with our curated selections',
      image: 'https://www.mocka.com.au/cdn/shop/files/T04028_HiRes_01.jpg?v=1728479772&width=2040'
    },
    {
      title: 'Live Auction Experiences',
      subtitle: 'Bid on exclusive properties and unique items',
      image: 'https://www.crossegyptchallenge.com/wp-content/uploads/2022/07/cairo01.jpg'
    }
  ];

  constructor(private auth: AuthService, private wishListService: WishListService,
    private toastr: ToastrService, private productService: ProductService, private cdr: ChangeDetectorRef,
    private propertyService: PropertyService, private dialog: MatDialog, private googleService: GoogleService,
    private auctionService: AuctionService, private signalrService: SignalRService) { }

  async ngOnInit() {

    await this.signalrService.startConnection(); // Add this first

    await this.loadAuctions();

    // Bind handlers
    this.signalrService.listenToAuctionListUpdates(this.updateSingleAuction.bind(this));
    this.signalrService.listenToAllAuctions(this.updateAuctions.bind(this));
    this.signalrService.listenToNewAuctions(this.addNewAuction.bind(this));
    this.signalrService.listenToDeletedAuctions(this.removeAuction.bind(this));

    this.startAutoSlide();
    await this.loadProducts();
    await this.loadProperties();
  }


  auctions: AuctionDTOShow[] = [];
  nearestAuctions: AuctionDTOShow[] = [];

  async loadAuctions(): Promise<void> {
    try {

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

      this.nearestAuctions = this.getNearestAuctions(this.auctions);

    } catch (error) {
      console.error('Error loading auctions:', error);
    }
  }

  private updateAuctions(auctions: AuctionDTOShow[]) {
    this.auctions = auctions;
    this.auctions = this.auctions.map(auction => ({
      ...auction,
      startTime: new Date(auction.startTime),  // Convert string to Date
      endTime: new Date(auction.endTime)      // Convert string to Date
    }));

    this.nearestAuctions = this.getNearestAuctions(this.auctions);
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

      this.nearestAuctions = this.getNearestAuctions(this.auctions);
    }
  }

  private removeAuction(auctionId: number) {
    this.auctions = this.auctions.filter(a => a.id !== auctionId);
    this.auctions = this.auctions.map(auction => ({
      ...auction,
      startTime: new Date(auction.startTime),  // Convert string to Date
      endTime: new Date(auction.endTime)      // Convert string to Date
    }));

    this.nearestAuctions = this.getNearestAuctions(this.auctions);
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

    this.nearestAuctions = this.getNearestAuctions(this.auctions);
  }

  private getNearestAuctions(auctions: AuctionDTOShow[]): AuctionDTOShow[] {
    const now = new Date();

    // 1. Filter upcoming auctions
    const upcomingAuctions = auctions.filter(auction =>
      auction.startTime.getTime() > now.getTime()
    );

    // 2. Sort by nearest start time
    const sortedAuctions = upcomingAuctions.sort((a, b) =>
      a.startTime.getTime() - b.startTime.getTime()
    );

    // 3. Return first 3 results
    return sortedAuctions.slice(0, 3);
  }


  ngOnDestroy() {
    this.signalrService.hubConnection.stop();
    // Clean up listeners
    this.signalrService.hubConnection.off('ReceiveAllAuctions');
    this.signalrService.hubConnection.off('NewAuctionCreated');
    this.signalrService.hubConnection.off('AuctionDeleted');
    this.signalrService.hubConnection.off('AuctionListUpdate');

  }



  // async loadProducts() {
  //   try {
  //     const allProducts = await this.productService.getAllProducts().toPromise() ?? [];

  //     // Filter out products with quantity <= 0
  //     const availableProducts = allProducts.filter(product => product.quantity > 0);

  //     // Group available products by category
  //     const productsByCategory = availableProducts.reduce((acc, product) => {
  //       const category = product.categoryName;
  //       if (!acc[category]) {
  //         acc[category] = [];
  //       }
  //       acc[category].push(product);
  //       return acc;
  //     }, {} as { [key: string]: typeof availableProducts });


  //     // Get top-rated product from each category and sort by category name
  //     const topProducts = Object.keys(productsByCategory)
  //       .sort() // Sort categories A-Z first
  //       .map(category =>
  //         productsByCategory[category]
  //           .sort((a, b) => b.averageRating - a.averageRating)[0]
  //       )
  //       // Take first 3 categories
  //       .slice(0, 3);

  //     this.products = topProducts;
  //     console.log('Top 3 products by category (A-Z):', this.products);
  //     this.cdr.detectChanges();
  //   } catch (err) {
  //     console.error('Error loading products:', err);
  //   }
  // }

  async loadProducts() {
    try {
      const allProducts = await this.productService.getAllProducts().toPromise() ?? [];

      // Filter out products with quantity <= 0
      const availableProducts = allProducts.filter(product => product.quantity > 0).sort();

      // Group available products by category
      const productsByCategory = availableProducts.reduce((acc, product) => {
        const category = product.categoryName;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(product);
        return acc;
      }, {} as { [key: string]: typeof availableProducts });

      // Get best product from each category using stock+rating sorting
      const topProducts = Object.keys(productsByCategory)
        .sort() // Sort categories A-Z first
        .map(category =>
          productsByCategory[category]
            .sort((a, b) => {
              // Primary sort: stock quantity descending
              const stockDiff = b.quantity - a.quantity;
              // Secondary sort: rating descending
              return stockDiff !== 0 ? stockDiff : b.averageRating - a.averageRating;
            })[1] // Take top item from category
        )
        // Additional sorting of final products by stock then rating
        // .sort((a, b) => {
        //   const stockDiff = b.quantity - a.quantity;
        //   return stockDiff !== 0 ? stockDiff : b.averageRating - a.averageRating;
        // })
        // Take first 3 categories
        .slice(0, 3);

      this.products = topProducts;
      console.log('Stock-optimized top products:', this.products);
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }


  // In your component
  // async loadProperties(
  //   category?: string,
  //   status?: string,
  //   type?: string,
  //   searchByLocation?: string
  // ) {
  //   try {
  //     this.properties = await this.propertyService.getAll(
  //       category,
  //       status,
  //       type,
  //       searchByLocation
  //     ).toPromise() ?? [];

  //     console.log('Loaded properties:', this.properties);
  //     this.cdr.detectChanges(); // If using ChangeDetectorRef
  //   } catch (err) {
  //     console.error('Error loading properties:', err);
  //     // Handle error (show message, etc.)
  //   }
  // }


  async loadProperties(
    category?: string,
    status?: string,
    type?: string,
    searchByLocation?: string
  ) {
    try {
      const allProperties = await this.propertyService.getAll(
        category,
        status,
        type,
        searchByLocation
      ).toPromise() ?? [];

      // 1. Group properties by category
      const propertiesByCategory = allProperties.reduce((acc, property) => {
        const categoryKey = property.propertyCategory;
        if (!acc[categoryKey]) {
          acc[categoryKey] = [];
        }
        acc[categoryKey].push(property);
        return acc;
      }, {} as { [key: string]: typeof allProperties });

      // 2. Select most recent property from each category
      let selectedProperties = Object.keys(propertiesByCategory)
        .map(category =>
          propertiesByCategory[category]
            .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())[0]
        );

      // 3. Ensure Sell/Rent type diversity
      const hasSell = selectedProperties.some(p => p.type === 'Sell');
      const hasRent = selectedProperties.some(p => p.type === 'Rent');

      if (!hasSell || !hasRent) {
        const missingType = !hasSell ? 'Sell' : 'Rent';

        // Find newest property of missing type from any category
        const replacementCandidate = allProperties
          .filter(p => p.type === missingType)
          .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())[0];

        if (replacementCandidate) {
          // Remove oldest property from selected
          selectedProperties = selectedProperties.slice(1);
          // Add replacement candidate
          selectedProperties.push(replacementCandidate);
        }
      }

      // 4. Final sorting by title (A-Z) and limit to 10
      this.properties = selectedProperties
        .sort((a, b) => b.title.localeCompare(a.title)) // Alphabetical sort by title
        .slice(2, 5);

      console.log('Sorted properties:', this.properties);
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error loading properties:', err);
    }
  }



  toggleProductWishList(product: ProductDTO) {
    // Optimistic UI update
    const previousState = product.isFavorite;
    product.isFavorite = !previousState;

    this.wishListService.toggleProductWishlist(product.id).subscribe({
      next: (response) => {
        this.toastr.success(response);
        // Optional: Update with actual API state if needed
      },
      error: (err) => {
        // Revert UI state on error
        product.isFavorite = previousState;
        this.toastr.error('Error updating wishlist');
        console.error(err);
      }
    });
  }

  togglePropertyWishList(property: PropertyDTO) {
    // Optimistic UI update
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

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.activeSlideIndex = (this.activeSlideIndex + 1) % this.heroSlides.length;
  }

  prevSlide() {
    this.activeSlideIndex = (this.activeSlideIndex - 1 + this.heroSlides.length) % this.heroSlides.length;
  }

  setActiveSlide(index: number) {
    this.activeSlideIndex = index;
    clearInterval(this.autoSlideInterval);
    this.startAutoSlide();
  }


  openSigUPDialog(): void {
    this.dialog.open(SignUpRoleComponentComponent);
  }

  hasRoleOrNoUser(requiredRole: string) {
    return !this.auth.isAuthenticated() || this.auth.hasRole(requiredRole);
  }

  hasUser() {
    return this.auth.isAuthenticated();
  }
}
