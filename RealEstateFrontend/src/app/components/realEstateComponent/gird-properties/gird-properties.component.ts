import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastrService } from '../../../Service/toastr.service';
import { PropertyDto } from '../../../Service/shared.service';
import { LeafletMapComponent } from "../../../leaflet-map/leaflet-map.component";
import { ViewMode } from '../properties-page/properties-page.component';

@Component({
  selector: 'app-gird-properties',
  imports: [CommonModule, RouterModule, LeafletMapComponent],
  templateUrl: './gird-properties.component.html',
  styleUrl: './gird-properties.component.css'
})
export class GirdPropertiesComponent {

  constructor(private toastr: ToastrService) { }

  @Input() viewMode: ViewMode = 'grid3';

  @Input() properties: PropertyDto[] = [];

  toggleFavorite(event: any) {
    event.isFavorite = !event.isFavorite;
  }

  shareItem(item: any): void {
    const shareText = `Check out this event: ${item.title} - ${item.description} at ${item.location} on ${item.date}. Price: $${item.price}`;
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: shareText,
        url: window.location.href
      }).then(() => console.log('Shared successfully'))
        .catch(err => console.error('Sharing failed', err));
    } else {
      // Fallback for browsers that don’t support navigator.share
      this.toastr.error(`Copy and share this: ${shareText}`);
    }
  }


  toggleMap(property: PropertyDto) {
    property.activeMap = !property.activeMap;
  }

}
