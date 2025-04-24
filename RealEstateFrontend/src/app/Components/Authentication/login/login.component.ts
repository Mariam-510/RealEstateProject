import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SignUpRoleComponentComponent } from '../sign-up-role-component/sign-up-role-component.component';
import { AccountService } from '../../../Services/ApiServices/account.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { CartService } from '../../../Services/ApiServices/cart.service';

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

    },

  );
  constructor(private dialog: MatDialog, private router: Router,
    private accountService: AccountService, private auth: AuthService) { }

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
    const password = this.Loginform.value.pass!; // Note the field name mismatch

    this.accountService.login(email, password).subscribe({
      next: (response) => {
        this.auth.setAuthState(response.tokenDto.jwtToken);
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
    // const clientId = '329985024640-j1e42v80vulq0c0pqom75puhm75c4f4i.apps.googleusercontent.com';
    // const redirectUri = 'http://localhost:4200/home';
    // const scope = 'email profile openid';
    // const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;

    // window.location.href = authUrl;
  }
}
