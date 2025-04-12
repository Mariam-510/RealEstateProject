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

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
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
        this.products = response.productDto;
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
     
    }
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
}
