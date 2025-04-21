import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cat-slider',
  imports: [RouterModule],
  templateUrl: './cat-slider.component.html',
  styleUrl: './cat-slider.component.css'
})
export class CatSliderComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    this.startAutoScroll();
  }

  private autoScrollInterval: any;
  private isScrollingRight = true;
  isContentVisible = false;

  categories = [
    { id: 1, name: 'BEDS', imageUrl: 'https://www.mocka.com.au/cdn/shop/files/T04028_HiRes_01.jpg?v=1728479772&width=2040' },
    { id: 2, name: 'SOFAS', imageUrl: 'https://denovofurniture.pk/wp-content/uploads/2024/06/Opulence-New-5.jpg' },
    { id: 3, name: 'CHAIRS', imageUrl: 'https://images.eq3.com/image-service/a0067633-232a-4dff-b0b9-bc26c0651211/Joan-Chair-30215-02-Panama-Grey-Black-Ash-Legs-Front-Web_ORIGINAL.jpg' },
    { id: 4, name: 'TABLES', imageUrl: 'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg' },
    { id: 5, name: 'TV UNITS', imageUrl: 'https://wasilaah.com/cdn/shop/products/IMG_9996.jpg?v=1679343647&width=2048' },
    { id: 6, name: 'ROOM SETS', imageUrl: 'https://www.raneen.com/media/catalog/product/1/5/153_qj0fycqtckj854wf.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=&width=' },
    { id: 7, name: 'BABY ROOMS', imageUrl: 'https://babymore.co.uk/wp-content/uploads/2023/02/Mona-2-Piece-Room-Set-GREY-1-scaled.jpg' },
  ];

  @ViewChild('sliderContainer') sliderContainer!: ElementRef;

  public startAutoScroll() {
    this.autoScrollInterval = setInterval(() => {
      const el = this.sliderContainer.nativeElement;
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

}
