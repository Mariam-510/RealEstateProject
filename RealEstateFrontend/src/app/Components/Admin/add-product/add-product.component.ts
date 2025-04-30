// add-product.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductService } from '../../../Services/ApiServices/product.service';
import { CategoryService } from '../../../Services/ApiServices/category.service';
import { ToastrService } from '../../../Services/toastr.service';

import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../Services/ApiServices/auth.service';

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  images: { file: File; preview: string }[] = [];
  categories: any[] = [];
  colorQuantities: { color: string; quantity: number }[] = [];
  isLoading: boolean = false;

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private toastr: ToastrService,

    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      ],
      description: ['', [Validators.maxLength(200)]],
      price: ['', [Validators.required, Validators.min(0)]],
      isUsed: [false, Validators.required],
      categoryID: ['', Validators.required],
      images: [[], Validators.required],
      color: ['#ffffff'],
      quantity: [1, [Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    if (!this.hasRole('Admin')) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadCategories();
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

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (response: any) => {
        // Access the categoryDto property from the response
        this.categories = response.categoryDto || [];

        // Optional: Log to verify the structure
        console.log('Loaded categories:', this.categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.toastr.error(
          'Failed to load categories. Please try again.',
          'Error'
        );
      },
    });
  }

  addColorQuantity(): void {
    const color = this.productForm.get('color')?.value;
    const quantity = this.productForm.get('quantity')?.value;

    if (color && quantity > 0) {
      const existingIndex = this.colorQuantities.findIndex(
        (item) => item.color.toLowerCase() === color.toLowerCase()
      );

      if (existingIndex >= 0) {
        this.colorQuantities[existingIndex].quantity += quantity;
      } else {
        this.colorQuantities.push({ color, quantity });
      }

      this.productForm.get('quantity')?.setValue(1);
      this.productForm.get('color')?.setValue('#ffffff');
    }
  }

  removeColor(index: number): void {
    this.colorQuantities.splice(index, 1);
  }

  onFileChange(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.match('image.*')) {
          this.toastr.error(
            'Please select valid image files only.',
            'Invalid File Type'
          );
          continue;
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.images.push({ file, preview: e.target.result });
          this.productForm.get('images')?.setValue(this.images);
          this.productForm.get('images')?.markAsTouched();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
    this.productForm
      .get('images')
      ?.setValue(this.images.length > 0 ? this.images : null);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.toastr.error(
        'Please fill all required fields correctly.',
        'Validation Error'
      );
      return;
    }

    if (this.images.length === 0) {
      this.toastr.error(
        'Please add at least one product image.',
        'Images Required'
      );
      return;
    }

    if (this.colorQuantities.length === 0) {
      this.toastr.error(
        'Please add at least one color with quantity.',
        'Color Quantities Required'
      );
      return;
    }

    this.isLoading = true;

    const formData = new FormData();

    // Append basic product info
    formData.append('Name', this.productForm.value.name);
    formData.append('Description', this.productForm.value.description);
    formData.append('Price', this.productForm.value.price.toString());
    formData.append('IsUsed', this.productForm.value.isUsed.toString());
    formData.append('CategoryID', this.productForm.value.categoryID.toString());

    // Append each color quantity as separate form data entries
    this.colorQuantities.forEach((cq, index) => {
      formData.append(`ProductStockFormDtos[${index}].Color`, cq.color);
      formData.append(
        `ProductStockFormDtos[${index}].Quantity`,
        cq.quantity.toString()
      );
    });

    // Append images
    this.images.forEach((image) => {
      formData.append('ProductImages', image.file);
    });

    this.productService.createProduct(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastr.success('Product created successfully!', 'Success');
        this.resetForm();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating product:', error);
        this.toastr.error(
          'Failed to create product. Please try again.',
          'Error'
        );
      },
    });
  }

  resetForm(): void {
    this.productForm.reset({
      isUsed: false,
      color: '#ffffff',
      quantity: 1,
    });
    this.images = [];
    this.colorQuantities = [];
    // Reset form validation states
    Object.keys(this.productForm.controls).forEach((key) => {
      this.productForm.get(key)?.setErrors(null);
    });
  }
}
