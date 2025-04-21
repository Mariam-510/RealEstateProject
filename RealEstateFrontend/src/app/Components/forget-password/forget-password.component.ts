import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators,ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,RouterModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent {

  constructor(private router: Router) { }

  forgetpassword = new FormGroup(
    {
      email: new FormControl('', [Validators.required,Validators.pattern(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/) ]),
      
    },
     
    );
    
    
    forget() {
      if (this.forgetpassword.invalid) {
        alert("Please fill in Email fields correctly.");
        return;
      }
    
      let Emailobj = {
        email: this.forgetpassword.value.email,
       
      };
    
      console.log("Email Submitted is:", Emailobj);
    
      this.forgetpassword.reset();
      this.router.navigate(['/sendcode']);

    }
        
      
    }
    