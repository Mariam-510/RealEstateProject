import { Injectable } from '@angular/core';


export interface PropertyDto {
  id: number;
  title: string;
  description: string;
  location: string;
  price: number;
  type: string;
  propertyCategory: string;
  status: string;
  images: string[];
  agentId?: number;
  sellerId?: number;
  contractImgUrl?: string;
  bedrooms?: number;
  bathrooms?: number;
  space: number;
  isFavorite: boolean;
  userImage: string;
  userName: string;
  date: Date;
  activeMap: boolean;
}

export interface Agent {
  photo: string;
  name: string;
  dateJoined: string;
  email: string;
}

export interface ProductDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  isUsed: boolean;
  averageRating: number;
  categoryID: number;
  categoryName: string;
  Productimages: string[];
  isFavorite: boolean;
  colors: string[];
  numOfReviews: number;
  date: Date;
}

export interface Review {
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  date: Date;
}


@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor() { }

  //---------------------------------------------------------------------------------------
  properties: PropertyDto[] = [
    {
      id: 1,
      title: 'Apartment in Maadi',
      description: 'Luxurious apartment with green view.Spacious villa with a beautiful garden.Spacious villa with a beautiful garden.',
      location: 'Maadi, Cairo, Egypt',
      price: 4561180,
      type: 'Sell',
      propertyCategory: 'Apartment',
      status: 'Available',
      images: ['propertyImages/1.jpg', 'propertyImages/2.jpg', 'propertyImages/1.jpg', 'propertyImages/2.jpg'],
      agentId: 5,
      bedrooms: 3,
      bathrooms: 3,
      space: 130,
      isFavorite: true,
      userImage: '',
      userName: '',
      date: new Date('2024-03-15'),
      activeMap: false
    },
    {
      id: 2,
      title: 'Apartment in Zamalek',
      description: 'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'Zamalek, Cairo, Egypt',
      price: 9500000,
      type: 'Sell',
      propertyCategory: 'Villa',
      status: 'Sold',
      images: ['propertyImages/3.jpg', 'propertyImages/4.jpg'],
      sellerId: 3,
      bedrooms: 4,
      bathrooms: 4,
      space: 250,
      isFavorite: false,
      userImage: '',
      userName: '',
      date: new Date('2023-11-22'),
      activeMap: false
    },
    {
      id: 3,
      title: 'Apartment in Giza',
      description: 'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'Haram, Giza',
      price: 30000,
      type: 'Rent',
      propertyCategory: 'Villa',
      status: 'Auctioned',
      images: ['propertyImages/5.jpg', 'propertyImages/6.jpg'],
      sellerId: 3,
      bedrooms: 5,
      bathrooms: 4,
      space: 250,
      isFavorite: false,
      userImage: '',
      userName: '',
      date: new Date('2024-01-10'),
      activeMap: false
    },
    {
      id: 4,
      title: 'Apartment in Gouna',
      description: 'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'El Gouna Conference & Culture Center, El Gouna, Egypt',
      price: 9500000,
      type: 'Sell',
      propertyCategory: 'Duplexes',
      status: 'Sold',
      images: ['propertyImages/3.jpg', 'propertyImages/4.jpg'],
      sellerId: 3,
      bedrooms: 5,
      bathrooms: 4,
      space: 250,
      isFavorite: false,
      userImage: '',
      userName: '',
      date: new Date('2023-09-05'),
      activeMap: false
    },
    {
      id: 5,
      title: 'Apartment in Bibliotheca Alexandrina',
      description: 'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'Bibliotheca Alexandrina, Alexandria, Egypt',
      price: 30000,
      type: 'Rent',
      propertyCategory: 'Twin Houses',
      status: 'Auctioned',
      images: ['propertyImages/5.jpg', 'propertyImages/6.jpg'],
      sellerId: 3,
      bedrooms: 8,
      bathrooms: 4,
      space: 250,
      isFavorite: false,
      userImage: '',
      userName: '',
      date: new Date('2024-02-28'),
      activeMap: false
    },
    {
      id: 6,
      title: 'Apartment in Maadi',
      description: 'Luxurious apartment with green view.Spacious villa with a beautiful garden.Spacious villa with a beautiful garden.',
      location: 'Maadi, Cairo, Egypt',
      price: 4561180,
      type: 'Sell',
      propertyCategory: 'Apartment',
      status: 'Available',
      images: ['propertyImages/1.jpg', 'propertyImages/2.jpg', 'propertyImages/1.jpg', 'propertyImages/2.jpg'],
      agentId: 5,
      bedrooms: 3,
      bathrooms: 3,
      space: 130,
      isFavorite: true,
      userImage: '',
      userName: '',
      date: new Date('2024-03-15'),
      activeMap: false
    },
    {
      id: 7,
      title: 'Apartment in Zamalek',
      description: 'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'Zamalek, Cairo, Egypt',
      price: 9500000,
      type: 'Sell',
      propertyCategory: 'Villa',
      status: 'Sold',
      images: ['propertyImages/3.jpg', 'propertyImages/4.jpg'],
      sellerId: 3,
      bedrooms: 4,
      bathrooms: 4,
      space: 250,
      isFavorite: false,
      userImage: '',
      userName: '',
      date: new Date('2023-11-22'),
      activeMap: false
    },
    {
      id: 8,
      title: 'Apartment in Giza',
      description: 'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'Haram, Giza',
      price: 30000,
      type: 'Rent',
      propertyCategory: 'Villa',
      status: 'Auctioned',
      images: ['propertyImages/5.jpg', 'propertyImages/6.jpg'],
      sellerId: 3,
      bedrooms: 5,
      bathrooms: 4,
      space: 250,
      isFavorite: false,
      userImage: '',
      userName: '',
      date: new Date('2024-01-10'),
      activeMap: false
    },
    {
      id: 9,
      title: 'Apartment in Gouna',
      description: 'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'El Gouna Conference & Culture Center, El Gouna, Egypt',
      price: 9500000,
      type: 'Sell',
      propertyCategory: 'Duplexes',
      status: 'Sold',
      images: ['propertyImages/3.jpg', 'propertyImages/4.jpg'],
      sellerId: 3,
      bedrooms: 5,
      bathrooms: 4,
      space: 250,
      isFavorite: false,
      userImage: '',
      userName: '',
      date: new Date('2023-09-05'),
      activeMap: false
    },
    {
      id: 10,
      title: 'Apartment in Bibliotheca Alexandrina',
      description: 'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'Bibliotheca Alexandrina, Alexandria, Egypt',
      price: 30000,
      type: 'Rent',
      propertyCategory: 'Twin Houses',
      status: 'Auctioned',
      images: ['propertyImages/5.jpg', 'propertyImages/6.jpg'],
      sellerId: 3,
      bedrooms: 8,
      bathrooms: 4,
      space: 250,
      isFavorite: false,
      userImage: '',
      userName: '',
      date: new Date('2024-02-28'),
      activeMap: false
    }
  ];


  //---------------------------------------------------------------------------------------
  featuredAgents: Agent[] = [
    {
      photo: 'propertyImages/user.jpeg',
      name: 'Amir Hassan',
      dateJoined: '15 March 2018',
      email: 'amir.hassan@propfinder-eg.com',
    },
    {
      photo: 'propertyImages/user.jpeg',
      name: 'Layla Mahmoud',
      dateJoined: '12 July 2020',
      email: 'layla.m@propfinder-eg.com',
    },
    {
      photo: 'propertyImages/user.jpeg',
      name: 'Omar Khalid',
      dateJoined: '5 May 2019',
      email: 'omar.k@propfinder-eg.com',
    },
    {
      photo: 'propertyImages/user.jpeg',
      name: 'Nour El-Din',
      dateJoined: '20 January 2017',
      email: 'nour.eldin@propfinder-eg.com',
    },
    {
      photo: 'propertyImages/user.jpeg',
      name: 'Farida Samir',
      dateJoined: '28 February 2022',
      email: 'farida.s@propfinder-eg.com',
    }
  ];


  //---------------------------------------------------------------------------------------
  products: ProductDTO[] = [
    {
      id: 1,
      name: 'Luxury Sectional Sofa',
      description: '3-piece modular sectional sofa with premium top-grain leather upholstery and high-density foam cushions. Features reclining seats, built-in cup holders, and USB charging ports. Configurable in multiple layouts with reversible chaise. Includes decorative throw pillows. Seat depth: 22", total dimensions: 120"W x 60"D x 36"H.',
      price: 1899.00,
      quantity: 3,
      isUsed: false,
      averageRating: 4.8,
      categoryID: 2,
      categoryName: 'Living Room Furniture',
      Productimages: [
        'productImages/4.jpg',
        'productImages/5.jpg',
        'productImages/7.jpg',
        'productImages/11.jpg',
        'productImages/4.jpg',
        'productImages/5.jpg',
        'productImages/7.jpg',
        'productImages/11.jpg',
        'productImages/4.jpg',
        'productImages/5.jpg',
        'productImages/7.jpg',
        'productImages/11.jpg',
        'productImages/4.jpg',
        'productImages/5.jpg',
        'productImages/7.jpg',
        'productImages/11.jpg'
      ],
      isFavorite: true,
      colors: ['black', 'gray', '#2a5f8b', '#4a7d5e', 'black', 'gray', '#c38e79', '#2a5f8b', '#4a7d5e'],
      numOfReviews: 130,
      date: new Date('2025-04-15')
    },
    {
      id: 2,
      name: 'Ergonomic Office Chair',
      description: 'Premium ergonomic office chair featuring adjustable seat height, 360-degree swivel base, and reclining backrest. Built with breathable mesh material and enhanced lumbar support for all-day comfort. Includes adjustable armrests and smooth-rolling casters. Supports up to 300 lbs. Dimensions: 25"W x 27"D x 45"-50"H.',
      price: 299.99,
      quantity: 10,
      isUsed: false,
      averageRating: 4.7,
      categoryID: 1,
      categoryName: 'Office Furniture',
      Productimages: [
        'productImages/6.jpg',
        'productImages/10.jpg',
        'productImages/11.jpg',
        'productImages/8.jpg'
      ],
      isFavorite: false,
      colors: ['black', 'gray', '#c38e79', '#2a5f8b', '#4a7d5e'],
      numOfReviews: 130,
      date: new Date('2025-03-15')
    },
    {
      id: 3,
      name: 'Modern Coffee Table',
      description: 'Contemporary round coffee table featuring a ½" thick tempered glass top with beveled edges, mounted on a sturdy brushed stainless steel base. Water-resistant and scratch-resistant surface with easy-clean functionality. Perfect for small living spaces. Diameter: 36", Height: 18". Weight capacity: 50 lbs.',
      price: 149.95,
      quantity: 7,
      isUsed: true,
      averageRating: 4.4,
      categoryID: 2,
      categoryName: 'Living Room Furniture',
      Productimages: [
        'productImages/12.jpg',
        'productImages/13.jpg',
        'productImages/14.jpg',
        'productImages/15.jpg'
      ],
      isFavorite: true,
      colors: ['black', 'gray', '#c38e79', '#2a5f8b', '#4a7d5e'],
      numOfReviews: 130,
      date: new Date('2025-03-15')
    },
    {
      id: 4,
      name: 'Bookshelf Storage Unit',
      description: 'Versatile 5-tier storage shelf made from durable engineered wood with reinforced metal brackets. Adjustable shelf heights accommodate books, decorative items, or storage bins. Features a rustic oak finish and anti-tip safety design. Overall dimensions: 31"W x 12"D x 60"H. Each shelf holds up to 35 lbs.',
      price: 199.50,
      quantity: 4,
      isUsed: false,
      averageRating: 4.6,
      categoryID: 3,
      categoryName: 'Storage Solutions',
      Productimages: [
        'productImages/9.jpg'
      ],
      isFavorite: false,
      colors: ['black', 'gray', '#c38e79', '#2a5f8b', '#4a7d5e'],
      numOfReviews: 130,
      date: new Date('2025-03-15')
    },
    {
      id: 5,
      name: 'Compact Fabric Loveseat',
      description: 'Space-saving 2-seater sofa with soft-touch polyester fabric and pocket spring cushion system. Features tapered wooden legs, removable cushion covers, and hidden storage compartment. Ideal for apartments or small living rooms. Weight capacity: 450 lbs. Dimensions: 58"W x 32"D x 30"H. Available in 6 colors.',
      price: 599.99,
      quantity: 5,
      isUsed: true,
      averageRating: 4.5,
      categoryID: 2,
      categoryName: 'Living Room Furniture',
      Productimages: [
        'productImages/1.jpg',
        'productImages/3.jpg',
        'productImages/2.jpg'
      ],
      isFavorite: true,
      colors: ['black', 'gray', '#c38e79', '#2a5f8b', '#4a7d5e'],
      numOfReviews: 130,
      date: new Date('2025-03-15'),
    }
  ];


  //---------------------------------------------------------------------------------------
  reviews: Review[] = [
    {
      userName: "Sarah Johnson",
      userImage: "propertyImages/user.jpeg",
      rating: 4.5,
      comment: "Absolutely love this sofa! Perfect combination of comfort and style. The leather quality is top-notch.",
      date: new Date("2024-03-15")
    },
    {
      userName: "Mike Chen",
      userImage: "propertyImages/user.jpeg",
      rating: 5,
      comment: "Best furniture purchase ever! The configurable layout was a game-changer for our living room.",
      date: new Date("2024-02-20")
    },
    {
      userName: "Emma Wilson",
      userImage: "propertyImages/user.jpeg",
      rating: 4,
      comment: "Great value for money. Took some time to assemble but worth the effort.",
      date: new Date("2024-04-01")
    },
    {
      userName: "David Miller",
      userImage: "propertyImages/user.jpeg",
      rating: 3.5,
      comment: "Comfortable but the color faded slightly after 2 months of use.",
      date: new Date("2024-03-01")
    },
    {
      userName: "Lisa Rodriguez",
      userImage: "propertyImages/user.jpeg",
      rating: 4.8,
      comment: "Customer service was amazing! Helped me choose the perfect configuration for my space.",
      date: new Date("2024-04-10")
    }
  ];


}
