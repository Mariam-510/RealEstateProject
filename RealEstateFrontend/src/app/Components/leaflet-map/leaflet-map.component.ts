import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AfterViewInit, Component, inject, Input } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';
// Icon for the main location (colored)
const mainLocationIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/ios-filled/50/fa314a/marker.png', // red
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [50, 50],
  iconAnchor: [26, 42],
  popupAnchor: [0, -32]
});

// Icon for nearby places (gray or neutral)
const nearbyLocationIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/ios-filled/50/6e6e6e/marker.png', // gray
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});


@Component({
  selector: 'app-leaflet-map',
  imports: [CommonModule,HttpClientModule], // ✅ Import CommonModule and HttpClientModule
  templateUrl: './leaflet-map.component.html',

  styleUrl: './leaflet-map.component.css'



})
export class LeafletMapComponent implements AfterViewInit {
  private map!: L.Map;
  
  @Input() locationName: string = ''; // ✅ Change this to any location
  @Input() styleTxt: { [key: string]: string } = { height: '100%', width: '50%' };
  @Output() placesChanged = new EventEmitter<any[]>();

  private http = inject(HttpClient); // ✅ Correct way to inject HttpClient

  private initMap(lat: number, lon: number): void {
    this.initializeLeafletIcons();

    this.map = L.map('map').setView([lat, lon], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
 // Example: highlight a location
//  const bounds = L.rectangle([[lat, lon], [lat, lon]], {color: "#00aa00", weight: 1});
 // Create a small rectangle around the point (lat, lon)
const delta = 0.001; // ~100 meters
// const bounds = L.rectangle(
//   [[lat - delta, lon - delta], [lat + delta, lon + delta]],
//   { color: "#6F8FAF", weight: 2, fillOpacity: 0.5 }
// );
// bounds.addTo(this.map);

 
    L.marker([lat, lon], {
      icon: L.divIcon({ className: 'custom-div-icon', html: '' }) // Empty div icon
    }).addTo(this.map)
      .bindPopup(`📍 ${this.locationName}<br> Location found!`)
      .openPopup();
      L.marker([lat, lon], { icon: mainLocationIcon }).addTo(this.map)
      .bindPopup(`<strong>${this.locationName}</strong>`);
    
      // 🆕 Fetch nearby places
  this.fetchNearbyPlaces(lat, lon);
  }
  private initializeLeafletIcons() {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
    });

  }
  private getCoordinates(location: string): void {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;

    this.http.get<any[]>(url).subscribe(data => {
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        this.initMap(lat, lon);
      } else {
        console.error('Location not found!');
      }
    });
  }

  ngAfterViewInit(): void {
    this.getCoordinates(this.locationName); // ✅ Convert "Maadi" to lat/lon
  }


  private userMarker: any;

  public getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          // Center the map on the user's location
          this.map.setView([userLat, userLng], 13);

          // Add a marker for the user's location
          if (this.userMarker) {
            this.userMarker.setLatLng([userLat, userLng]);
          } else {
            this.userMarker = L.marker([userLat, userLng]).addTo(this.map)
            .bindPopup(`📍 ${this.locationName}<br> Location found!`)
            .openPopup();
          }
        },
        (error) => {
          console.error('Error getting user location:', error);
          console.error('Unable to retrieve your location. Please ensure location services are enabled.');
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }
  private fetchNearbyPlaces(lat: number, lon: number): void {
    const radius = 3500; // meters
    const query = `
      [out:json];
      (
        node["amenity"="school"](around:${radius},${lat},${lon});
        node["public_transport"="station"](around:${radius},${lat},${lon});
        node["amenity"="bus_station"](around:${radius},${lat},${lon});
        node["amenity"="hospital"](around:${radius},${lat},${lon});
        node["amenity"="restaurant"](around:${radius},${lat},${lon});
      );
      out body;
    `;
  
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
  
    this.http.post(overpassUrl, query, { headers, responseType: 'text' }).subscribe(response => {
      const data = JSON.parse(response);
      if (data && data.elements) {
        const mainLat = this.map.getCenter().lat;
        const mainLon = this.map.getCenter().lng;
  
        const grouped: { [key: string]: any[] } = {};
  
        for (const place of data.elements) {
          const nameEn = place.tags?.['name:en'];
          if (!nameEn) continue;
  
          const type = place.tags?.amenity || place.tags?.public_transport || 'Place';
          const category = this.mapAmenityToCategory(type);
          const lat = place.lat;
          const lon = place.lon;
          const distance = +this.getDistanceFromLatLonInMiles(mainLat, mainLon, lat, lon).toFixed(2);
  
          const placeInfo = {
            name: nameEn,
            type,
            category,
            lat,
            lon,
            distance
          };
  
          // Group by category
          if (!grouped[category]) {
            grouped[category] = [];
          }
          grouped[category].push(placeInfo);
        }
  
        // Keep top 5 for each category
        this.nearbyPlaces = [];
        for (const cat of Object.keys(grouped)) {
          const sorted = grouped[cat].sort((a, b) => a.distance - b.distance).slice(0, 6);
          this.nearbyPlaces.push(...sorted);
  
          // Add markers
          for (const place of sorted) {
            L.marker([place.lat, place.lon]).addTo(this.map)
              .bindPopup(`<strong>${place.name}</strong><br>Type: ${place.type}<br>Distance: ${place.distance} miles`);
          }
        }
  
        this.filterByCategory(this.selectedCategory || 'restaurant');
        this.placesChanged.emit(this.filteredPlaces);
      }
    }, error => {
      console.error('Error fetching nearby places:', error);
    });
  }
  
  private getDistanceFromLatLonInMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3958.8; // Radius of Earth in miles
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  public nearbyPlaces: any[] = [];
public filteredPlaces: any[] = [];
public selectedCategory: string = 'restaurant';

public categoryMapping: { [key: string]: string } = {
  school: 'Schools',
  station: 'Transit',
  bus_station: 'Transit',
  hospital: 'Places',
  restaurant: 'Places'
};

public filterByCategory(category: string): void {
  this.selectedCategory = category;
  if (category === 'all') {
    this.filteredPlaces = this.nearbyPlaces;
  } else {
    this.filteredPlaces = this.nearbyPlaces.filter(p => p.category === category);
  }
}
private mapAmenityToCategory(type: string): string {
  if (['school'].includes(type)) return 'school';
  if (['bus_station', 'station', 'public_transport'].includes(type)) return 'station';
  if (['hospital'].includes(type)) return 'hospital';
  if (['restaurant'].includes(type)) return 'restaurant';
  return 'other';
}
public getCategoryIcon(category: string): string {
  switch (category) {
    case 'school':
      return 'bi bi-mortarboard';
      
    case 'hospital':
      return 'bi bi-hospital';
    case 'station':
      return 'bi bi-train-front';
    case 'restaurant':
      return 'bi bi-cup-straw';
    default:
      return 'bi bi-geo-fill';
  }
}
public getCategoryEmoji(category: string): string {
  switch (category) {
    case 'restaurant':
      return '🍽️';
    case 'school':
      return '🎓';
    case 'hospital':
      return '🏥';
    case 'station':
      return '🚉';
    default:
      return '📍';
  }
}


}