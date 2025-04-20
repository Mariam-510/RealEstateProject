import { Component } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';
Chart.register(ChartDataLabels);


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
interface Category {
  id: number;
  name: string;
  color: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  isUsed: boolean;
  isDeleted: boolean;
  images: string[];
  categoryID: number;
  averageRating: number;
  orderItems: any[];
  wishlist: any[];
  reviews: any[];
  categoryName?: string;
  stock: number;
  sold: number;
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
  selector: 'app-admindashboard',
  imports: [
    NgChartsModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule
  ], templateUrl: './admindashboard.component.html',
  styleUrls: ['./admindashboard.component.css']
})
export class AdmindashboardComponent {
  products: Product[] = [
    {
      id: 1,
      name: 'Modern Leather Sofa',
      description: 'Premium quality leather sofa with comfortable cushions',
      price: 1299.99,
      quantity: 50,
      isUsed: false,
      isDeleted: false,
      images: ['sofa1.jpg', 'sofa2.jpg'],
      categoryID: 1,
      averageRating: 4.8,
      orderItems: [],
      wishlist: [],
      reviews: [],
      categoryName: 'Living Room',
      stock: 50,
      sold: 10
    },
    {
      id: 2,
      name: 'King Size Bed Frame',
      description: 'Solid wood bed frame with upholstered headboard',
      price: 899.99,
      quantity: 30,
      isUsed: false,
      isDeleted: false,
      images: ['bed1.jpg', 'bed2.jpg'],
      categoryID: 2,
      averageRating: 4.7,
      orderItems: [],
      wishlist: [],
      reviews: [],
      categoryName: 'Bedroom',
      stock: 30,
      sold: 25
    },
    {
      id: 3,
      name: 'Dining Table Set',
      description: '6-seater dining table with chairs, modern design',
      price: 799.99,
      quantity: 25,
      isUsed: false,
      isDeleted: false,
      images: ['dining1.jpg', 'dining2.jpg'],
      categoryID: 3,
      averageRating: 4.5,
      orderItems: [],
      wishlist: [],
      reviews: [],
      categoryName: 'Dining Room',
      stock: 25,
      sold: 30
    },
    {
      id: 4,
      name: 'Executive Office Desk',
      description: 'Large L-shaped desk with cable management',
      price: 599.99,
      quantity: 40,
      isUsed: false,
      isDeleted: false,
      images: ['desk1.jpg', 'desk2.jpg'],
      categoryID: 4,
      averageRating: 4.6,
      orderItems: [],
      wishlist: [],
      reviews: [],
      categoryName: 'Office',
      stock: 40,
      sold:5
    },
    {
      id: 5,
      name: 'Modern Leather Sofa',
      description: 'Premium quality leather sofa with comfortable cushions',
      price: 1299.99,
      quantity: 50,
      isUsed: true,
      isDeleted: false,
      images: ['sofa1.jpg', 'sofa2.jpg'],
      categoryID: 5,
      averageRating: 4.8,
      orderItems: [],
      wishlist: [],
      reviews: [],
      categoryName: 'Living Room',
      stock: 50,
      sold: 20
    }
  ]
  categories: Category[] = [
    { id: 1, name: 'Living Room', color: '#4e73df' },
    { id: 2, name: 'Bedroom', color: '#1cc88a' },
    { id: 3, name: 'Dining Room', color: '#36b9cc' },
    { id: 4, name: 'Office', color: '#f6c23e' },
    { id: 5, name: 'Outdoor', color: '#e74a3b' }
  ];

  properties: Property[] = [
    { id: 1, title: 'Luxury Apartment', location: 'Downtown', type: PropertyType.Sell, price: 750000, isAuction: false, status: PropertyStatus.Sold, category: PropertyCategory.Apartment },
    { id: 2, title: 'Seaside Villa', location: 'Coastline', type: PropertyType.Sell, price: 250000, isAuction: false, status: PropertyStatus.Available, category: PropertyCategory.Villa },
    { id: 3, title: 'Urban Studio', location: 'City Center', type: PropertyType.Rent, price: 650000, isAuction: false, status: PropertyStatus.Sold, category: PropertyCategory.Studio },
    { id: 4, title: 'Hillside Mansion', location: 'Suburbs', type: PropertyType.Sell, price: 350000, isAuction: true, status: PropertyStatus.Auctioned, category: PropertyCategory.Mansion },
    { id: 5, title: 'Townhouse', location: 'Urban District', type: PropertyType.Sell, price: 950000, isAuction: false, status: PropertyStatus.Sold, category: PropertyCategory.Townhouse },
    { id: 6, title: 'Executive Penthouse', location: 'Business District', type: PropertyType.Rent, price: 750000, isAuction: false, status: PropertyStatus.Available, category: PropertyCategory.Penthouse },
    { id: 7, title: 'Luxury Apartment', location: 'Downtown', type: PropertyType.Rent, price: 650000, isAuction: false, status: PropertyStatus.Sold, category: PropertyCategory.Apartment },
    { id: 8, title: 'Townhouse', location: 'Downtown', type: PropertyType.Rent, price: 150000, isAuction: false, status: PropertyStatus.Sold, category: PropertyCategory.Apartment },
    { id: 9, title: 'Townhouse', location: 'Suburbs', type: PropertyType.Sell, price: 350000, isAuction: false, status: PropertyStatus.Auctioned, category: PropertyCategory.Mansion },


  ];

  get availableProperties(): number {
    return this.properties.filter(p => p.status === PropertyStatus.Available).length;
  }
  get soldProperties(): number {
    return this.properties.filter(p => p.type === PropertyType.Sell && p.status === PropertyStatus.Sold).length;
  }
  get propertiesForSaleCount(): number {
    return this.properties.filter(p => p.type === PropertyType.Sell).length;
  }
  get propertiesForSaleAvailable(): number {
    return this.properties.filter(p => p.type === PropertyType.Sell && p.status === PropertyStatus.Available).length;
  }
  
  get RentedProperties(): number {
    return this.properties.filter(p => p.type === PropertyType.Rent && p.status === PropertyStatus.Sold).length;
  }
  get propertiesForRentAvailable(): number {
    return this.properties.filter(p => p.type === PropertyType.Rent && p.status === PropertyStatus.Available).length;
  }
  
  get propertiesForRentCount(): number {
    return this.properties.filter(p => p.type === PropertyType.Rent).length;
  }
 
  get soldAndRentedCount(): number {
    return this.soldProperties + this.RentedProperties;
  }
  get ActiveAuctionProperties(): number {
    return this.properties.filter(p => p.status === PropertyStatus.Auctioned && p.isAuction == true).length;
  }
  get EndedAuctionProperties(): number {
    return this.properties.filter(p => p.status === PropertyStatus.Auctioned && p.isAuction == false).length;
  }
  get auctionedCount(): number {
    return this.ActiveAuctionProperties + this.EndedAuctionProperties;
  }

  get totalProducts(): number {
    return this.products.length;
  }

  get totalSold(): number {
    return this.products.reduce((sum, product) => sum + product.sold, 0);
  }

  get totalUsedProducts(): number {
    return this.products.filter(product => product.isUsed).length;
  }
  get totalNewProducts(): number {
    return this.products.filter(product => product.isUsed==false).length;
  }

  get totalCategories(): number {
    return this.categories.length;
  }
  get auctionProgressWidth(): string {
    return (this.ActiveAuctionProperties / (this.ActiveAuctionProperties + this.EndedAuctionProperties) * 100) + '%';
  }
  get totalStock(): number {
    return this.products.reduce((sum, product) => sum + product.stock, 0);
  }

  get newProductsCount(): number {
    return this.totalProducts - this.totalUsedProducts;
  }
  
  get SellerNumber(): number {
    return 350;
  }

  get BuyerNumber(): number {
    return 1200;
  }

  get AgentNumber(): number {
    return 700;
  }

  get BasicSellSubscriptionPlanNumber(): number {
    return 40;
  }

  get EnterpeiseSubscriptionPlanNumber(): number {
    return 15;
  }

  get proSubscriptionPlanNumber(): number {
    return 25;
  }

  get FreeSubscriptionNumber(): number {
    return 100;
  }
  
  public subscriptionPlanChart: ChartConfiguration<'bar'>['data'] = {
    labels: ['Free', 'Basic Sell', 'Pro', 'Enterprise'],
    datasets: [{
      label: 'Number of Subscriptions',
      data: [
        this.FreeSubscriptionNumber,
        this.BasicSellSubscriptionPlanNumber,
        this.proSubscriptionPlanNumber,
        this.EnterpeiseSubscriptionPlanNumber
      ],
      backgroundColor: ['#c38e79','#D5C7A3', '#E9DFC3', '#F5EEDD'],
      borderRadius: 4,
      barThickness: 40  
    }]
  };
  
  public subscriptionPlanOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 150,
        ticks: {
          stepSize: 30,          // Controls spacing between each tick
          color: '#858796'
        }, 
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
      },
      x: {
        grid: { display: false },
      },
    },
    plugins: {
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'end',
        color: 'rgba(51, 51, 51, 0.7)',
        font: {
          weight: 'bold',
          size: 11,
        },
        formatter: (value) => value.toString(),
      },
      legend: { display: false },
    },
  };

  public categoryDistributionChart: ChartConfiguration<'pie'>['data'] = {
    labels: this.categories.map(c => c.name),
    datasets: [{
      label: 'Product Distribution',
      data: this.categories.map(category =>
        this.products.filter(product => product.categoryID === category.id).length
      ),
      backgroundColor: [
        '#c38e79',
        '#D5C7A3',
        '#B17F59',
        '#F5EEDD',
        '#E8C999',
        '#F5EEDD'
      ],      borderWidth: 1
    }]
  };

  public categoryDistributionOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: {
      datalabels: {
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data
            .reduce((sum: number, val: any) => sum + val, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
        color: 'rgba(51, 51, 51, 0.7)',
        font: {
          weight: 'bold',
          size: 11,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      },
      legend: {
        position: 'bottom'
      }
    }
  };

  public topProductsChart: ChartConfiguration<'bar'>['data'] = {
    labels: [...this.products]
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5)
      .map(p => p.name),
    datasets: [{
      label: 'Units Sold',
      data: [...this.products]
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5)
        .map(p => p.sold),
      backgroundColor: ['#c38e79','#E8C999','#D5C7A3', '#E9DFC3','#F5EEDD'],
      borderRadius: 4
    }]
  };

  public topProductsOptions: ChartConfiguration<'bar'>['options'] = {
    responsive:true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true
      },
      y: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      datalabels: {
        display: true,
        color: 'rgba(51, 51, 51, 0.7)',
        font: {
          weight: 'bold',
          size: 11,
        },
        formatter: (value) => value.toString(),
      },
      legend: { display: false },
    },

  };
}
