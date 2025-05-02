import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router'
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { SellerDto, SellerService } from '../../../Services/ApiServices/seller.service';
import { API_CONFIG } from '../../../app.config';
import { lastValueFrom } from 'rxjs';  // Important import

@Component({
  selector: 'app-seller-profile',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './seller-profile.component.html',
  styleUrl: './seller-profile.component.css'
})
export class SellerProfileComponent {
  userImage: string | null = null;
  currentUser: any;
  MyForm!: FormGroup;
  apiConfig = API_CONFIG;
  seller: SellerDto | null = null;

  selectedImage: File | null = null;
  removeImageFlag = false;

  constructor(private router: Router, private auth: AuthService,
    private sellerService: SellerService) { }

  async ngOnInit() {

    if (!this.hasRole('Seller')) {
      this.router.navigate(['/login']);
      return;
    }

    console.log('----------------------------------------');

    this._initializeForm(); // Initialize FIRST
    await this.loadSeller(); // Load data AFTER
    this._patchFormValues(); // Update form

    this.userImage = this.seller?.imageUrl ? (this.apiConfig.apiUrl + this.seller?.imageUrl) : null;
  }

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  showCurrentPassword: boolean = false;
  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }


  async loadSeller(): Promise<void> {
    try {
      this.seller = await lastValueFrom(this.sellerService.getSeller());
      // Add date conversion logic here if needed
      // Example: this.seller.createdAt = new Date(this.seller.createdAt);
      // console.log(this.seller);

    } catch (err) {
      console.error('Failed to fetch seller:', err);
    }
  }


  private _initializeForm() {
    this.MyForm = new FormGroup(
      {

        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-z]+$/)
        ]),
        lastName: new FormControl('', [
          // Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-z]+$/)
        ]),
        currentPassword: new FormControl(''),

        password: new FormControl("", [
          Validators.minLength(6),
          Validators.maxLength(10),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@#$!%*?&]{6,10}$/)

        ]),
        confirmPassword: new FormControl('')

      },
    );
  }

  private _patchFormValues() {
    if (!this.seller) return;

    this.MyForm.patchValue({
      firstName: this.seller.firstName,
      lastName: this.seller.lastName || ''
    });
  }

  errorMes: string = '';

  async update() {
    if (this.MyForm.invalid) {
      alert('Please fill in all required fields correctly.');
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
      const response = await lastValueFrom(this.sellerService.updateSeller(formData));

      // Handle success
      console.log('Update successful:', response.message);

      // Update local data
      this.seller = response.sellerDto;
      this.userImage = this.seller.imageUrl ? (this.apiConfig.apiUrl + this.seller.imageUrl) : null;

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
