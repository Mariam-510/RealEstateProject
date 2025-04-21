import { Component, OnInit } from '@angular/core';
import { PropertyDto, SharedService } from '../../../Services/shared.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LeafletMapComponent } from '../../Map/leaflet-map/leaflet-map.component';

@Component({
  selector: 'app-home-properties',
  imports: [CommonModule, RouterModule, LeafletMapComponent],
  templateUrl: './home-properties.component.html',
  styleUrl: './home-properties.component.css'
})
export class HomePropertiesComponent implements OnInit {

  properties: PropertyDto[] = [];

  constructor(private sharedService: SharedService) { }

  ngOnInit(): void {
    this.properties = this.sharedService.HomeProperties;
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
