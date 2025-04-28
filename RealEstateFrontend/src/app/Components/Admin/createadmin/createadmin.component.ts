// createadmin.component.ts
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../Services/ApiServices/admin.service';
import { ToastrService } from '../../../Services/toastr.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-createadmin',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './createadmin.component.html',
  styleUrls: ['./createadmin.component.css']
})
export class CreateadminComponent {
  isLoading = false;
  
  createAdminForm = new FormGroup({
    Name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^[A-Za-z\s]+$/) // Allow spaces in names
    ]),
    email: new FormControl('', [
      Validators.required, 
      Validators.pattern(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    ]),
    pass: new FormControl("", [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(10),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@#$!%*?&]{6,10}$/)
    ]),
    confirmPassword: new FormControl("", [
      Validators.required
    ]),
    Image: new FormControl(null) // For file upload
  });

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.createAdminForm.patchValue({
        Image: file
      });
    }
  }

  Create(): void {
    if (this.createAdminForm.invalid) {
      this.toastr.error('Please fill all required fields correctly.', 'Validation Error');
      return;
    }

    if (this.createAdminForm.value.pass !== this.createAdminForm.value.confirmPassword) {
      this.toastr.error('Passwords do not match.', 'Validation Error');
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('Name', this.createAdminForm.value.Name || '');
    formData.append('Email', this.createAdminForm.value.email || '');
    formData.append('Password', this.createAdminForm.value.pass || '');
    formData.append('ConfirmPassword', this.createAdminForm.value.confirmPassword || '');
    
    // Append image if exists
    if (this.createAdminForm.value.Image) {
      formData.append('Image', this.createAdminForm.value.Image);
    }

    this.adminService.createAdmin(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastr.success('Admin created successfully!', 'Success');
        this.createAdminForm.reset();
        this.router.navigate(['/admins']); // Redirect to admin list
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating admin:', error);
        
        if (error.error?.message) {
          this.toastr.error(error.error.message, 'Error');
        } else {
          this.toastr.error('Failed to create admin. Please try again.', 'Error');
        }
      }
    });
  }
}