import { Injectable } from '@angular/core';
import { API_CONFIG } from '../../app.config';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  addedDate: string;
  date: Date;
  status: string;
  images: string[];
  agentId: number | null;
  sellerId: number | null;
  contractImgUrl: string | null;
  isFavorite: boolean;
  activeMap: boolean;
  userName: string | null;
  userImage: string | null;
  approvalStatus: string;
}

export enum PropertyApprovalStatus {
  Pending,
  Approved,
  Rejected,
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
  Rent = 'Rent',
}

export enum PropertyStatus {
  Available = 'Available',
  Sold = 'Sold',
  Auctioned = 'Auctioned',
}

export enum PropertyCategory {
  Apartment = 'Apartment',
  Villa = 'Villa',
  House = 'House',
  Studio = 'Studio',
  Penthouse = 'Penthouse',
  Duplex = 'Duplex',
  Townhouse = 'Townhouse',
  Mansion = 'Mansion',
}

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private apiUrl = `${API_CONFIG.apiUrl}api/Property`;

  constructor(private http: HttpClient) {}

  getAll(
    category?: string,
    status?: string,
    type?: string,
    searchByLocation?: string
  ): Observable<PropertyDTO[]> {
    // Setup HTTP parameters
    let params = new HttpParams();
    if (category) params = params.append('category', category);
    if (status) params = params.append('status', status);
    if (type) params = params.append('type', type);
    if (searchByLocation)
      params = params.append('searchByLocation', searchByLocation);

    // Make GET request to the endpoint
    return this.http.get<PropertyDTO[]>(this.apiUrl, { params });
  }

  getAllPropertiesUnfiltered(): Observable<PropertyDTO[]> {
    return this.http.get<PropertyDTO[]>(`${this.apiUrl}/all`);
  }

  getById(id: number): Observable<PropertyDTO> {
    return this.http.get<PropertyDTO>(`${this.apiUrl}/${id}`);
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
      formData.append(
        'ContractFile',
        createDto.contractFile,
        createDto.contractFile.name
      );
    }

    return this.http.post<PropertyDTO>(`${this.apiUrl}/Add`, formData);
  }

  // ___________________________________________________________________________
  // New method to get properties by seller ID with optional status
  // Include Status only when a valid value is provided

  getPropertiesBySellerId(
    status?: PropertyApprovalStatus
  ): Observable<PropertyDTO[]> {
    let params = new HttpParams();
    if (status !== undefined) {
      params = params.append('Status', status);
    }
    return this.http.get<PropertyDTO[]>(`${this.apiUrl}/Seller`, { params });
  }

  getPropertiesByAgentId(): Observable<PropertyDTO[]> {
    return this.http.get<PropertyDTO[]>(`${this.apiUrl}/Agent`);
  }

  getPendingProperties(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Pending`);
  }

  updateApprovalStatus(propertyId: number, status: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/UpdateApprovalProperty/${propertyId}?Status=${status}`,
      null
    );
  }

  getAllByUserId(type?: PropertyType, status?: PropertyStatus): Observable<{ propertyCount: number }> {
    let params = new HttpParams();
    if (type) params = params.append('type', type);
    if (status) params = params.append('status', status);
    return this.http.get<{ propertyCount: number }>(`${this.apiUrl}/GetAllByUserId`, { params });
  }

  getRevenue(): Observable<{ totalRevenue: number, totalSales: number, totalRentals: number }> {
    return this.http.get<{ totalRevenue: number, totalSales: number, totalRentals: number }>(`${this.apiUrl}/GetRevenue`);
  }

  getHighestWishlistedProperty(): Observable<{ property: PropertyDTO, wishListCount: number }> {
    return this.http.get<{ property: PropertyDTO, wishListCount: number }>(
      `${this.apiUrl}/GetHighestWishlistedProperty`
    );
  }

  getMostCompletedAppointments(): Observable<{ property: PropertyDTO, appointmentCount: number }> {
    return this.http.get<{ property: PropertyDTO, appointmentCount: number }>(
      `${this.apiUrl}/GetMostCompletedAppointments`
    );
  }

  getRevenueByPropertyCategory(): Observable<{ category: string, totalSalesRevenue: number, totalRentalRevenue: number }[]> {
    return this.http.get<{ category: string, totalSalesRevenue: number, totalRentalRevenue: number }[]>(`${this.apiUrl}/GetRevenueByPropertyCategory`);
  }
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Delete/${id}`);
  }
}
