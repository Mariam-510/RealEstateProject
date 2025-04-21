import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { CatSliderComponent } from '../Sliders/cat-slider/cat-slider.component';
import { Product, SharedService } from '../../../../Services/shared.service';

@Component({
  selector: 'app-p-home',
  imports: [CommonModule, RouterModule, CatSliderComponent, FormsModule, NgxSliderModule],
  templateUrl: './p-home.component.html',
  styleUrl: './p-home.component.css'
})
export class PHomeComponent implements OnInit {

  constructor(private _sharedService: SharedService, private cdr: ChangeDetectorRef) { }

  products: Product[] = [];
  hoverStates: { [key: number]: boolean } = {};
  currentImageIndices: { [key: number]: number } = {};
  currentImageIndicesTopRated: { [key: number]: number } = {};

  ngOnInit(): void {

    this.sliderStartAutoScroll();

    this.products = this._sharedService.products;

    this.products.forEach(product => {
      this.currentImageIndices[product.id] = 0;
      this.currentImageIndicesTopRated[product.id] = 0;
      this.hoverStates[product.id] = false;
    });

    this.minPrice = Math.min(...this.products.map(p => p.price));
    this.maxPrice = Math.max(...this.products.map(p => p.price));
    this.sliderOptions.ceil = this.maxPrice;

    this.sliderOptions = {
      floor: this.minPrice,
      ceil: this.maxPrice,
      translate: (value: number) => `${value.toLocaleString()} EGP`
    };

    this.applyFilters();
  }

  sliderOptions: Options = {
    floor: 0,
    ceil: 1000000,
    translate: () => '',          // Remove value labels
    hideLimitLabels: true,        // Hide default min/max labels (0 and 1,000,000)
    hidePointerLabels: true,      // Hide handle labels
    showTicks: false,             // Remove tick marks
    showTicksValues: false        // Remove numbers under ticks
  };



  Math = Math;
  activeSlide = 0;
  private sliderAutoScrollSubscription: Subscription | null = null;
  private sliderAutoScrollInterval = 3000;

  slides = [
    {
      imageUrl: 'https://www.crossegyptchallenge.com/wp-content/uploads/2022/07/cairo01.jpg',
      alt: 'Cairo cityscape',
      title: 'ROI1 for property in Cairo reaches 10%-15%',
      subtitle: 'Buy property and gain profit'
    },
    {
      imageUrl: 'https://www.atlys.com/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FW3Iz4WACAy2J0qT0cCT3xA%2Fdidi%2Farticles%2Fl6ozcxn3e3a6lzrs6n6pg9lq%2Fpublic&w=1920&q=75',
      alt: 'Cairo street view',
      title: 'ROI2 for property in Cairo reaches 10%-15%',
      subtitle: 'Buy property and gain profit'
    },
    {
      imageUrl: 'https://digital.ihg.com/is/image/ihg/intercontinental-cairo-10367348719-2x1',
      alt: 'Cairo hotel',
      title: 'ROI3 for property in Cairo reaches 10%-15%',
      subtitle: 'Buy property and gain profit'
    }
  ];


  categories = [
    { id: 1, name: 'BEDS', imageUrl: 'https://www.mocka.com.au/cdn/shop/files/T04028_HiRes_01.jpg?v=1728479772&width=2040' },
    { id: 2, name: 'SOFAS', imageUrl: 'https://denovofurniture.pk/wp-content/uploads/2024/06/Opulence-New-5.jpg' },
    { id: 3, name: 'CHAIRS', imageUrl: 'https://images.eq3.com/image-service/a0067633-232a-4dff-b0b9-bc26c0651211/Joan-Chair-30215-02-Panama-Grey-Black-Ash-Legs-Front-Web_ORIGINAL.jpg' },
    { id: 4, name: 'TABLES', imageUrl: 'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg' },
    { id: 5, name: 'TV UNITS', imageUrl: 'https://wasilaah.com/cdn/shop/products/IMG_9996.jpg?v=1679343647&width=2048' },
    { id: 6, name: 'ROOM SETS', imageUrl: 'https://www.raneen.com/media/catalog/product/1/5/153_qj0fycqtckj854wf.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=&width=' },
    { id: 7, name: 'BABY ROOMS', imageUrl: 'https://babymore.co.uk/wp-content/uploads/2023/02/Mona-2-Piece-Room-Set-GREY-1-scaled.jpg' },
  ];


  sliderStartAutoScroll(): void {
    this.sliderStopAutoScroll(); // Ensure we don't have multiple subscriptions

    this.sliderAutoScrollSubscription = interval(this.sliderAutoScrollInterval).subscribe(() => {
      this.next();
    });
  }

  sliderStopAutoScroll(): void {
    if (this.sliderAutoScrollSubscription) {
      this.sliderAutoScrollSubscription.unsubscribe();
      this.sliderAutoScrollSubscription = null;
    }
  }

  next(): void {
    this.activeSlide = (this.activeSlide + 1) % this.slides.length;
  }

  prev(): void {
    this.activeSlide = (this.activeSlide - 1 + this.slides.length) % this.slides.length;
  }

  setActiveSlide(index: number): void {
    this.activeSlide = index;
    this.resetAutoScroll();
  }

  resetAutoScroll(): void {
    // Reset the timer when manually changing slides
    this.sliderStartAutoScroll();
    this.sliderStopAutoScroll();
  }

  @ViewChild('slider', { static: false }) slider!: ElementRef;
  @ViewChild('topRatedSlider', { static: false }) topRatedSlider!: ElementRef;

  canScrollLeftProduct = false;
  canScrollRightProduct = true;

  canScrollLeftTopRatedProduct = false;
  canScrollRightTopRatedProduct = true;

  filteredProducts: Product[] = this.products;

  selectedCategory: string = '';
  selectedState: string = '';
  selectedRating: number = 0;
  minPrice = 0;
  maxPrice = 1000000;


  toggleCategory(category: string): void {
    this.selectedCategory = category === 'All Categories' ? '' : category;
    this.applyFilters();
  }

  toggleState(state: string): void {
    this.selectedState = state === 'All Conditions' ? '' : state;
    this.applyFilters();
  }

  toggleRating(rating: number): void {
    this.selectedRating = this.selectedRating === rating ? 0 : rating;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory = !this.selectedCategory ||
        this.categories.some(cat => cat.name === this.selectedCategory);

      const matchesState = !this.selectedState ||
        (this.selectedState === 'New' && !product.isUsed) ||
        (this.selectedState === 'Used' && product.isUsed);

      const matchesPrice = product.price >= this.minPrice &&
        product.price <= this.maxPrice;

      const matchesRating = product.averageRating >= this.selectedRating;

      return matchesCategory && matchesState && matchesPrice && matchesRating;
    });
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedState = '';
    this.selectedRating = 0;
    this.minPrice = 0;
    this.maxPrice = Number.MAX_SAFE_INTEGER;
    this.applyFilters();
  }

  scrollLeft() {
    this.slider.nativeElement.scrollBy({ left: -326, behavior: 'smooth' });
  }

  scrollRight() {
    this.slider.nativeElement.scrollBy({ left: 326, behavior: 'smooth' });
  }

  checkScroll() {
    const el = this.slider.nativeElement;
    this.canScrollLeftProduct = el.scrollLeft > 0;
    this.canScrollRightProduct = el.scrollLeft < el.scrollWidth - (el.clientWidth + 5);
    // Trigger change detection manually to prevent the ExpressionChangedAfterItHasBeenCheckedError
    this.cdr.detectChanges();
  }

  scrollLeftTopRatedProduct() {
    this.topRatedSlider.nativeElement.scrollBy({ left: -326, behavior: 'smooth' });
  }

  scrollRightTopRatedProduct() {
    this.topRatedSlider.nativeElement.scrollBy({ left: 326, behavior: 'smooth' });
  }

  checkScrollTopRatedProduct() {
    const el = this.topRatedSlider.nativeElement;
    this.canScrollLeftTopRatedProduct = el.scrollLeft > 0;
    this.canScrollRightTopRatedProduct = el.scrollLeft < el.scrollWidth - (el.clientWidth + 5);
    // Trigger change detection manually to prevent the ExpressionChangedAfterItHasBeenCheckedError
    this.cdr.detectChanges();
  }

  nextImage(productId: number) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.currentImageIndices[productId] =
        (this.currentImageIndices[productId] + 1) % product.images.length;
    }
  }

  prevImage(productId: number) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.currentImageIndices[productId] =
        (this.currentImageIndices[productId] - 1 + product.images.length) % product.images.length;
    }
  }

  nextImageTopRated(productId: number) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.currentImageIndicesTopRated[productId] =
        (this.currentImageIndicesTopRated[productId] + 1) % product.images.length;
    }
  }

  prevImageTopRated(productId: number) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.currentImageIndicesTopRated[productId] =
        (this.currentImageIndicesTopRated[productId] - 1 + product.images.length) % product.images.length;
    }
  }

  toggleWishList(productId: number) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      product.wishlisted = !product.wishlisted;
    }
  }

  addToCart(productId: number) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      // this.cartService.addToCart(product);
    }
  }

  // isNewArrival(dateAdded: Date | string): boolean {
  //   const addedDate = new Date(dateAdded);
  //   const currentDate = new Date();
  //   const diffTime = currentDate.getTime() - addedDate.getTime();
  //   const diffDays = diffTime / (1000 * 60 * 60 * 24);
  //   return diffDays <= 7; // 7 days threshold
  // }
}
