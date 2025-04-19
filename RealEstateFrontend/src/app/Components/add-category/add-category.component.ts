import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css'],
})
export class AddCategoryComponent {
  categoryForm: FormGroup;
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private router: Router) {
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

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        this.categoryForm.get('image')?.setErrors({ invalidType: true });
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
    if (this.categoryForm.valid && this.selectedFile) {
      const formData = new FormData();
      formData.append('Name', this.categoryForm.value.name);
      formData.append('Categoryimage', this.selectedFile);

      console.log('Category data:', formData);
      // Here you would typically call your API to create the category
      // this.categoryService.createCategory(formData).subscribe(...);

      // For demonstration, just navigate after "submitting"
      this.router.navigate(['/categories']);
    }
  }
}
