import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-agent-profile',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './agent-profile.component.html',
  styleUrl: './agent-profile.component.css'
})
export class AgentProfileComponent {

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
      
      Name: new FormControl(this.currentUser?.firstName, [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[A-Za-z]+$/)
      ]),
      password: new FormControl("", [
        Validators.minLength(6),
        Validators.maxLength(10),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@#$!%*?&]{6,10}$/)

      ]),
      confirmPassword: new FormControl('')

    },
  );
}
showPassword: boolean = false;
showConfirmPassword: boolean = false;

togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
}

toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
}
  

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
