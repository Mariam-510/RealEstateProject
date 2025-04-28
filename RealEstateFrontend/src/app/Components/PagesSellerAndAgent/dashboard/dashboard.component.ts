import { Component } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';

enum PropertyCategory {
  Apartment = 'Apartment',
  Villa = 'Villa',
  House = 'House',
  Studio = 'Studio',
  Penthouse = 'Penthouse',
  Duplex = 'Duplex',
  Townhouse = 'Townhouse',
  Mansion = 'Mansion'
}

enum PropertyStatus {
  Available = 'Available',
  Sold = 'Sold',
  Auctioned = 'Auctioned'
}

enum PropertyType {
  Sell = 'Sell',
  Rent = 'Rent'
}

interface Property {
  id: number;
  title: string;
  location: string;
  type: PropertyType;
  price: number;
  isAuction: boolean;
  status: PropertyStatus;
  category: PropertyCategory;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgChartsModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  
  properties: Property[] = [
    { id: 1, title: 'Luxury Apartment', location: 'Downtown', type: PropertyType.Sell, price: 750000, isAuction: false, status: PropertyStatus.Sold, category: PropertyCategory.Apartment },
    { id: 2, title: 'Seaside Villa', location: 'Coastline', type: PropertyType.Sell, price: 250000, isAuction: false, status: PropertyStatus.Available, category: PropertyCategory.Villa },
    { id: 3, title: 'Urban Studio', location: 'City Center', type: PropertyType.Rent, price: 650000, isAuction: false, status: PropertyStatus.Sold, category: PropertyCategory.Studio },
    { id: 4, title: 'Hillside Mansion', location: 'Suburbs', type: PropertyType.Sell, price: 350000, isAuction: true, status: PropertyStatus.Auctioned, category: PropertyCategory.Mansion },
    { id: 5, title: 'Townhouse', location: 'Urban District', type: PropertyType.Sell, price: 950000, isAuction: false, status: PropertyStatus.Sold, category: PropertyCategory.Townhouse },
    { id: 6, title: 'Executive Penthouse', location: 'Business District', type: PropertyType.Rent, price: 750000, isAuction: false, status: PropertyStatus.Available, category: PropertyCategory.Penthouse},
    { id: 7, title: 'Luxury Apartment', location: 'Downtown', type: PropertyType.Rent, price: 650000, isAuction: false, status: PropertyStatus.Sold, category: PropertyCategory.Apartment },
    { id: 8, title: 'Townhouse', location: 'Downtown', type: PropertyType.Rent, price: 150000, isAuction: false, status: PropertyStatus.Sold, category: PropertyCategory.Apartment },


  ];

  get totalProperties(): number {
    return this.properties.length;
  }

  get soldProperties(): number {
    return this.properties.filter(p => p.status === PropertyStatus.Sold).length;
  }

  get availableProperties(): number {
    return this.properties.filter(p => p.status === PropertyStatus.Available).length;
  }
  get AuctionProperties(): number {
    return this.properties.filter(p => p.status === PropertyStatus.Auctioned).length;
  }
  get RentProperty(): number {
    return this.properties.filter(p => p.type === PropertyType.Rent).length;
  }
  get SellProperty(): number {
    return this.properties.filter(p => p.type === PropertyType.Sell).length;
  }
  get SubscriptionAvaiable(): number {
    return 10;
  }

  get SoldRevenue(): number {
    return this.properties
      .filter(p => p.status === PropertyStatus.Sold && p.type === PropertyType.Sell)
      .reduce((sum, property) => sum + property.price, 0);
  }

  get RentalRevenue(): number {
    return this.properties
      .filter(p => p.type === PropertyType.Rent && p.status === PropertyStatus.Sold)
      .reduce((sum, property) => sum + property.price , 0);  
  }

  get TotalRevenue(): number {
    return this.SoldRevenue + this.RentalRevenue;
  }

  get revenueGrowth(): number {
    return 15;  
  }

  get rentalGrowth(): number {
    return 8;  
  }

  get totalRevenueGrowth(): number {
    return 12;  
  }
public barChartData: ChartConfiguration<'bar'>['data'] = {
  labels: Object.values(PropertyCategory),
  datasets: [{
    label: 'Sales Revenue',
    data: this.getRevenueByCategory(PropertyType.Sell),
    backgroundColor: '#c38e79',
    borderRadius: 4
  }, {
    label: 'Rental Revenue',
    data: this.getRevenueByCategory(PropertyType.Rent),
    backgroundColor: '#f8e6ce',
    borderRadius: 4
  }]
};

public barChartOptions: ChartConfiguration<'bar'>['options'] = {
  responsive: true,
  scales: {
    x: {
      stacked: false,
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      max: 1000000,
      ticks: {
        callback: (value) => '£' + value
      }
    }
  },
  plugins: {
    datalabels: {
      display: true,
      anchor: 'end',
      align: 'end',
      color: 'rgba(51, 51, 51, 0.7)',
      font: {
        weight: 'bold',
        size: 10,
      },
      formatter: (value) => value.toString(),
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          let label = context.dataset.label || '';
          if (label) label += ': ';
          if (context.parsed.y !== null) {
            label += '£' + context.parsed.y.toLocaleString();
          }
          return label;
        }
      }
    }
  }
};

// Add this properly typed helper method
private getRevenueByCategory(type: PropertyType): number[] {
  return Object.values(PropertyCategory).map(category => {
    return this.properties
      .filter(p => p.category === category && p.type === type)
      .reduce((sum: number, property: Property) => {
        if (type === PropertyType.Sell) {
          return sum + (property.status === PropertyStatus.Sold ? property.price : 0);
        } else {
          return sum + (property.status === PropertyStatus.Sold ? property.price : 0);
        }
      }, 0);
  });
}
}