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

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  isUsed: boolean;
  images: string[];
  averageRating: number;
  dateAdded: Date;
  reviewCount: number;
  wishlisted: boolean;
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
      images: ['https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg', 'https://www.brinkpm.com/images/blog/bigstock-Luxurious-New-Construction-Hom-165493040.webp', 'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg', 'https://images.prop24.com/331109780/Crop600x400'],
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
      images: ['https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg', 'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg', 'https://images.prop24.com/331109780/Crop600x400'],
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
      images: ['https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg', 'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg', 'https://images.prop24.com/331109780/Crop600x400'],
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
      images: ['https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg', 'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg', 'https://images.prop24.com/331109780/Crop600x400'],
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
      images: ['https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg', 'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg', 'https://images.prop24.com/331109780/Crop600x400'],
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

  HomeProperties: PropertyDto[] = [
    {
      id: 1,
      title: 'Apartment in Gouna',
      description: 'Luxurious apartment with green view.Spacious villa with a beautiful garden.Spacious villa with a beautiful garden.',
      location: 'El Gouna Conference & Culture Center, El Gouna, Egypt',
      price: 4500000,
      type: 'Sell',
      propertyCategory: 'Apartment',
      status: 'Available',
      images: ['https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg', 'https://www.brinkpm.com/images/blog/bigstock-Luxurious-New-Construction-Hom-165493040.webp', 'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg', 'https://images.prop24.com/331109780/Crop600x400'],
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
      title: 'Apartment in Gouna',
      description: 'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'El Gouna Conference & Culture Center, El Gouna, Egypt',
      price: 9500000,
      type: 'Sell',
      propertyCategory: 'Duplexes',
      status: 'Available',
      images: ['https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg', 'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg', 'https://images.prop24.com/331109780/Crop600x400'],
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
      id: 3,
      title: 'Apartment in Gouna',
      description: 'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'El Gouna Conference & Culture Center, El Gouna, Egypt',
      price: 9500000,
      type: 'Sell',
      propertyCategory: 'Duplexes',
      status: 'Available',
      images: ['https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg', 'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg', 'https://images.prop24.com/331109780/Crop600x400'],
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
  ];

  HomeProducts: Product[] = [
    {
      id: 1,
      name: 'Jacklinnnnnnnnn sddd dsdsd sd sd sd sdfsdf',
      description: 'Upholstered King Size Bed with Tufted Headboarddddddddddddddddddddddddddd',
      price: 700,
      quantity: 100,
      isUsed: false,
      images: [
        'https://www.mocka.com.au/cdn/shop/files/T04028_HiRes_01.jpg?v=1728479772&width=2040',
        'https://denovofurniture.pk/wp-content/uploads/2024/06/Opulence-New-5.jpg',
        'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg'
      ],
      averageRating: 5,
      dateAdded: new Date("2025-04-13"),
      reviewCount: 88,
      wishlisted: true
    },
    {
      id: 2,
      name: 'tt RODDDDDDDDDDDDD ssdf wer',
      description: 'Upholstered King Sizd',
      price: 2000,
      quantity: 30,
      isUsed: true,
      images: [
        'https://wasilaah.com/cdn/shop/products/IMG_9996.jpg?v=1679343647&width=2048',
        'https://babymore.co.uk/wp-content/uploads/2023/02/Mona-2-Piece-Room-Set-GREY-1-scaled.jpg',
        'https://digital.ihg.com/is/image/ihg/intercontinental-cairo-10367348719-2x1'
      ],
      averageRating: 2,
      dateAdded: new Date("2023-07-07"),
      reviewCount: 33,
      wishlisted: true
    },
    {
      id: 3,
      name: 'ALOOOOOOO',
      description: 'Upholstered King Size Bed with Tufted Headboarddddddddddddddddddddddddddd',
      price: 1900,
      quantity: 4,
      isUsed: true,
      images: [
        'https://www.crossegyptchallenge.com/wp-content/uploads/2022/07/cairo01.jpg',
        'https://www.atlys.com/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FW3Iz4WACAy2J0qT0cCT3xA%2Fdidi%2Farticles%2Fl6ozcxn3e3a6lzrs6n6pg9lq%2Fpublic&w=1920&q=75',
        'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg',
        'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg'
      ],
      averageRating: 3.5,
      dateAdded: new Date("2025-04-04"),
      reviewCount: 10,
      wishlisted: true
    },
  ]


  HomePageProperties: PropertyDto[] = [
    {
      id: 1,
      title: 'Apartment in Maadi',
      description: 'Luxurious apartment with green view.Spacious villa with a beautiful garden.Spacious villa with a beautiful garden.',
      location: 'Maadi, Cairo, Egypt',
      price: 4561180,
      type: 'Sell',
      propertyCategory: 'Apartment',
      status: 'Available',
      images: ['https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg', 'https://www.brinkpm.com/images/blog/bigstock-Luxurious-New-Construction-Hom-165493040.webp', 'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg', 'https://images.prop24.com/331109780/Crop600x400'],
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
      title: 'Apartment in Giza',
      description: 'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'Haram, Giza',
      price: 30000,
      type: 'Rent',
      propertyCategory: 'Villa',
      status: 'Auctioned',
      images: ['https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg', 'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg', 'https://images.prop24.com/331109780/Crop600x400'],
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
      id: 3,
      title: 'Apartment in Bibliotheca Alexandrina',
      description: 'Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden. Spacious villa with a beautiful garden.',
      location: 'Bibliotheca Alexandrina, Alexandria, Egypt',
      price: 30000,
      type: 'Rent',
      propertyCategory: 'Twin Houses',
      status: 'Auctioned',
      images: ['https://images.dailynewsegypt.com/2024/09/real-estate-property.jpg', 'https://u.realgeeks.media/songrealestate/_rgg/landscape_images/GreyandBeigeHome.jpg', 'https://images.prop24.com/331109780/Crop600x400'],
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

  products: Product[] = [
    {
      id: 1,
      name: 'Jacklinnnnnnnnn sddd dsdsd sd sd sd sdfsdf',
      description: 'Upholstered King Size Bed with Tufted Headboarddddddddddddddddddddddddddd',
      price: 700,
      quantity: 100,
      isUsed: false,
      images: [
        'https://www.mocka.com.au/cdn/shop/files/T04028_HiRes_01.jpg?v=1728479772&width=2040',
        'https://denovofurniture.pk/wp-content/uploads/2024/06/Opulence-New-5.jpg',
        'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg'
      ],
      averageRating: 5,
      dateAdded: new Date("2025-04-13"),
      reviewCount: 88,
      wishlisted: true
    },
    {
      id: 2,
      name: 'tt RODDDDDDDDDDDDD ssdf wer',
      description: 'Upholstered King Sizd',
      price: 2000,
      quantity: 30,
      isUsed: true,
      images: [
        'https://wasilaah.com/cdn/shop/products/IMG_9996.jpg?v=1679343647&width=2048',
        'https://babymore.co.uk/wp-content/uploads/2023/02/Mona-2-Piece-Room-Set-GREY-1-scaled.jpg',
        'https://digital.ihg.com/is/image/ihg/intercontinental-cairo-10367348719-2x1'
      ],
      averageRating: 2,
      dateAdded: new Date("2023-07-07"),
      reviewCount: 33,
      wishlisted: true
    },
    {
      id: 3,
      name: 'ALOOOOOOO',
      description: 'Upholstered King Size Bed with Tufted Headboarddddddddddddddddddddddddddd',
      price: 1900,
      quantity: 4,
      isUsed: true,
      images: [
        'https://www.crossegyptchallenge.com/wp-content/uploads/2022/07/cairo01.jpg',
        'https://www.atlys.com/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FW3Iz4WACAy2J0qT0cCT3xA%2Fdidi%2Farticles%2Fl6ozcxn3e3a6lzrs6n6pg9lq%2Fpublic&w=1920&q=75',
        'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg',
        'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg'
      ],
      averageRating: 3.5,
      dateAdded: new Date("2025-04-04"),
      reviewCount: 10,
      wishlisted: true
    },
    {
      id: 4,
      name: 'Jacklinnnnnnnnn sddd dsdsd sd sd sd sdfsdf',
      description: 'Upholstered King Size Bed with Tufted Headboarddddddddddddddddddddddddddd',
      price: 700,
      quantity: 100,
      isUsed: false,
      images: [
        'https://www.mocka.com.au/cdn/shop/files/T04028_HiRes_01.jpg?v=1728479772&width=2040',
        'https://denovofurniture.pk/wp-content/uploads/2024/06/Opulence-New-5.jpg',
        'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg'
      ],
      averageRating: 5,
      dateAdded: new Date("2023-01-01"),
      reviewCount: 88,
      wishlisted: false
    },
    {
      id: 5,
      name: 'tt RODDDDDDDDDDDDD ssdf wer',
      description: 'Upholstered King Sizd',
      price: 2000,
      quantity: 30,
      isUsed: false,
      images: [
        'https://wasilaah.com/cdn/shop/products/IMG_9996.jpg?v=1679343647&width=2048',
        'https://babymore.co.uk/wp-content/uploads/2023/02/Mona-2-Piece-Room-Set-GREY-1-scaled.jpg',
        'https://digital.ihg.com/is/image/ihg/intercontinental-cairo-10367348719-2x1'
      ],
      averageRating: 2,
      dateAdded: new Date("2023-07-07"),
      reviewCount: 33,
      wishlisted: false
    },
    {
      id: 6,
      name: 'ALOOOOOOO',
      description: 'Upholstered King Size Bed with Tufted Headboarddddddddddddddddddddddddddd',
      price: 1900,
      quantity: 4,
      isUsed: true,
      images: [
        'https://www.crossegyptchallenge.com/wp-content/uploads/2022/07/cairo01.jpg',
        'https://www.atlys.com/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FW3Iz4WACAy2J0qT0cCT3xA%2Fdidi%2Farticles%2Fl6ozcxn3e3a6lzrs6n6pg9lq%2Fpublic&w=1920&q=75',
        'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg',
        'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg'
      ],
      averageRating: 3.5,
      dateAdded: new Date("2025-04-04"),
      reviewCount: 10,
      wishlisted: false
    },
    {
      id: 7,
      name: 'Jacklinnnnnnnnn sddd dsdsd sd sd sd sdfsdf',
      description: 'Upholstered King Size Bed with Tufted Headboarddddddddddddddddddddddddddd',
      price: 700,
      quantity: 100,
      isUsed: false,
      images: [
        'https://www.mocka.com.au/cdn/shop/files/T04028_HiRes_01.jpg?v=1728479772&width=2040',
        'https://denovofurniture.pk/wp-content/uploads/2024/06/Opulence-New-5.jpg',
        'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg'
      ],
      averageRating: 5,
      dateAdded: new Date("2023-01-01"),
      reviewCount: 88,
      wishlisted: true
    },
    {
      id: 8,
      name: 'tt RODDDDDDDDDDDDD ssdf wer',
      description: 'Upholstered King Sizd',
      price: 2000,
      quantity: 30,
      isUsed: false,
      images: [
        'https://wasilaah.com/cdn/shop/products/IMG_9996.jpg?v=1679343647&width=2048',
        'https://babymore.co.uk/wp-content/uploads/2023/02/Mona-2-Piece-Room-Set-GREY-1-scaled.jpg',
        'https://digital.ihg.com/is/image/ihg/intercontinental-cairo-10367348719-2x1'
      ],
      averageRating: 2,
      dateAdded: new Date("2023-07-07"),
      reviewCount: 33,
      wishlisted: true
    },
    {
      id: 9,
      name: 'ALOOOOOOO',
      description: 'Upholstered King Size Bed with Tufted Headboarddddddddddddddddddddddddddd',
      price: 1900,
      quantity: 4,
      isUsed: true,
      images: [
        'https://www.crossegyptchallenge.com/wp-content/uploads/2022/07/cairo01.jpg',
        'https://www.atlys.com/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FW3Iz4WACAy2J0qT0cCT3xA%2Fdidi%2Farticles%2Fl6ozcxn3e3a6lzrs6n6pg9lq%2Fpublic&w=1920&q=75',
        'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg',
        'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg'
      ],
      averageRating: 3.5,
      dateAdded: new Date("2025-04-04"),
      reviewCount: 10,
      wishlisted: false
    },
  ];

  cartItems = [
    {
      name: 'Modern Sofa',
      price: 899.99,
      quantity: 1,
      image: 'https://example.com/sofa.jpg'
    },
    {
      name: 'Coffee Table',
      price: 299.99,
      quantity: 2,
      image: 'https://example.com/table.jpg'
    }
  ];
}
