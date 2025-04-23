import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../../../Services/ApiServices/account.service';

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
    private accountService: AccountService
  ) {
    this.route.queryParams.subscribe(params => {
      this.role = params['role'] || 'buyer';  
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


  errorMes: string = '';

  Register() {
    if (this.Registerform.invalid) {
      // alert("Please fill in all required fields correctly.");
      this.errorMes = 'Please fill in all required fields correctly.'
      return;
    }

    const formData = new FormData();
    formData.append('IsBuyer', (this.role === 'buyer').toString());
    formData.append('FirstName', this.Registerform.value.firstName!);
    formData.append('LastName', this.Registerform.value.lastName || '');
    formData.append('Email', this.Registerform.value.email!);
    formData.append('Password', this.Registerform.value.pass!);
    formData.append('ConfirmPassword', this.Registerform.value.confirmPassword!);

    this.accountService.register(formData).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
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
      this.errorMes = err.error?.message || 'Validation error occurred';
    } else if (err.status === 500) {
      this.errorMes = 'Server error. Please try again later.';
    } else {
      this.errorMes = 'An unexpected error occurred. Please try again.';
    }
  }


  googleLogin(event: MouseEvent) {
    //   event.preventDefault();
    //   event.stopPropagation();
    //   const clientId = '329985024640-j1e42v80vulq0c0pqom75puhm75c4f4i.apps.googleusercontent.com';
    //   const redirectUri = 'http://localhost:4200/home';
    //   const scope = 'email profile openid';
    //   const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;

    //   window.location.href = authUrl;
  }

}
