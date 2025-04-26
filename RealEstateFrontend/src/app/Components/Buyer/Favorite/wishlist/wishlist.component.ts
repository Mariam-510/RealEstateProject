import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LeafletMapComponent } from '../../../Map/leaflet-map/leaflet-map.component';
import { ToastrService } from '../../../../Services/toastr.service';
import { PropertyDto } from '../../../../Service/shared.service';
import { ListPropertiesComponent } from '../../../Properties/All/list-properties/list-properties.component';
import { SharedService } from '../../../../Services/shared.service';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, RouterModule, LeafletMapComponent,ListPropertiesComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
  constructor(private toastr: ToastrService,private sharedService: SharedService) { }

  properties: PropertyDto[] = [];
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
      this.toastr.error(`Copy and share this: ${shareText}`);
    }
  }

  toggleMap(property: PropertyDto) {
    property.activeMap = !property.activeMap;
  }
}
