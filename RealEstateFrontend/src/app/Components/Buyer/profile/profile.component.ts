import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { API_CONFIG } from '../../../app.config';
import { BuyerDto, BuyerService } from '../../../Services/ApiServices/buyer.service';
import { lastValueFrom } from 'rxjs';  // Important import
import { ToastrService } from '../../../Services/toastr.service';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  // userImage: string = 'images/Home/user.jpeg';
  userImage: string | null = null;
  MyForm!: FormGroup;
  apiConfig = API_CONFIG;
  buyer: BuyerDto | null = null;

  selectedImage: File | null = null;
  removeImageFlag = false;

  constructor(private router: Router, private auth: AuthService,
    private buyerService: BuyerService,
    private toaster:ToastrService  ) { }

  async ngOnInit() {
    if (!this.hasRole('Buyer')) {
      this.router.navigate(['/login']);
      return;
    }

    this._initializeForm(); // Initialize FIRST
    await this.loadBuyer(); // Load data AFTER
    this._patchFormValues(); // Update form

    this.userImage = this.buyer?.imageUrl ? (this.apiConfig.apiUrl + this.buyer?.imageUrl) : null;
  }

  async loadBuyer(): Promise<void> {
    try {
      this.buyer = await lastValueFrom(this.buyerService.getBuyer());
      // Date conversion logic here
    } catch (err) {
      console.error('Failed to fetch buyer:', err);
    }
  }

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  showCurrentPassword: boolean = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }
  private _initializeForm() {
    this.MyForm = new FormGroup({
      firstName: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[A-Za-z]+$/)
      ]),
      lastName: new FormControl('', [
        Validators.minLength(3),
        Validators.pattern(/^[A-Za-z]+$/)
      ]),
      currentPassword: new FormControl(''),
      password: new FormControl('', [
        Validators.minLength(6),
        Validators.maxLength(10),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@#$!%*?&]{6,10}$/)
      ]),
      confirmPassword: new FormControl('')
    });
  }


  private _patchFormValues() {
    if (!this.buyer) return;

    this.MyForm.patchValue({
      firstName: this.buyer.firstName,
      lastName: this.buyer.lastName || ''
    });
  }


  errorMes: string = '';

  async update() {
    if (this.MyForm.invalid) {
      this.toaster.error('Please fill in all required fields correctly.');
      return;
    }

    const formData = new FormData();

    // Add form values
    formData.append('FirstName', this.MyForm.value.firstName);
    formData.append('LastName', this.MyForm.value.lastName || '');
    formData.append('CurrentPassword', this.MyForm.value.currentPassword || '');
    formData.append('NewPassword', this.MyForm.value.password || '');
    formData.append('ConfirmNewPassword', this.MyForm.value.confirmPassword || '');
    formData.append('RemoveImage', this.removeImageFlag.toString());

    // Add image if exists
    if (this.selectedImage) {
      formData.append('Image', this.selectedImage);
    }

    try {
      const response = await lastValueFrom(this.buyerService.updateBuyer(formData));

      // Handle success
      this.toaster.success('Update Profile info successfully');

      // Update local data
      this.buyer = response.buyerDto;
      this.userImage = this.buyer.imageUrl ? (this.apiConfig.apiUrl + this.buyer.imageUrl) : null;

      // Update auth token
      this.auth.updateToken(response.tokenDto.jwtToken);

      // Correct way to reset specific controls
      this.MyForm.patchValue({
        currentPassword: '',
        password: '',
        confirmPassword: ''
      });
      this.errorMes = ''

    } catch (error: any) {
      console.error('Update failed:', error);
      this.errorMes = error.error?.message || 'Update failed';

    }
  }

  // Update the uploadImage method to handle File
  uploadImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        this.selectedImage = file;
        this.removeImageFlag = false;

        // Preview logic
        const reader = new FileReader();
        reader.onload = (e) => this.userImage = e.target?.result as string;
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  removeImage() {
    this.userImage = null;
    this.selectedImage = null;
    this.removeImageFlag = true;
  }

  hasRole(requiredRole: string) {
    return this.auth.hasRole(requiredRole);
  }

  hasRoleOrNoUser(requiredRole: string) {
    return !this.auth.isAuthenticated() || this.auth.hasRole(requiredRole);
  }

  hasUser() {
    return this.auth.isAuthenticated();
  }
}


