import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PropertyFilterState {
  searchQuery: string;
  selectedType: string;
  selectedCategory: string;
  selectedBeds: number[];
  selectedBaths: number[];
  minPrice: number;
  maxPrice: number;
  minSpace: number;
  maxSpace: number;
  sortBy: string;
}

@Injectable({ providedIn: 'root' })
export class PropertyFilterService {
  private defaultFilters: PropertyFilterState = {
    searchQuery: '',
    selectedType: '',
    selectedCategory: '',
    selectedBeds: [],
    selectedBaths: [],
    minPrice: 0,
    maxPrice: Number.MAX_SAFE_INTEGER,
    minSpace: 0,
    maxSpace: Number.MAX_SAFE_INTEGER,
    sortBy: ''
  };

  private filters = new BehaviorSubject<PropertyFilterState>(this.defaultFilters);
  currentFilters = this.filters.asObservable();

  updateFilters(updatedFilters: Partial<PropertyFilterState>) {
    const current = this.filters.value;
    this.filters.next({ ...current, ...updatedFilters });
  }

  resetFilters() {
    this.filters.next(this.defaultFilters);
  }
}
