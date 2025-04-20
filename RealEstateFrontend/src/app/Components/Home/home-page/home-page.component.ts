import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    this.startAutoScroll();
  }

  @ViewChild('scheduleContainer') scheduleContainer!: ElementRef;
  @ViewChild('slider', { static: false }) slider!: ElementRef;

  private autoScrollInterval: any;
  private isScrollingRight = true;
  isContentVisible = false;
  hover = false;

public startAutoScroll() {
    this.autoScrollInterval = setInterval(() => {
      const el = this.scheduleContainer.nativeElement;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
      const atStart = el.scrollLeft <= 1;

      if (this.isScrollingRight && atEnd) {
        this.isScrollingRight = false;
      } else if (!this.isScrollingRight && atStart) {
        this.isScrollingRight = true;
      }

      el.scrollBy({
        left: this.isScrollingRight ? 1 : -1,
        behavior: 'auto'
      });
    }, 10);
}

  public stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
  }

  toggleContent() {
    this.isContentVisible = !this.isContentVisible;
  }

  scrollLeft() {
    this.slider.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
  }

  scrollRight() {
    this.slider.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
  }

  productImages: string[] = [
    'https://wasilaah.com/cdn/shop/products/IMG_9996.jpg?v=1679343647&width=2048',
    'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg',
    'https://denovofurniture.pk/wp-content/uploads/2024/06/Opulence-New-5.jpg'
  ];
  
  currentIndex = 0;
  
  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.productImages.length;
  }
  
  prevImage() {
    this.currentIndex =
      (this.currentIndex - 1 + this.productImages.length) % this.productImages.length;
  }
}
