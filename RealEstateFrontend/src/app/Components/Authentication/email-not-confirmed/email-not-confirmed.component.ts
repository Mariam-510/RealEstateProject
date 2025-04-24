import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../Services/ApiServices/account.service';
@Component({
  selector: 'app-email-not-confirmed',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './email-not-confirmed.component.html',
  styleUrl: './email-not-confirmed.component.css'
})
export class EmailNotConfirmedComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService
  ) { }

  email!: string;
  ngOnInit(): void {
    // In SendCodeComponent:
    this.email = this.route.snapshot.queryParams['email'];

    if (!this.email) {
      this.router.navigate(['/login']);
      return;
    }
  }

  errorMes: string = '';
  isResending: boolean = false;

  ResendCode(): void {
    if (this.isResending) return;

    this.isResending = true;
    this.errorMes = '';

    this.accountService.resendConfirmationEmail(this.email).subscribe({
      next: (response) => {
        this.router.navigate(['/sendcode'], {
          queryParams: { email: this.email }
        });
        this.isResending = false;
      },
      error: (err) => {
        this.isResending = false;
        if (err.status === 404) {
          this.errorMes = 'Email not found. Please register again.';
          this.router.navigate(['/register']);
        } else if (err.status === 409) {
          this.errorMes = 'Email already confirmed.';
          this.router.navigate(['/login']);
        } else {
          this.errorMes = err.error?.message || 'Failed to resend code. Please try again.';
        }
      }
    });
  }


}



