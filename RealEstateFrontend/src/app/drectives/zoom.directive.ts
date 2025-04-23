import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appZoom]'
})
export class ZoomDirective {
  @Input('appZoom') zoomImage!: string;
  private lens: HTMLElement;
  private zoomFactor = 2;
  private lensSize = 140;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.lens = this.renderer.createElement('div');
    this.renderer.setStyle(this.lens, 'position', 'absolute');
    this.renderer.setStyle(this.lens, 'border', '1px solid #000');
    this.renderer.setStyle(this.lens, 'width', `${this.lensSize}px`);
    this.renderer.setStyle(this.lens, 'height', `${this.lensSize}px`);
    this.renderer.setStyle(this.lens, 'background-repeat', 'no-repeat');
    this.renderer.setStyle(this.lens, 'pointer-events', 'none');
    this.renderer.setStyle(this.lens, 'display', 'none');
    this.renderer.setStyle(this.lens, 'z-index', '1010');
    this.renderer.appendChild(document.body, this.lens);
  }

  @HostListener('mousemove', ['$event']) onMouseMove(e: MouseEvent) {
    const img = this.el.nativeElement;
    const rect = img.getBoundingClientRect();
    const style = window.getComputedStyle(img);

    // Account for padding and borders
    const paddingLeft = parseFloat(style.paddingLeft);
    const paddingTop = parseFloat(style.paddingTop);
    const borderLeft = parseFloat(style.borderLeftWidth);
    const borderTop = parseFloat(style.borderTopWidth);

    // Calculate actual content position
    const contentX = e.clientX - rect.left - paddingLeft - borderLeft;
    const contentY = e.clientY - rect.top - paddingTop - borderTop

    // Calculate content dimensions
    const contentWidth = rect.width - paddingLeft - parseFloat(style.paddingRight) - borderLeft - parseFloat(style.borderRightWidth);
    const contentHeight = rect.height - paddingTop - parseFloat(style.paddingBottom) - borderTop - parseFloat(style.borderBottomWidth);

    // Calculate zoom positions
    const maxBgX = contentWidth * this.zoomFactor - this.lensSize;
    const maxBgY = contentHeight * this.zoomFactor - this.lensSize;

    let bgX = contentX * this.zoomFactor - this.lensSize / 2;
    let bgY = contentY * this.zoomFactor - this.lensSize / 2;

    // Clamp values to stay within image bounds
    bgX = Math.max(0, Math.min(bgX, maxBgX));
    bgY = Math.max(0, Math.min(bgY, maxBgY));

    // Position lens centered on cursor
    const posX = e.pageX - this.lensSize / 2;
    const posY = e.pageY - this.lensSize / 2;

    this.renderer.setStyle(this.lens, 'left', `${posX}px`);
    this.renderer.setStyle(this.lens, 'top', `${posY}px`);
    this.renderer.setStyle(this.lens, 'display', 'block');
    this.renderer.setStyle(this.lens, 'background-image', `url(${this.zoomImage})`);
    this.renderer.setStyle(
      this.lens,
      'background-position',
      `-${bgX}px -${bgY}px`
    );
    this.renderer.setStyle(
      this.lens,
      'background-size',
      `${contentWidth * this.zoomFactor}px ${contentHeight * this.zoomFactor}px`
    );
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(this.lens, 'display', 'none');
  }
}
