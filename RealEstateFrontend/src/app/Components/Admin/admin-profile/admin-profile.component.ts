import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { AdminDto, AdminService } from '../../../Services/ApiServices/admin.service';
import { API_CONFIG } from '../../../app.config';
import { lastValueFrom } from 'rxjs';  // Important import
import { ToastrService } from '../../../Services/toastr.service';

@Component({
  selector: 'app-admin-profile',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css'
})
export class AdminProfileComponent {

  userImage: string | null = null;
  currentUser: any;
  MyForm!: FormGroup;
  apiConfig = API_CONFIG;
  admin: AdminDto | null = null;

  selectedImage: File | null = null;
  removeImageFlag = false;

  constructor(private router: Router, private auth: AuthService, private adminService: AdminService,
    private toaster: ToastrService, private cdr: ChangeDetectorRef) { }

  async ngOnInit() {
    if (!this.hasRole('Admin')) {
      this.router.navigate(['/login']);
      return;
    }

    this._initializeForm(); // Initialize FIRST
    await this.loadAdmin(); // Load data AFTER
    this._patchFormValues(); // Update form

    this.userImage = this.admin?.imageUrl ? (this.apiConfig.apiUrl + this.admin?.imageUrl) : null;

  }

  private _initializeForm() {
    this.MyForm = new FormGroup(
      {

        Name: new FormControl(this.currentUser?.firstName, [
          Validators.required,
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

  isLoading = false;

  async loadAdmin(): Promise<void> {
    try {
      this.isLoading = true;
      this.cdr.detectChanges();

      this.admin = await lastValueFrom(this.adminService.getAdmin());
      // Date conversion logic here

      this.isLoading = false;
      this.cdr.detectChanges();

    } catch (err) {
      console.error('Failed to fetch admin:', err);
    }
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

  private _patchFormValues() {
    if (!this.admin) return;

    this.MyForm.patchValue({
      Name: this.admin.name,
    });
  }

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


  errorMes: string = '';

  async update() {
    if (this.MyForm.invalid) {
      this.toaster.error('Please fill in all required fields correctly.');
      return;
    }

    const formData = new FormData();

    // Add form values
    formData.append('Name', this.MyForm.value.Name);
    formData.append('CurrentPassword', this.MyForm.value.currentPassword || '');
    formData.append('NewPassword', this.MyForm.value.password || '');
    formData.append('ConfirmNewPassword', this.MyForm.value.confirmPassword || '');
    formData.append('RemoveImage', this.removeImageFlag.toString());

    // Add image if exists
    if (this.selectedImage) {
      formData.append('Image', this.selectedImage);
    }

    try {
      const response = await lastValueFrom(this.adminService.updateAdmin(formData));

      // Handle success
      this.toaster.success('Update Profile info successfully');

      // Update local data
      this.admin = response.adminDto;
      this.userImage = this.admin.imageUrl ? (this.apiConfig.apiUrl + this.admin.imageUrl) : null;

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
