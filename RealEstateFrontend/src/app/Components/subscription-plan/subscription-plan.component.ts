import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SubscriptionPaymentMethodComponent } from '../subscription-payment-method/subscription-payment-method.component';
import { SubscriptionPlanDto, SubscriptionPlanService } from '../../Services/ApiServices/subscription-plan.service';
import { AuthService } from '../../Services/ApiServices/auth.service';
import { Router } from '@angular/router';
import { SubscriptionDto, SubscriptionService } from '../../Services/ApiServices/subscription.service';
import { catchError, lastValueFrom, Observable, of, startWith, switchMap } from 'rxjs'; // Import lastValueFrom for converting Observables to Promises
@Component({
  selector: 'app-subscription-plan',
  imports: [CommonModule],
  templateUrl: './subscription-plan.component.html',
  styleUrl: './subscription-plan.component.css'
})
export class SubscriptionPlanComponent {
  constructor(
    private planService: SubscriptionPlanService,
    private dialog: MatDialog,
    private auth: AuthService,
    private router: Router,
    private subscriptionService: SubscriptionService
  ) { }

  plans: SubscriptionPlanDto[] = [];
  subscription?: SubscriptionDto | null;
  error: string | undefined;
  isLoading: boolean = false; // Add loading state

  subscription$!: Observable<SubscriptionDto | null>;

  async ngOnInit(): Promise<void> {
    if (!this.hasRole('Seller') && !this.hasRole('Agent')) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    try {
      await Promise.all([
        this.loadPlans(),
        // this.loadSubscription()
        this.subscriptionCall()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  subscriptionCall() {
    this.subscription$ = this.subscriptionService.subscriptionUpdated$.pipe(
      startWith(null),
      switchMap(() => {
        return this.subscriptionService.getCurrentUserSubscription().pipe(
          catchError((error) => {
            console.error('Error loading subscription:', error);
            return of(null);
          })
        );
      })
    );
  }

  openMethodDialog(plan: any): void {
    this.dialog.open(SubscriptionPaymentMethodComponent, {
      width: '480px',
      minHeight: '440px',
      panelClass: ['centered-dialog', 'mt-5', 'pt-5'],
      data: { selectedPlan: plan }
    });
  }

  async loadPlans(): Promise<void> {
    try {
      const data = await lastValueFrom(this.planService.getAll());
      this.plans = data;
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
      throw err; // Re-throw if you want to handle it in the calling function
    }
  }

  async loadSubscription(): Promise<void> {
    try {
      const data = await lastValueFrom(this.subscriptionService.getCurrentUserSubscription());
      this.subscription = data;
    } catch (error) {
      this.error = 'Failed to load subscription information';
      console.error(error);
      throw error; // Re-throw if you want to handle it in the calling function
    }
  }

  hasRole(requiredRole: string): boolean {
    return this.auth.hasRole(requiredRole);
  }

  hasRoleOrNoUser(requiredRole: string): boolean {
    return !this.auth.isAuthenticated() || this.auth.hasRole(requiredRole);
  }

  hasUser(): boolean {
    return this.auth.isAuthenticated();
  }
}
