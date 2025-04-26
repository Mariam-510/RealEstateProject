import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

interface PropertyListing {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  tag?: string;
}

interface AuctionProperty {
  id: number;
  title: string;
  bidInfo: string;
  timeLeft: string;
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
  imports: [CommonModule, RouterModule, LeafletMapComponent, RecommendedComponent, CardmapComponent,
    HomePropertiesComponent, HomeAuctionsComponent, DaysUntilPipe],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})

export class HomePageComponent implements OnInit {

  apiConfig = API_CONFIG;

  products: ProductDTO[] = [];
  topRatedProducts: ProductDTO[] = [];

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

  // Auction properties data
  auctionProperties: AuctionProperty[] = [
    {
      id: 1,
      title: 'Luxury Condo',
      bidInfo: 'Current bid: $320,000',
      timeLeft: 'Ends in 2 days',
      image: 'https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg',
      tag: 'Ending Soon'
    },
    {
      id: 2,
      title: 'Commercial Building',
      bidInfo: 'Current bid: $750,000',
      timeLeft: 'Ends in 5 days',
      image: 'https://images.prop24.com/331109780/Crop600x400',
      tag: 'Hot Deal'
    },
    {
      id: 3,
      title: 'Mountain Cabin',
      bidInfo: 'Starting bid: $180,000',
      timeLeft: 'Ends in 10 days',
      image: 'https://www.brinkpm.com/images/blog/bigstock-Luxurious-New-Construction-Hom-165493040.webp',
      tag: 'New'
    },
    {
      id: 4,
      title: 'Urban Townhouse',
      bidInfo: 'Current bid: $425,000',
      timeLeft: 'Ends in 3 days',
      image: 'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg'
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

  // Featured Properties
  featuredProperties: PropertyDto[] = [
    {
      id: 101,
      title: 'Luxury Penthouse with Sea View',
      description: 'Stunning 3-bedroom penthouse with private pool and 360° city views',
      location: 'Palm Jumeirah, Dubai',
      price: 8500000,
      type: 'SALE',
      propertyCategory: 'Residential',
      status: 'FEATURED',
      images: [
        'propertyImages/1.jpg',
        'propertyImages/2.jpg'
      ],
      bedrooms: 4,
      bathrooms: 6,
      space: 450,
      isFavorite: false,
      userImage: 'https://www.mocka.com.au/cdn/shop/files/T04028_HiRes_01.jpg?v=1728479772&width=2040',
      userName: 'Emaar Properties',
      date: new Date('2024-03-15'),
      activeMap: true
    },
    {
      id: 102,
      title: 'Modern Downtown Apartment',
      description: 'Fully furnished 2-bedroom apartment in financial district',
      location: 'Manhattan, New York',
      price: 2500000,
      type: 'SALE',
      propertyCategory: 'Residential',
      status: 'FEATURED',
      images: [
        'propertyImages/2.jpg'
      ],
      bedrooms: 2,
      bathrooms: 2,
      space: 180,
      isFavorite: true,
      userImage: '/assets/images/avatars/city-realty.jpg',
      userName: 'City Realty',
      date: new Date('2024-03-10'),
      activeMap: true
    },
    {
      id: 103,
      title: 'Historic Villa with Garden',
      description: 'Renovated 19th century villa with private garden',
      location: 'Centro, Rome',
      price: 4200000,
      type: 'RENT',
      propertyCategory: 'Residential',
      status: 'FEATURED',
      images: [
        'propertyImages/3.jpg'
      ],
      bedrooms: 5,
      bathrooms: 4,
      space: 800,
      isFavorite: false,
      userImage: '/assets/images/avatars/heritage-homes.jpg',
      userName: 'Heritage Homes',
      date: new Date('2024-03-20'),
      activeMap: false
    }
  ];

  // Upcoming Auctions
  upcomingAuctions: PropertyDto[] = [
    {
      id: 201,
      title: 'Waterfront Commercial Space',
      description: 'Prime commercial space with marina access',
      location: 'Marina Bay, Singapore',
      price: 12000000,
      type: 'AUCTION',
      propertyCategory: 'Commercial',
      status: 'UPCOMING',
      images: [
        'propertyImages/4.jpg'
      ],
      space: 2000,
      isFavorite: true,
      userImage: '/assets/images/avatars/global-auctions.jpg',
      userName: 'Global Auctions',
      date: new Date('2025-05-01'),
      activeMap: true
    },
    {
      id: 202,
      title: 'Tech Park Office Unit',
      description: 'Modern office space in innovation district',
      location: 'Silicon Valley, CA',
      price: 3500000,
      type: 'AUCTION',
      propertyCategory: 'Commercial',
      status: 'UPCOMING',
      images: [
        'propertyImages/5.jpg'
      ],
      space: 1500,
      isFavorite: false,
      userImage: '/assets/images/avatars/tech-estate.jpg',
      userName: 'Tech Estate',
      date: new Date('2025-04-30'),
      activeMap: true
    },
    {
      id: 203,
      title: 'Mountain Resort Property',
      description: '15-acre resort property with ski access',
      location: 'Aspen, Colorado',
      price: 8500000,
      type: 'AUCTION',
      propertyCategory: 'Residential',
      status: 'UPCOMING',
      images: [
        'propertyImages/6.jpg'
      ],
      bedrooms: 8,
      bathrooms: 6,
      space: 5000,
      isFavorite: true,
      userImage: '/assets/images/avatars/luxury-auctions.jpg',
      userName: 'Luxury Auctions',
      date: new Date('2025-04-27'),
      activeMap: false
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

  constructor(private sharedService: SharedService, private auth: AuthService, private wishListService: WishListService,
    private toastr: ToastrService, private productService: ProductService, private cdr: ChangeDetectorRef,
    private propertyService: PropertyService, private dialog: MatDialog) { }

  async ngOnInit() {
    this.startAutoSlide();
    await this.loadProducts();
    this.getTopRatedProducts();

    // await this.loadProperties();
    // this.propertiess = this.sharedService.properties;
    // this.products = this.sharedService.HomeProducts;
  }

  async loadProducts() {
    try {
      this.products = await this.productService.getAllProducts().toPromise() ?? [];
      console.log(this.products);
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }

  // async loadProperties() {
  //   try {
  //     this.properties = await this.propertyService.getAllProperties().toPromise() ?? [];
  //     console.log(this.properties);
  //     this.cdr.detectChanges();
  //   } catch (err) {
  //     console.error('Error loading properties:', err);
  //   }
  // }

  private getTopRatedProducts(): void {
    // Sort products by averageRating descending, then by number of reviews
    this.topRatedProducts = [...this.products].sort((a, b) => {
      // First sort by rating
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      // If ratings are equal, sort by number of reviews
      return b.numberOfReviews - a.numberOfReviews;
    });

    this.topRatedProducts = this.topRatedProducts.slice(0, 3);
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

  toggleProductWishList(product: any) {
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

  togglePropertyWishList(property: any) {
    // Optimistic UI update
    // const previousState = product.isFavorite;
    // product.isFavorite = !previousState;

    // this.wishListService.toggleProductWishlist(product.id).subscribe({
    //   next: (response) => {
    //     this.toastr.success(response);
    //     // Optional: Update with actual API state if needed
    //   },
    //   error: (err) => {
    //     // Revert UI state on error
    //     product.isFavorite = previousState;
    //     this.toastr.error('Error updating wishlist');
    //     console.error(err);
    //   }
    // });
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
