import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SignUpRoleComponentComponent } from '../sign-up-role-component/sign-up-role-component.component';
import { AccountService } from '../../../Services/ApiServices/account.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { CartService } from '../../../Services/ApiServices/cart.service';
import { GoogleService } from '../../../Services/ApiServices/google.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  Loginform = new FormGroup(
    {
      email: new FormControl('', [Validators.required, Validators.pattern(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/)]),
      pass: new FormControl('', [Validators.required]),
      rememberMe: new FormControl(false)
    },

  );
  constructor(private dialog: MatDialog, private router: Router, private auth: AuthService,
    private accountService: AccountService, private googleService: GoogleService) { }

  openSigUPDialog(): void {
    this.dialog.open(SignUpRoleComponentComponent);
  }


  errorMes = "";
  login() {
    if (this.Loginform.invalid) {
      this.errorMes = "Please fill in all required fields correctly.";
      return;
    }

    const email = this.Loginform.value.email!;
    const password = this.Loginform.value.pass!;
    const rememberMe = this.Loginform.value.rememberMe!;

    this.accountService.login(email, password).subscribe({
      next: (response) => {
        this.auth.setAuthState(response.tokenDto.jwtToken, rememberMe);
        this.Loginform.reset();
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Login failed', err);
        this.handleLoginError(err);
      }
    });
  }

  private handleLoginError(error: any): void {
    if (error.status === 403) {
      this.router.navigate(['/emailnotconfirmed'], {
        queryParams: { email: this.Loginform.value.email }
      });
    } else if (error.status === 401) {
      this.errorMes = 'Invalid email or password';
    } else if (error.status === 400) {
      this.errorMes = error.error?.message || 'Bad request';
    } else {
      this.errorMes = 'Login failed. Please try again later.';
    }
  }


  googleLogin() {
    this.googleService.googleLogin();
  }
}
