import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  userImage: string = 'images/Home/user.jpeg';
  currentUser: any;
  MyForm!: FormGroup;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this._initializeForm();
  }
  private _initializeForm() {
    this.MyForm = new FormGroup(
    {
      
      firstName: new FormControl(this.currentUser?.firstName, [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[A-Za-z]+$/)
      ]),
      lastName: new FormControl(this.currentUser?.lastName? this.currentUser.lastName : "", [
        // Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[A-Za-z]+$/)
      ]),
      
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
  

  // uploadImage() {
  //   const input = document.createElement('input');
  //   input.type = 'file';
  //   input.accept = 'Images/*';

  //   input.onchange = (event: Event) => {
  //     const file = (event.target as HTMLInputElement).files?.[0];
  //     if (file) {
  //       const reader = new FileReader();
  //       reader.onload = (e) => {
  //         this.currentUser.avatar = e.target?.result;
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   };

  //   input.click();
  // }
  uploadImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
  
    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target?.result as string;
  
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
  
            const fixedWidth =200;
            const fixedHeight = 200;
  
            canvas.width = fixedWidth;
            canvas.height = fixedHeight;
  
            // Draw the image stretched to 200x200
            ctx?.drawImage(img, 0, 0, fixedWidth, fixedHeight);
  
            // Save as base64
            this.userImage = canvas.toDataURL('image/jpeg');
          };
        };
        reader.readAsDataURL(file);
      }
    };
  
    input.click();
  }
  

  register() {
    if (this.MyForm.invalid) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    let userObj = {
      firstName: this.MyForm.value.firstName,
      lastName: this.MyForm.value.lastName,
      password: this.MyForm.value.password,
      confirmPassword: this.MyForm.value.confirmPassword
    };

    console.log("User Updated SuccessFully:", userObj);

    this.MyForm.reset();
  }
}