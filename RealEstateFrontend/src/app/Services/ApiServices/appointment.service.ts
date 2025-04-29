import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { API_CONFIG } from '../../app.config';

// DTO Interfaces
export interface CreateAppointmentDto {
  scheduledTime: string;
  type: string;
  status: string;
}
export interface PropertyDto {
  id: number;
  title: string;
  location: string;
  price: number;
  type: string; // Sell or Rent

  images: string[];
    agentId:number
  sellerId :number,
  userName:string,
  userImage:string,
  userType:string,
}

export interface AppointmentDto {
  id: number;
  scheduledTime: string;
  type: AppointmentType;
  status: AppointmentStatus;
  property: PropertyDto;  
  buyerName:string; // <-- add this
  buyerEmail:string; // <-- add this
  buyerImage:string; // <-- add this


}
export enum AppointmentType {
  Virtual = 'Virtual',
  InPerson = 'InPerson'
}

export enum AppointmentStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',   // <== ADD this
  Cancelled = 'Cancelled',
  Completed = 'Completed'
}
@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${API_CONFIG.apiUrl}api/Appointment`;
  constructor(private http: HttpClient) { }
  //CREATE

  createAppointment(
    propertyId: number, 
    type: string,
    appointmentData: CreateAppointmentDto
  ): Observable<AppointmentDto> {
    if (isNaN(propertyId)) {
      return throwError(() => new Error('Invalid property ID'));
    }
    
    const params = new HttpParams().set('type', type);
    
    return this.http.post<AppointmentDto>(
      `${this.apiUrl}/book/${propertyId}`, 
      appointmentData,
      { params }
    );
  }
  GetAppointments(
    sortOrder: string = 'desc',
    status?: string
  ): Observable<AppointmentDto[]> {
    let params = new HttpParams().set('sortOrder', sortOrder);
  
    if (status) {
      params = params.set('status', status);
    }
  
    return this.http.get<AppointmentDto[]>(`${this.apiUrl}/user/BuyerViewAllAppointment`, { params });
  }
  
  updateStatus(id: number, status: AppointmentStatus): Observable<AppointmentDto> {
    return this.http.patch<AppointmentDto>(
      `${this.apiUrl}/${id}/status`,
      { status }
    );
  }
  
  
}
