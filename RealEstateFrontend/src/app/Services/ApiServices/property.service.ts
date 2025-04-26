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
  status: string;
  images: string[];
  agentId: number | null;
  sellerId: number | null;
  contractImgUrl: string | null;
  isFavorite: boolean;
  activeMap: boolean;
  userName: string | null;
  userImage: string | null;
}
export enum PropertyApprovalStatus {
  Pending,
  Approved,
  Rejected
}
@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  private apiUrl = `${API_CONFIG.apiUrl}api/Property`;

  constructor(private http: HttpClient) { }

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
    if (searchByLocation) params = params.append('searchByLocation', searchByLocation);

    // Make GET request to the endpoint
    return this.http.get<PropertyDTO[]>(this.apiUrl, { params });
  }


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
}
