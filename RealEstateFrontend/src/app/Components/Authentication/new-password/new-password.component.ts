import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../Services/ApiServices/account.service';

@Component({
  selector: 'app-new-password',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.css'
})
export class NewPasswordComponent implements OnInit {

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
      this.router.navigate(['/forgetpassword']);
      return;
    }
  }

  changpassword = new FormGroup(
    {
      pass: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(10),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@$!#%*?&]{8,10}$/)
      ]),
      confirmPassword: new FormControl("", [
        Validators.required
      ])

    },

  );


  errorMes: string = '';
  isSubmitting: boolean = false;
  Change() {
    if (this.changpassword.invalid) {
      this.errorMes = 'Please fill all fields correctly and ensure passwords match';
      return;
    }

    const newPassword = this.changpassword.value.pass!;
    const confirmPassword = this.changpassword.value.confirmPassword!;

    this.isSubmitting = true;
    this.errorMes = '';

    this.accountService.resetPassword(this.email, newPassword, confirmPassword).subscribe({
      next: () => {
        this.changpassword.reset();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.status === 404) {
          this.errorMes = 'User not found. Please try the password reset process again.';
        } else if (err.status === 400) {
          this.errorMes = err.error?.message || 'Invalid request. Please check your inputs.';
        } else if (err.status === 500) {
          this.errorMes = err.error?.message || 'Password reset failed. Please try again.';
        } else {
          this.errorMes = 'An unexpected error occurred. Please try again.';
        }
      }
    });
  }


}
