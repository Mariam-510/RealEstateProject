import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-createadmin',
  imports: [RouterModule,CommonModule,ReactiveFormsModule],
  templateUrl: './createadmin.component.html',
  styleUrl: './createadmin.component.css'
})
export class CreateadminComponent {
   createAdminForm = new FormGroup(
    {
      
      Name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[A-Za-z]+$/)
      ]),
      email: new FormControl('', [Validators.required, Validators.pattern(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/)]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(10),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@#$!%*?&]{6,10}$/)

      ]),
      confirmPassword: new FormControl("", [
        Validators.required
      ])
    },
  );
}
 