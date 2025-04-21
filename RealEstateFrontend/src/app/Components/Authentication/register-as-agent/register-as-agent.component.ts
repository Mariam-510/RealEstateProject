import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../../../Services/ApiServices/account.service';

@Component({
  selector: 'app-register-as-agent',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register-as-agent.component.html',
  styleUrl: './register-as-agent.component.css'
})
export class RegisterAsAgentComponent {
  constructor(private router: Router, private accountService: AccountService) { }

  Registerform = new FormGroup(
    {
      Name: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z]+$/)
      ]),
      CommercialRegister: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(8),
        Validators.pattern('^[0-9]*$')
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
    // Use type assertions and null checks
    formData.append('Name', this.Registerform.value.Name!);
    formData.append('CommercialRegister', this.Registerform.value.CommercialRegister!);
    formData.append('Email', this.Registerform.value.email!);
    formData.append('Password', this.Registerform.value.pass!);
    formData.append('ConfirmPassword', this.Registerform.value.confirmPassword!);

    this.accountService.registerAgent(formData).subscribe({
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


  googleLogin(event: MouseEvent) {
    // event.preventDefault();
    // event.stopPropagation();
    // const clientId = '329985024640-j1e42v80vulq0c0pqom75puhm75c4f4i.apps.googleusercontent.com';
    // const redirectUri = 'http://localhost:4200/home';
    // const scope = 'email profile openid';
    // const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;

    // window.location.href = authUrl;
  }
}
