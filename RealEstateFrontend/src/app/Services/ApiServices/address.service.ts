import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';

// Define interface for Address DTO
export interface AddressDto {
  id: number;
  city: string;
  street: string;
  buildingNum: string;
  apartment: string;
  floor: string;
  phoneNum: string;
  buyerId?: string;
}

// Create Address DTO interface
export interface CreateAddressDto {
  city: string;
  street: string;
  buildingNum: string;
  apartment?: string;
  floor?: string;
  phoneNum?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = `${API_CONFIG.apiUrl}api/Addresses`;

  constructor(private http: HttpClient) { }

  // Get all addresses for the current buyer
  getAllByBuyer(): Observable<AddressDto[]> {
    return this.http.get<AddressDto[]>(`${this.apiUrl}/Buyer`);
  }

  // Create new address
  createAddress(addressData: CreateAddressDto): Observable<AddressDto> {
    return this.http.post<AddressDto>(this.apiUrl, addressData);
  }

  // Delete address
  deleteAddress(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Get address by ID
  getById(id: number): Observable<AddressDto> {
    return this.http.get<AddressDto>(`${this.apiUrl}/${id}`);
  }
}
