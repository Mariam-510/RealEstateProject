import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductDto } from '../../Services/product.service';

@Component({
  selector: 'app-tttt',
  imports: [CommonModule, RouterModule],
  templateUrl: './tttt.component.html',
  styleUrl: './tttt.component.css'
})
export class TtttComponent {
  
  constructor(private cdr: ChangeDetectorRef) { }

  @Input() product!: ProductDto;

  @ViewChild('slider', { static: false }) slider!: ElementRef;
  currentImageIndices: number = 0;
  Math = Math;
  canScrollLeftProduct = false;
  canScrollRightProduct = true;

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

  nextImage() {
    if(this.product.productimage.length > 0 && this.product.productimage.length > this.currentImageIndices+1){
      this.currentImageIndices = 
          (this.currentImageIndices + 1) % (this.product.productimage.length);
          console.log(this.currentImageIndices);
    }
  }

  prevImage() {
    if(this.product.productimage.length > 0 && this.currentImageIndices > 0){
      this.currentImageIndices = 
          (this.currentImageIndices - 1) % (this.product.productimage.length - 1);
          console.log(this.currentImageIndices);
    }
  }

  // toggleWishList(productId: number) {
  //   const product = this.products.find(p => p.id === productId);
  //   if (product) {
  //     product.wishlisted = !product.wishlisted;
  //   }
  // }

  // addToCart(productId: number) {
  //   const product = this.products.find(p => p.id === productId);
  //   if (product) {
  //     // this.cartService.addToCart(product);
  //   }
  // }
}
