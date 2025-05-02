// add-category.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CategoryService } from '../../../Services/ApiServices/category.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from '../../../Services/toastr.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../Services/ApiServices/auth.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  imports: [ReactiveFormsModule, CommonModule, RouterModule, FormsModule],

  styleUrls: ['./add-category.component.css'],
})
export class AddCategoryComponent implements OnInit {
  categoryForm: FormGroup;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  isLoading: boolean = false;

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.categoryForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      ],
      image: [null, Validators.required],
    });
  }
  ngOnInit(): void {
    if (!this.hasRole('Admin')) {
      this.router.navigate(['/login']);
      return;
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

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        this.categoryForm.get('image')?.setErrors({ invalidType: true });
        this.toastr.error(
          'Please select a valid image file.',
          'Invalid File Type'
        );
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.categoryForm.get('image')?.setValue(file);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.selectedFile = null;
    this.categoryForm.get('image')?.setValue(null);
    this.categoryForm.get('image')?.markAsTouched();
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.toastr.error(
        'Please fill all required fields correctly.',
        'Validation Error'
      );
      return;
    }

    if (!this.selectedFile) {
      this.toastr.error(
        'Please select an image for the category.',
        'Image Required'
      );
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('Name', this.categoryForm.value.name);
    formData.append('Categoryimage', this.selectedFile);

    this.categoryService.createCategory(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastr.success('Category created successfully!', 'Success');
        this.resetForm();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating category:', error);
        this.toastr.error(
          'Failed to create category. Please try again.',
          'Error'
        );
      },
    });
  }

  resetForm(): void {
    this.categoryForm.reset();
    this.imagePreview = null;
    this.selectedFile = null;
    // Reset form validation states
    Object.keys(this.categoryForm.controls).forEach((key) => {
      this.categoryForm.get(key)?.setErrors(null);
    });
  }
}
