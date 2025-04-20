import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators,ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-register-as-agent',
  imports: [ReactiveFormsModule,CommonModule,RouterModule],
  templateUrl: './register-as-agent.component.html',
  styleUrl: './register-as-agent.component.css'
})
export class RegisterAsAgentComponent {
  constructor(private router: Router) { }
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
      email: new FormControl('', [Validators.required,Validators.pattern(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/) ]),
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
    
    
    Register() {
      if (this.Registerform.invalid) {
        alert("Please fill in all required fields correctly.");
        return;
      }
    
      let userObj = {
        email: this.Registerform.value.email,
        pass: this.Registerform.value.pass,
        Name: this.Registerform.value.Name,
        CommercialRegister: this.Registerform.value.CommercialRegister,
        confirmPassword: this.Registerform.value.confirmPassword
      
      };
    
      console.log("User Registered:", userObj);
    
      this.Registerform.reset();
      this.router.navigate(['/sendcode']);

    }
    googleLogin(event: MouseEvent) {
      event.preventDefault();   
      event.stopPropagation(); 
      const clientId = '329985024640-j1e42v80vulq0c0pqom75puhm75c4f4i.apps.googleusercontent.com';  
      const redirectUri = 'http://localhost:4200/home';  
      const scope = 'email profile openid';
      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
      
      window.location.href = authUrl;
    } }