import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CategoryDTOShow, CategoryService } from '../../../../../Services/ApiServices/category.service';
import { API_CONFIG } from '../../../../../app.config';
import { FilterService } from '../../../../../Services/filter.service';

@Component({
  selector: 'app-cat-slider',
  imports: [RouterModule],
  templateUrl: './cat-slider.component.html',
  styleUrl: './cat-slider.component.css'
})
export class CatSliderComponent implements AfterViewInit, OnInit {

  apiConfig = API_CONFIG;

  ngAfterViewInit(): void {
    this.startAutoScroll();
  }

  private autoScrollInterval: any;
  private isScrollingRight = true;
  isContentVisible = false;

  categories: CategoryDTOShow[] = [];
  message: string = '';

  constructor(private categoryService: CategoryService, private cdr: ChangeDetectorRef,
    private filterService: FilterService, private router: Router) { }

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    try {
      const response = await this.categoryService.getAllCategories().toPromise();
      this.categories = response?.categoryDto ?? [];
      console.log(this.categories);
      console.log(response);
      this.message = response?.message ?? 'No categories found';
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error loading categories:', err);
      this.message = 'Failed to load categories';
      this.cdr.detectChanges();
    }
  }


  CategoryProductView(cat: CategoryDTOShow, event: Event) {
    event.preventDefault(); // Prevent default anchor behavior
    this.filterService.updateFilters({
      category: cat.name,
    });

    this.router.navigate(['/products/all']);
  }

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
