import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-password',
  imports: [ReactiveFormsModule,CommonModule,RouterModule],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.css'
})
export class NewPasswordComponent {

  constructor(private router: Router) { }

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
    
    
    Change() {
      if (this.changpassword.invalid) {
        alert("Please fill All fields correctly.");
        return;
      }
    
      let Passobj = {
        passWord: this.changpassword.value.pass,
        confirmPassword: this.changpassword.value.confirmPassword

       
      };
    
      console.log("PassWord Submitted is:", Passobj);    
      this.changpassword.reset();
      this.router.navigate(['/login']);

    }
        
      
    }
