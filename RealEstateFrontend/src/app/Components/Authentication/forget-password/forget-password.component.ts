import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../../../Services/ApiServices/account.service';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent {

  constructor(
    private router: Router,
    private accountService: AccountService
  ) { }

  forgetpassword = new FormGroup(
    {
      email: new FormControl('', [Validators.required, Validators.pattern(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/)]),

    },

  );

  errorMes = "";
  isSubmitting = false;
  forget() {
    if (this.forgetpassword.invalid) {
      this.errorMes = "Please fill in Email field correctly.";
      return;
    }

    const email = this.forgetpassword.value.email!;
    this.isSubmitting = true;
    this.errorMes = "";

    this.accountService.forgotPassword(email).subscribe({
      next: () => {
        this.router.navigate(['forgetpassword/sendcode'], {
          queryParams: { email: email }
        });
        this.isSubmitting = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.status === 404) {
          this.errorMes = "Email not found.";
        } else if (err.status === 400) {
          this.errorMes = err.error?.message || "Email not confirmed or account pending approval";
        } else if (err.status === 500) {
          this.errorMes = "Failed to send reset code. Please try again.";
        } else {
          this.errorMes = "An unexpected error occurred. Please try again.";
        }
      }
    });
  }


}
