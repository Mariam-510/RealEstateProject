import { Component, Input } from '@angular/core';
import { ToastrService } from '../../../Service/toastr.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyDto } from '../../../Service/shared.service';
import { LeafletMapComponent } from "../../../leaflet-map/leaflet-map.component";

@Component({
  selector: 'app-list-properties',
  imports: [CommonModule, RouterModule, LeafletMapComponent],
  templateUrl: './list-properties.component.html',
  styleUrl: './list-properties.component.css'
})
export class ListPropertiesComponent {

  constructor(private toastr: ToastrService) { }

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
