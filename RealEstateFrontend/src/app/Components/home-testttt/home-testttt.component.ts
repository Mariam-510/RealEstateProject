import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LeafletMapComponent } from "../leaflet-map/leaflet-map.component";
import { Product, PropertyDto, SharedService } from '../../Services/shared.service';
import { RecommendedComponent } from '../RealEstateComponent/recommended/recommended.component';
import { CardmapComponent } from "../RealEstateComponent/cardmap/cardmap.component";
import { HomePropertiesComponent } from "../home-properties/home-properties.component";
import { HomeAuctionsComponent } from "../home-auctions/home-auctions.component";

interface FurnitureItem {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  tag?: string;
}

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

interface InspirationItem {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
}

interface FeaturedProperty {
  id: number;
  title: string;
  price: string;
  beds: number;
  baths: number;
  sqft: number;
  details: string;
  image: string;
  tag: string;
}

interface UpcomingAuction {
  id: number;
  title: string;
  startingBid: string;
  timeLeft: string;
  status: string;
  image: string;
  endingSoon: boolean;
}

@Component({
  selector: 'app-home-testttt',
  imports: [CommonModule, RouterModule, LeafletMapComponent, RecommendedComponent, CardmapComponent, HomePropertiesComponent, HomeAuctionsComponent],
  templateUrl: './home-testttt.component.html',
  styleUrl: './home-testttt.component.css'
})
export class HomeTesttttComponent implements OnInit {

  propertiess: PropertyDto[] = [];

  products: Product[] = [];

  // Furniture items data
  // trendingFurniture: FurnitureItem[] = [
  //   {
  //     id: 1,
  //     title: 'Modern Sofa Set',
  //     description: 'Contemporary design, premium fabric',
  //     price: '$1,299',
  //     image: 'https://www.mocka.com.au/cdn/shop/files/T04028_HiRes_01.jpg?v=1728479772&width=2040',
  //     tag: 'New Arrival'
  //   },
  //   {
  //     id: 2,
  //     title: 'Dining Table Set',
  //     description: 'Solid oak, seats 6 people',
  //     price: '$899',
  //     image: 'https://images.eq3.com/image-service/a0067633-232a-4dff-b0b9-bc26c0651211/Joan-Chair-30215-02-Panama-Grey-Black-Ash-Legs-Front-Web_ORIGINAL.jpg',
  //     tag: 'Bestseller'
  //   },
  //   {
  //     id: 3,
  //     title: 'Bedroom Collection',
  //     description: 'Complete 5-piece set',
  //     price: '$2,499',
  //     image: 'https://denovofurniture.pk/wp-content/uploads/2024/06/Opulence-New-5.jpg',
  //     tag: 'Sale'
  //   },
  //   {
  //     id: 4,
  //     title: 'Office Desk',
  //     description: 'Modern design with storage',
  //     price: '$549',
  //     image: 'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg'
  //   }
  // ];

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

  // Home Inspiration Gallery (replacing Blog)
  // inspirationItems: InspirationItem[] = [
  //   {
  //     id: 1,
  //     title: 'Modern Living Room',
  //     description: 'Minimalist design with comfort in mind',
  //     image: 'https://wasilaah.com/cdn/shop/products/IMG_9996.jpg?v=1679343647&width=2048',
  //     category: 'Living Room'
  //   },
  //   {
  //     id: 2,
  //     title: 'Luxury Kitchen',
  //     description: 'High-end appliances with marble countertops',
  //     image: 'https://www.raneen.com/media/catalog/product/1/5/153_qj0fycqtckj854wf.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=&width=',
  //     category: 'Kitchen'
  //   },
  //   {
  //     id: 3,
  //     title: 'Cozy Bedroom',
  //     description: 'Create a peaceful retreat for relaxation',
  //     image: 'https://babymore.co.uk/wp-content/uploads/2023/02/Mona-2-Piece-Room-Set-GREY-1-scaled.jpg',
  //     category: 'Bedroom'
  //   },
  //   {
  //     id: 4,
  //     title: 'Home Office Setup',
  //     description: 'Productive workspace with ergonomic furniture',
  //     image: '/api/placeholder/500/300',
  //     category: 'Office'
  //   },
  //   {
  //     id: 5,
  //     title: 'Outdoor Patio',
  //     description: 'Transform your backyard into an entertainment space',
  //     image: 'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg',
  //     category: 'Outdoor'
  //   },
  //   {
  //     id: 6,
  //     title: 'Contemporary Bathroom',
  //     description: 'Spa-like experience with modern fixtures',
  //     image: 'https://www.mocka.com.au/cdn/shop/files/T04028_HiRes_01.jpg?v=1728479772&width=2040',
  //     category: 'Bathroom'
  //   }
  // ];

  // Trust Stats
  stats = [
    { value: '5,000+', label: 'Properties Sold' },
    { value: '98%', label: 'Happy Clients' },
    { value: '4.9★', label: 'Average Rating' }
  ];

  // featuredProperties: FeaturedProperty[] = [
  //   {
  //     id: 1,
  //     title: 'Luxury Downtown Penthouse',
  //     price: '$1,250,000',
  //     beds: 4,
  //     baths: 3,
  //     sqft: 3200,
  //     details: 'Panoramic city views • Smart home • Rooftop terrace',
  //     image: 'https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg',
  //     tag: 'Premium Listing'
  //   },
  //   {
  //     id: 2,
  //     title: 'Modern Beach Villa',
  //     price: '$2,950,000',
  //     beds: 5,
  //     baths: 4,
  //     sqft: 4500,
  //     details: 'Private beach access • Infinity pool • Smart home system',
  //     image: 'https://www.brinkpm.com/images/blog/bigstock-Luxurious-New-Construction-Hom-165493040.webp',
  //     tag: 'Waterfront'
  //   },
  //   {
  //     id: 3,
  //     title: 'Historic Townhouse',
  //     price: '$850,000',
  //     beds: 3,
  //     baths: 2,
  //     sqft: 1800,
  //     details: 'Restored heritage building • Prime location • Private garden',
  //     image: 'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg',
  //     tag: 'Renovated'
  //   },
  //   {
  //     id: 4,
  //     title: 'Mountain Retreat',
  //     price: '$1,100,000',
  //     beds: 4,
  //     baths: 3,
  //     sqft: 2800,
  //     details: '20-acre property • Ski-in/ski-out • Hot tub',
  //     image: 'https://images.prop24.com/331109780/Crop600x400',
  //     tag: 'Vacation Home'
  //   }
  // ];
  
  upcomingAuctions: UpcomingAuction[] = [
    {
      id: 1,
      title: 'Commercial Office Space - Downtown',
      startingBid: '$500,000',
      timeLeft: '2 days 4 hours',
      status: 'Live Bidding',
      image: 'https://images.prop24.com/331109780/Crop600x400',
      endingSoon: true
    },
    {
      id: 2,
      title: 'Lakeside Vacation Property',
      startingBid: '$250,000',
      timeLeft: '5 days 12 hours',
      status: 'Starting Soon',
      image: 'https://www.brinkpm.com/images/blog/bigstock-Luxurious-New-Construction-Hom-165493040.webp',
      endingSoon: false
    },
    {
      id: 3,
      title: 'Mixed-Use Development Lot',
      startingBid: '$1,200,000',
      timeLeft: '3 days 6 hours',
      status: 'Live Bidding',
      image: 'https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg',
      endingSoon: true
    },
    {
      id: 4,
      title: 'Vintage Estate Home',
      startingBid: '$800,000',
      timeLeft: '1 day 8 hours',
      status: 'Final Hours',
      image: 'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg',
      endingSoon: true
    }
  ];

  // inspirationFilters: string[] = ['All', 'Living Room', 'Kitchen', 'Bedroom', 'Office', 'Outdoor', 'Bathroom'];
  // activeInspirationFilter: string = 'All';
  // filteredInspirationItems: InspirationItem[] = [];
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

  constructor(private sharedService: SharedService) { }

  ngOnInit(): void {
    this.startAutoSlide();
    // this.filterInspirationItems('All');
    this.propertiess = this.sharedService.properties;
    this.products = this.sharedService.HomeProducts;
  }

  // setInspirationFilter(filter: string): void {
  //   this.activeInspirationFilter = filter;
  //   this.filterInspirationItems(filter);
  // }

  // filterInspirationItems(filter: string): void {
  //   if (filter === 'All') {
  //     this.filteredInspirationItems = this.inspirationItems;
  //   } else {
  //     this.filteredInspirationItems = this.inspirationItems.filter(item => item.category === filter);
  //   }
  // }
  
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

  toggleFavorite(event: any) {
    event.isFavorite = !event.isFavorite;
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

  toggleMap(property: PropertyDto) {
      property.activeMap = !property.activeMap;
    }
}
