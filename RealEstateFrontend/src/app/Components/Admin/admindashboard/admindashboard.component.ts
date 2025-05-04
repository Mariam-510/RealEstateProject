import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';
import { AdminDashboardService, DashboardTotals } from '../../../Services/ApiServices/admin-dashboard.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { Router } from '@angular/router';
Chart.register(ChartDataLabels);


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
export class AdmindashboardComponent implements OnInit {
  totals: DashboardTotals | null = null;

  constructor(private dashboardService: AdminDashboardService, private auth: AuthService, private router: Router) { }
  ngOnInit(): void {
    if (this.hasRole('Admin')) {
      this.loadDashboardData();
    }
    else {
      this.router.navigate(['/login']);
    }
  }

  private loadDashboardData(): void {
    this.dashboardService.getTotals().subscribe({
      next: (data) => {
        this.totals = data;
        this.updateCategoryChart();
        this.updateSubscriptionChart();
        this.updateTopProductsChart();


      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      }
    });
  }


  // ---------------------------------LINKED---------------------------
  get availableProperties(): number {
    return this.totals?.availableProperties || 0;
  }
  get newProductsCount(): number {
    return this.totalProducts - this.totalUsedProducts;
  }
  get soldProperties(): number {
    return this.totals?.soldProperties || 0;
  }

  get propertiesForSaleCount(): number {
    return this.totals?.saleProperties || 0;
  }

  get propertiesForRentCount(): number {
    return this.totals?.rentProperties || 0;
  }

  get soldAndRentedCount(): number {
    return this.soldProperties;
  }

  get ActiveAuctionProperties(): number {
    return this.totals?.activeAuctions || 0;
  }

  get auctionedCount(): number {
    return this.ActiveAuctionProperties + (this.totals?.endingAuctions || 0);
  }

  get totalProducts(): number {
    return this.totals?.totalProducts || 0;
  }

  get totalSold(): number {
    return this.totals?.soldProducts || 0;
  }

  get totalUsedProducts(): number {
    return this.totals?.usedProducts || 0;
  }

  get totalNewProducts(): number {
    return this.totals?.newProducts || 0;
  }

  get auctionProgressWidth(): string {
    if (!this.totals) return '0%';
    const total = (this.totals.upcomingAuctions || 0) + (this.totals.endingAuctions || 0);
    return total > 0 ?
      `${(this.totals.activeAuctionsPrecentage || 0).toFixed(2)}%` :
      '0%';
  }

  // User-related getters
  get SellerNumber(): number {
    return this.totals?.totalSellers || 0;
  }

  get BuyerNumber(): number {
    return this.totals?.totalBuyers || 0;
  }

  get AgentNumber(): number {
    return this.totals?.totalAgents || 0;
  }

  // ---------------------------------LINKED---------------------------

  public subscriptionPlanChart: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Number of Subscriptions',
      data: [],
      backgroundColor: [],
      borderRadius: 4,
      barThickness: 40
    }]
  };

  private updateSubscriptionChart(): void {
    if (this.totals?.subscriptionPlans && this.totals?.subscriptionCounts) {
      const colorPalette = ['#c38e79', '#D5C7A3', '#E9DFC3', '#F5EEDD', '#B17F59', '#E8C999'];

      const numberOfBars = this.totals?.subscriptionPlans.length;
      const dynamicBarThickness = numberOfBars > 6 ? 20 : 40;
      const dataValues = this.totals?.subscriptionPlans.map(plan => this.totals?.subscriptionCounts[plan] || 0);
      const maxCount = Math.max(...dataValues);


      this.subscriptionPlanChart = {
        labels: this.totals?.subscriptionPlans,
        datasets: [{
          label: 'Number of Subscriptions',
          data: this.totals?.subscriptionPlans.map(plan => this.totals?.subscriptionCounts[plan] || 0),
          backgroundColor: colorPalette.slice(0, numberOfBars),
          borderRadius: 6,
          barThickness: dynamicBarThickness
        }]
      };

      this.subscriptionPlanOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'end',
            color: '#000',
            font: {
              weight: 'bold'
            },
            formatter: (value: any) => value
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: {
              display: false // 🔴 Hide vertical lines
            },
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 0
            }
          },
          y: {
            beginAtZero: true,
            max: maxCount + 1,

            ticks: {
              stepSize: 1
            }
          }
        }
      };
    }
  }


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

  // Replace the existing categoryDistributionChart with this:
  public categoryDistributionChart: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Product Distribution',
      data: [],
      backgroundColor: [
        '#C38E79', // muted rosewood
        '#D6C6A3', // sandy beige
        '#B17F59', // terra cotta
        '#F3E9D7', // soft cream
        '#E2BB89', // warm sand
        '#A76A4C', // cinnamon
        '#EBD8C3'  // peachy cream
      ],

      borderWidth: 1
    }]
  };

  // Add this method to update the chart when data loads
  private updateCategoryChart(): void {
    if (this.totals?.categoryPercentages) {
      this.categoryDistributionChart.labels = Object.keys(this.totals?.categoryPercentages);
      this.categoryDistributionChart.datasets[0].data = Object.values(this.totals?.categoryPercentages);
    }
  }
  hasCategoryData(): boolean {
    if (this.totals)
      return this.totals?.categoryPercentages &&
        Object.keys(this.totals?.categoryPercentages).length > 0;

    return false;
  }
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
    labels: [],
    datasets: [{
      label: 'Units Sold',
      data: [],
      backgroundColor: ['#c38e79', '#E8C999', '#D5C7A3', '#E9DFC3', '#F5EEDD'],
      borderRadius: 4
    }]
  };

  public topProductsOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        max: Math.max(...(this.totals?.topProducts?.map(p => p.totalSold) || [0])) * 1.1, // 10% padding
        ticks: {
          stepSize: Math.ceil((Math.max(...(this.totals?.topProducts?.map(p => p.totalSold) || [0])) * 1.1) / 5)
        }
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
    }
  };

  private updateTopProductsChart(): void {
    if (this.totals?.topProducts) {
      const salesData = this.totals?.topProducts.map(p => p.totalSold);
      const uniqueValues = [...new Set(salesData)].sort((a, b) => a - b);

      this.topProductsOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            type: 'linear',
            beginAtZero: true,
            ticks: {
              precision: 0,
              stepSize: 1,
              callback: (value) => uniqueValues.includes(value as number) ? value : ''
            },
            grid: {
              color: (context) =>
                context.tick.value === 0 || uniqueValues.includes(context.tick.value)
                  ? 'rgba(0, 0, 0, 0.1)'
                  : 'transparent'
            }
          },
          y: {
            grid: { display: false }
          }
        },
        plugins: {
          datalabels: {
            display: true,
            color: 'rgba(51, 51, 51, 0.7)',
            font: { weight: 'bold', size: 11 },
            formatter: (value) => value.toString(),
          },
          legend: { display: false }
        }
      };

      this.topProductsChart = {
        labels: this.totals?.topProducts.map(p => p.productName),
        datasets: [{
          label: 'Units Sold',
          data: salesData,
          backgroundColor: ['#c38e79', '#E8C999', '#D5C7A3', '#E9DFC3', '#F5EEDD'],
          borderRadius: 4
        }]
      };
    }
  }
  hasRole(requiredRole: string) {
    return this.auth.hasRole(requiredRole);
  }

  hasRoleOrNoUser(requiredRole: string) {
    return !this.auth.isAuthenticated() || this.auth.hasRole(requiredRole);
  }

  hasUser() {
    return this.auth.isAuthenticated();
  }
}
