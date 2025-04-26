// filter.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FilterState {
  category: string;
  condition: string;
  rating: number;
  minPrice: number;
  maxPrice: number;
  sortBy: string;  // Add sortBy to the state
}


@Injectable({
  providedIn: 'root'
})
export class ProductFilterService {
  private defaultFilters: FilterState = {
    category: '',
    condition: '',
    rating: 0,
    minPrice: 0,
    maxPrice: Number.MAX_SAFE_INTEGER,
    sortBy: ''
  };

  private filters = new BehaviorSubject<FilterState>(this.defaultFilters);
  currentFilters = this.filters.asObservable();

  updateFilters(updatedFilters: Partial<FilterState>) {
    const current = this.filters.value;
    this.filters.next({ ...current, ...updatedFilters });
  }

  resetFilters() {
    this.filters.next(this.defaultFilters);
  }
}
