import {
  Component,
  HostListener,
  OnInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ProductDto } from '../../Services/product.service';
import { ProductService } from '../../Services/product.service';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductListItemComponent } from '../product-list-item/product-list-item.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    CommonModule,
    ProductCardComponent,
    ProductListItemComponent,
    RouterModule,
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnInit {
  @ViewChild('sortBtn') sortBtn!: ElementRef;
  products: ProductDto[] = [];
  loading = true;
  error = '';
  categoryName = 'New Arrivals';
  sortDropdownOpen = false;
  sortOption = 'recommended';
  viewMode = 'grid';

  currentPage = 1;
  itemsPerPage = 9;
  totalPages = 0;
  visiblePages: (number | string)[] = [];

  constructor(
    private productService: ProductService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.loadProductsByCategory('string');
  }

  loadProductsByCategory(category: string) {
    this.loading = true;
    this.productService.getProductsByCategory(category).subscribe({
      next: (response) => {
        this.products = response.productDtoList;
        this.totalPages = Math.ceil(this.products.length / this.itemsPerPage);
        this.updateVisiblePages();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products';
        this.loading = false;
        console.error(err);
      },
    });
  }

  toggleSortDropdown() {
    this.sortDropdownOpen = !this.sortDropdownOpen;
  }

  setSortOption(option: string) {
    this.sortOption = option;
    this.sortDropdownOpen = false;
    this.sortProducts();
  }

  sortProducts() {
    // Implementation of different sort methods
    switch (this.sortOption) {
      case 'priceHighToLow':
        this.products = [...this.products].sort((a, b) => b.price - a.price);
        break;
      case 'priceLowToHigh':
        this.products = [...this.products].sort((a, b) => a.price - b.price);
        break;
      case 'alphabetical':
        this.products = [...this.products].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        break;
      case 'newArrival':
        this.products = [...this.products].sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
        break;
    }
    this.currentPage = 1;
    this.updateVisiblePages();
  }

  toggleViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (
      this.sortDropdownOpen &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.sortDropdownOpen = false;
    }
  }

  // Add these new methods
  goToPage(page: number | string): void {
    if (typeof page === 'string' || page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateVisiblePages();
  }

  updateVisiblePages() {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      if (current === total) pages.push(current - 2);
      if (current > 2) pages.push(current - 1);
      if (current !== 1 && current !== total) pages.push(current);
      if (current < total - 1) pages.push(current + 1);
      if (current === 1) pages.push(current + 2);
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }

    this.visiblePages = [...new Set(pages)];
  }

  get paginatedProducts(): ProductDto[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.products.slice(start, end);
  }
}
