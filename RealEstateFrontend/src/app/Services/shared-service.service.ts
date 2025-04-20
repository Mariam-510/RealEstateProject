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

@Injectable({
  providedIn: 'root'
})

export class SharedServiceService {

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



}
