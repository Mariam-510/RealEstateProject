import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-home-slider',
  imports: [CommonModule],
  templateUrl: './home-slider.component.html',
  styleUrl: './home-slider.component.css'
})
export class HomeSliderComponent implements OnInit {

  ngOnInit(): void {
    this.sliderStartAutoScroll();
  }

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

  activeSlide = 0;
  private sliderAutoScrollSubscription: Subscription | null = null;
  private sliderAutoScrollInterval = 3000;

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
}
