import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedServiceService, PropertyDto } from '../../../../Services/shared-service.service';
import { FormsModule } from '@angular/forms';
import { CardmapComponent } from '../cardmap/cardmap.component';
// import { ToastrService } from '../Service/toastr.service';
// import { LeafletMapComponent } from "../leaflet-map/leaflet-map.component";

@Component({
  selector: 'app-recommended',
  imports: [CommonModule, RouterModule, FormsModule, CardmapComponent],
  templateUrl: './recommended.component.html',
  styleUrl: './recommended.component.css'
})
export class RecommendedComponent implements OnInit {

  properties: PropertyDto[] = [];

  constructor(private sharedService: SharedServiceService) { }

  ngOnInit(): void {
    this.properties = this.sharedService.properties;
  }

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
      console.error(`Copy and share this: ${shareText}`);
    }
  }

  toggleMap(property: PropertyDto) {
    property.activeMap = !property.activeMap;
  }
}


