import { Injectable } from '@angular/core';
import { API_CONFIG } from '../../app.config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PropertyDTO {
  id: number;
  title: string;
  description: string;
  location: string;
  price: number;
  type: string;
  propertyCategory: string;
  bedRooms: number;
  bathRooms: number;
  space: number;
  addedDate: Date;
  status: string;
  images: string[];
  agentId: number | null;
  sellerId: number | null;
  contractImgUrl: string | null;
  isFavorite: boolean;
<<<<<<< Updated upstream
}

=======
  activeMap: boolean;
  userName: string | null;
  userImage: string | null;
}

export enum PropertyApprovalStatus {
  Pending,
  Approved,
  Rejected
}

export interface CreatePropertyDTO {
  title: string;
  description: string;
  location: string;
  price: number;
  type: string;
  propertyCategory: string;
  bedRooms: number;
  bathRooms: number;
  space: number;
  // status: string;
  images: File[];
  contractFile?: File;
}

export enum PropertyType {
  Sell = 'Sell',
  Rent = 'Rent'
}

export enum PropertyStatus {
  Available = 'Available',
  Sold = 'Sold',
  Auctioned = 'Auctioned'
}

export enum PropertyCategory {
  Apartment = 'Apartment',
  Villa = 'Villa',
  House = 'House',
  Studio = 'Studio',
  Penthouse = 'Penthouse',
  Duplex = 'Duplex',
  Townhouse = 'Townhouse',
  Mansion = 'Mansion'
}

>>>>>>> Stashed changes
@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  private apiUrl = `${API_CONFIG.apiUrl}api/Property`;

  constructor(private http: HttpClient) { }

  getAllProperties(): Observable<PropertyDTO[]> {
    
    return this.http.get<PropertyDTO[]>(`${this.apiUrl}`);
  }
<<<<<<< Updated upstream
=======


  getById(id: number): Observable<PropertyDTO> {
    return this.http.get<PropertyDTO>(`${this.apiUrl}/${id}`);
  }

  // ___________________________________________________________________________
  // New method to get properties by seller ID with optional status
  // Include Status only when a valid value is provided
  getPropertiesBySellerId(status?: PropertyApprovalStatus): Observable<PropertyDTO[]> {
    let params = new HttpParams();
    if (status !== undefined) {
      params = params.append('Status', status);
    }
    return this.http.get<PropertyDTO[]>(`${this.apiUrl}/Seller`, { params });
  }

  getPropertiesByAgentId(): Observable<PropertyDTO[]> {
    return this.http.get<PropertyDTO[]>(`${this.apiUrl}/Agent`);
  }

  addProperty(createDto: CreatePropertyDTO): Observable<PropertyDTO> {
    
    const formData = new FormData();

    // Append all properties from the DTO
    formData.append('Title', createDto.title);
    formData.append('Description', createDto.description);
    formData.append('Location', createDto.location);
    formData.append('Price', createDto.price.toString());
    formData.append('Type', createDto.type);
    formData.append('PropertyCategory', createDto.propertyCategory);
    formData.append('BedRooms', createDto.bedRooms.toString());
    formData.append('BathRooms', createDto.bathRooms.toString());
    formData.append('Space', createDto.space.toString());
    // formData.append('Status', createDto.status);

    // Append each image file
    createDto.images.forEach((image, index) => {
      formData.append(`Images`, image, image.name);
    });

    // Append contract file if exists
    if (createDto.contractFile) {
      formData.append('ContractFile', createDto.contractFile, createDto.contractFile.name);
    }

    return this.http.post<PropertyDTO>(`${this.apiUrl}/Add`, formData);
  }

>>>>>>> Stashed changes
}
