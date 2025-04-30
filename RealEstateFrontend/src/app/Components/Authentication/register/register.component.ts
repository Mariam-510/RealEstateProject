import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../../../Services/ApiServices/account.service';
import { GoogleService } from '../../../Services/ApiServices/google.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  role: string = 'buyer'; // Default role

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private googleService: GoogleService
  ) {
    this.route.queryParams.subscribe(params => {
      this.role = params['role'] || 'buyer'; // Fallback to 'buyer' if no param
    });
  }

  Registerform = new FormGroup(
    {
      firstName: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z]+$/)
      ]),
      lastName: new FormControl('', [
        Validators.minLength(1),
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z]+$/)
      ]),

      email: new FormControl('', [Validators.required, Validators.pattern(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/)]),
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
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
   
  togglePasswordVisibility(): void {
      this.showPassword = !this.showPassword;
  }
  toggleConfirmcPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
}


  errorMes: string = '';

  Register() {
    if (this.Registerform.invalid) {
      // alert("Please fill in all required fields correctly.");
      this.errorMes = 'Please fill in all required fields correctly.'
      return;
    }

    const formData = new FormData();
    // Use type assertions and null checks
    formData.append('IsBuyer', (this.role === 'buyer').toString());
    formData.append('FirstName', this.Registerform.value.firstName!);
    formData.append('LastName', this.Registerform.value.lastName || '');
    formData.append('Email', this.Registerform.value.email!);
    formData.append('Password', this.Registerform.value.pass!);
    formData.append('ConfirmPassword', this.Registerform.value.confirmPassword!);

    this.accountService.register(formData).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        // In registration component:
        this.router.navigate(['/sendcode'], {
          queryParams: { email: this.Registerform.value.email }
        });

      },
      error: (err) => {
        console.error('Registration error', err);
        this.handleRegistrationError(err);
      }
    });
  }

  private handleRegistrationError(err: any): void {
    if (err.status === 400) {
      // alert(err.error?.message || 'Validation error occurred');
      this.errorMes = err.error?.message || 'Validation error occurred';
    } else if (err.status === 500) {
      // alert('Server error. Please try again later.');
      this.errorMes = 'Server error. Please try again later.';
    } else {
      // alert('An unexpected error occurred. Please try again.');
      this.errorMes = 'An unexpected error occurred. Please try again.';
    }
  }

  googleLogin() {
    this.googleService.googleLogin();
  }

}
