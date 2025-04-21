import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators,ReactiveFormsModule,AbstractControl,ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SignUpRoleComponentComponent } from '../sign-up-role-component/sign-up-role-component.component';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,CommonModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
 
Loginform = new FormGroup(
{
  email: new FormControl('', [Validators.required,Validators.pattern(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/) ]),
  pass: new FormControl('', [ Validators.required ]),
 
},
 
);
constructor(private dialog: MatDialog,private router:Router) {}


login() {
  if (this.Loginform.invalid) {
    alert("Please fill in all required fields correctly.");
    return;
  }

  let userObj = {
    email: this.Loginform.value.email,
    pass: this.Loginform.value.pass,
  
  };

  console.log("User LoggedIn:", userObj);

  this.Loginform.reset();
  this.router.navigate(['/emailnotconfirmed']);
}
openSigUPDialog(): void {
  this.dialog.open(SignUpRoleComponentComponent);
}

 


googleLogin() {
  const clientId = '329985024640-j1e42v80vulq0c0pqom75puhm75c4f4i.apps.googleusercontent.com';  
  const redirectUri = 'http://localhost:4200/home';  
  const scope = 'email profile openid';
  const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
  
  window.location.href = authUrl;
} 
}
