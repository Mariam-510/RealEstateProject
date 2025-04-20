import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastrService } from '../../../Service/toastr.service';
import { PropertyDto, SharedService } from '../../../Service/shared.service';
import { LeafletListMapPropertiesComponent } from '../leaflet-list-map-properties/leaflet-list-map-properties.component';
import { LeafletListMapPropertiesComponent } from "../leaflet-list-map-properties/leaflet-list-map-properties.component";
import { PropertyDto, SharedService } from '../../../Service/shared.service';

@Component({
  selector: 'app-list-map-properties',
  standalone: true,
  imports: [CommonModule, RouterModule, LeafletListMapPropertiesComponent],
  templateUrl: './list-map-properties.component.html',
  styleUrl: './list-map-properties.component.css'
})
export class ListMapPropertiesComponent implements OnInit {

  constructor(private sharedService: SharedService, private toastr: ToastrService) { }

  @ViewChild(LeafletListMapPropertiesComponent) mapComponent!: LeafletListMapPropertiesComponent;

  @Input() properties: PropertyDto[] = [];

  allProperties: PropertyDto[] = [];

  ngOnInit(): void {
    this.allProperties = this.sharedService.properties;
  }

  onPropertyHover(property: PropertyDto): void {
    if (this.mapComponent) {
      this.mapComponent.highlightProperty(property);
    }
  }

  onPropertyLeave(): void {
    if (this.mapComponent) {
      this.mapComponent.clearHighlight();
    }
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
      this.toastr.error(`Copy and share this: ${shareText}`);
    }
  }
}
