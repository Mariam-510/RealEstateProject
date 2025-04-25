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
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  private apiUrl = `${API_CONFIG.apiUrl}api/Property`;

  constructor(private http: HttpClient) { }

  getAllProperties(): Observable<PropertyDTO[]> {
    
    return this.http.get<PropertyDTO[]>(`${this.apiUrl}`);
  }
}
