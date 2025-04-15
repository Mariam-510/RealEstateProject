// new-address.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-address.component.html',
  styleUrls: ['./new-address.component.css']
})
export class NewAddressComponent implements OnInit {

  addressForm: any;

  constructor(private fb: FormBuilder, private router: Router) {}
  ngOnInit(): void {
    this.addressForm = this.fb.group({
      city: ['', Validators.required],
      street: ['', Validators.required],
      buildingNum: ['', Validators.required],
      apartment: ['', Validators.required],
      floor: ['', Validators.required],
      phoneNum: ['', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]]
    });
  }
 


  onSubmit(): void {
    if (this.addressForm.valid) {
      // In a real app, you would save the address to your backend here
      console.log('Address saved:', this.addressForm.value);
      this.router.navigate(['/checkout/address']);
    }
  }
}