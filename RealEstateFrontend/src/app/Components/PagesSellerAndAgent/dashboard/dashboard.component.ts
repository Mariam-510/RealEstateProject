import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PropertyApprovalStatus, PropertyCategory, PropertyDTO, PropertyService, PropertyStatus, PropertyType } from '../../../Services/ApiServices/property.service';
import { AuctionService } from '../../../Services/ApiServices/auction.service';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AuthService } from '../../../Services/ApiServices/auth.service';

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
export class DashboardComponent implements OnInit {
  
  lastSoldProperty: PropertyDTO | null = null;
  lastRentedProperty: PropertyDTO | null = null;
  lastAuctionedProperty: PropertyDTO | null = null;
  lastAddedProperty: PropertyDTO | null = null;
  revenueData: { totalRevenue: number, soldRevenue: number, rentalRevenue: number } | null = null;
  highestBidData: { highestBid: number, property: PropertyDTO } | null = null;
  topWishlistedData: { property: PropertyDTO, wishListCount: number } | null = null;
  mostAppointmentsData: { property: PropertyDTO, appointmentCount: number } | null = null;
  categoryRevenues: { category: string, totalSalesRevenue: number, totalRentalRevenue: number }[] = [];
  portfolioCounts = {
    forSale: 0,
    forRent: 0,
    available: 0,
    sold: 0,
    auctioned: 0
  };
  isLoadingRecentActivity = false;
  isLoadingRevenue = false;
  isLoadingPortfolio = false;
  isLoadingChart = false;
  isLoadingQuickStats = false;
  recentActivityError = false;

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    scales: {
      x: {
        stacked: false,
        grid: { display: false }
      },
      y: {
        // type: 'logarithmic',
        // beginAtZero: true,
        // // max: 1000000,
        // max: 100000,
        ticks: {
          callback: (value) => 'EGP ' + value
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
              label += 'EGP ' + context.parsed.y.toLocaleString();
            }
            return label;
          }
        }
      }
    }
  };


  constructor(
    private propertyService: PropertyService,
    private auctionService: AuctionService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadRevenueData();
    this.loadQuickStats();
    this.loadCategoryRevenue();
    this.loadPortfolioSummary();
    this.loadRecentActivities();
  }

  private loadRecentActivities(): void {
    this.isLoadingRecentActivity = true;
    this.recentActivityError = false;
  
    if (this.auth.hasRole('Seller'))
    {
      this.propertyService.getPropertiesBySellerId(PropertyApprovalStatus.Approved).pipe(
        map((allProperties: PropertyDTO[]) => {
          try {
            // Filter and sort client-side
            const soldProperties = allProperties
              .filter(p => p.status === PropertyStatus.Sold && p.type === PropertyType.Sell)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
            const rentedProperties = allProperties
              .filter(p => p.status === PropertyStatus.Sold && p.type === PropertyType.Rent)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
            const auctionedProperties = allProperties
              .filter(p => p.status === PropertyStatus.Auctioned)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              
            const sortedByDate = [...allProperties].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            
            return {
              lastSold: soldProperties[0] || null,
              lastRented: rentedProperties[0] || null,
              lastAuctioned: auctionedProperties[0] || null,
              lastAdded: sortedByDate[0] || null
            };
          } catch (error) {
            throw new Error('Error processing properties');
          }
        }),
        catchError(error => {
          console.error('Error loading properties:', error);
          return of(null); // Return null to handle error in subscription
        })
      ).subscribe({
        next: (results) => {
          if (results) {
            this.lastSoldProperty = results.lastSold;
            this.lastRentedProperty = results.lastRented;
            this.lastAuctionedProperty = results.lastAuctioned;
            this.lastAddedProperty = results.lastAdded;
          }
          this.isLoadingRecentActivity = false;
        },
        error: (error) => {
          this.recentActivityError = true;
          this.isLoadingRecentActivity = false;
        }
      });
    }
    else
    {
      this.propertyService.getPropertiesByAgentId().pipe(
        map((allProperties: PropertyDTO[]) => {
          try {
            // Filter and sort client-side
            const soldProperties = allProperties
              .filter(p => p.status === PropertyStatus.Sold && p.type === PropertyType.Sell)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
            const rentedProperties = allProperties
              .filter(p => p.status === PropertyStatus.Sold && p.type === PropertyType.Rent)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
            const auctionedProperties = allProperties
              .filter(p => p.status === PropertyStatus.Auctioned)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              
            const sortedByDate = [...allProperties].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            
            return {
              lastSold: soldProperties[0] || null,
              lastRented: rentedProperties[0] || null,
              lastAuctioned: auctionedProperties[0] || null,
              lastAdded: sortedByDate[0] || null
            };
          } catch (error) {
            throw new Error('Error processing properties');
          }
        }),
        catchError(error => {
          console.error('Error loading properties:', error);
          return of(null); // Return null to handle error in subscription
        })
      ).subscribe({
        next: (results) => {
          if (results) {
            this.lastSoldProperty = results.lastSold;
            this.lastRentedProperty = results.lastRented;
            this.lastAuctionedProperty = results.lastAuctioned;
            this.lastAddedProperty = results.lastAdded;
          }
          this.isLoadingRecentActivity = false;
        },
        error: (error) => {
          this.recentActivityError = true;
          this.isLoadingRecentActivity = false;
        }
      });
    }
  }

  private loadPortfolioSummary(): void {
    this.isLoadingPortfolio = true;
    forkJoin({
      forSale: this.propertyService.getAllByUserId(PropertyType.Sell),
      forRent: this.propertyService.getAllByUserId(PropertyType.Rent),
      available: this.propertyService.getAllByUserId(undefined, PropertyStatus.Available),
      sold: this.propertyService.getAllByUserId(undefined, PropertyStatus.Sold),
      auctioned: this.propertyService.getAllByUserId(undefined, PropertyStatus.Auctioned)
    }).subscribe({
      next: (results) => {
        this.portfolioCounts = {
          forSale: results.forSale.propertyCount,
          forRent: results.forRent.propertyCount,
          available: results.available.propertyCount,
          sold: results.sold.propertyCount,
          auctioned: results.auctioned.propertyCount
        };
        this.isLoadingPortfolio = false;
      },
      error: (error) => {
        console.error('Error loading portfolio summary:', error);
        this.isLoadingPortfolio = false;
      }
    });
  }

  private loadRevenueData(): void {
    this.isLoadingRevenue = true;
    this.propertyService.getRevenue().subscribe({
      next: (response) => {
        this.revenueData = {
          totalRevenue: response.totalRevenue,
          soldRevenue: response.totalSales,
          rentalRevenue: response.totalRentals
        };
        this.isLoadingRevenue = false;
      },
      error: (error) => {
        console.error('Error loading revenue data:', error);
        this.isLoadingRevenue = false;
      }
    });
  }

  // private loadQuickStats(): void {
  //   this.auctionService.getHighestBidForEndedAuctions().subscribe({
  //     next: (response) => {
  //       // console.log('API Response:', response); 
  //       this.highestBidData = 
  //       {
  //         highestBid: response.highestBid,
  //         property: response.property
  //       }
  //     },
  //     error: (error) => console.error('Error loading highest bid:', error)
  //   });

  //   this.propertyService.getHighestWishlistedProperty().subscribe({
  //     next: (response) => {
  //       // console.log('API Response:', response); 
  //       this.topWishlistedData = {
  //         property: response.property,
  //         wishListCount: response.wishListCount
  //       };
  //     },
  //     error: (error) => console.error('Error loading wishlisted property:', error)
  //   });

  //   this.propertyService.getMostCompletedAppointments().subscribe({
  //     next: (response) => {
  //       // console.log('API Response:', response); 
  //       this.mostAppointmentsData = {
  //         property: response.property,
  //         appointmentCount: response.appointmentCount
  //       };
  //     },
  //     error: (error) => console.error('Error loading appointments data:', error)
  //   });
  // }

  private loadQuickStats(): void {
    this.isLoadingQuickStats = true;
    forkJoin({
      highestBid: this.auctionService.getHighestBidForEndedAuctions(),
      wishlisted: this.propertyService.getHighestWishlistedProperty(),
      appointments: this.propertyService.getMostCompletedAppointments()
    }).subscribe({
      next: (results) => {
        this.highestBidData = results.highestBid;
        this.topWishlistedData = results.wishlisted;
        this.mostAppointmentsData = results.appointments;
        this.isLoadingQuickStats = false;
      },
      error: (error) => {
        console.error('Error loading quick stats:', error);
        this.isLoadingQuickStats = false;
      }
    });
  }

  private loadCategoryRevenue(): void {
    this.isLoadingChart = true;
    this.propertyService.getRevenueByPropertyCategory().subscribe({
      next: (data) => {
        this.categoryRevenues = data;
        this.updateChartData();
        this.isLoadingChart = false;
      },
      error: (error) => {
        console.error('Error loading category revenue:', error);
        this.isLoadingChart = false;
      }
    });
  }

  private getCategoryName(category: string | number): string {
    // Handle both string and numeric category values
    if (typeof category === 'number') {
      const categoryKey = Object.keys(PropertyCategory)[category];
      return PropertyCategory[categoryKey as keyof typeof PropertyCategory] || 'Unknown';
    }
    return PropertyCategory[category as keyof typeof PropertyCategory] || 'Unknown';
  }
  
  private updateChartData(): void {
    this.barChartData = {
      labels: this.categoryRevenues.map(c => 
        this.getCategoryName(c.category as string) // Cast to string if needed
      ),
      datasets: [
        {
          label: 'Sales Revenue',
          data: this.categoryRevenues.map(c => c.totalSalesRevenue),
          backgroundColor: '#c38e79',
          borderRadius: 4
        },
        {
          label: 'Rental Revenue',
          data: this.categoryRevenues.map(c => c.totalRentalRevenue),
          backgroundColor: '#f8e6ce',
          borderRadius: 4
        }
      ]
    };
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.abs(now.getTime() - date.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
}