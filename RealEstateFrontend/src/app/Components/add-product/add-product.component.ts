import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
})
export class AddProductComponent {
  productForm: FormGroup;
  images: { file: File; preview: string }[] = [];
  categories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' },
    { id: 3, name: 'Furniture' },
    { id: 4, name: 'Books' },
    { id: 5, name: 'Toys' },
  ];
  colorQuantities: { color: string; quantity: number }[] = [];

  constructor(private fb: FormBuilder, private router: Router) {
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
      color: ['#000000'],
      quantity: [1, [Validators.min(1)]],
    });
  }

  addColorQuantity(): void {
    const color = this.productForm.get('color')?.value;
    const quantity = this.productForm.get('quantity')?.value;
    
    if (color && quantity > 0) {
      // Check if color already exists
      const existingIndex = this.colorQuantities.findIndex(
        item => item.color.toLowerCase() === color.toLowerCase()
      );
      
      if (existingIndex >= 0) {
        // Update existing color quantity
        this.colorQuantities[existingIndex].quantity += quantity;
      } else {
        // Add new color-quantity pair
        this.colorQuantities.push({ color, quantity });
      }
      
      // Reset the quantity input
      this.productForm.get('quantity')?.setValue(1);
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
        if (!file.type.match('image.*')) continue;

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
    if (this.productForm.valid && this.images.length > 0 && this.colorQuantities.length > 0) {
      const formData = new FormData();

      // Append all form values
      Object.keys(this.productForm.value).forEach((key) => {
        if (key !== 'images' && key !== 'color' && key !== 'quantity') {
          formData.append(
            key.charAt(0).toUpperCase() + key.slice(1),
            this.productForm.value[key]
          );
        }
      });

      // Append color quantities
      formData.append('ColorQuantities', JSON.stringify(this.colorQuantities));

      // Append images
      this.images.forEach((image) => {
        formData.append('Productimage', image.file);
      });

      console.log('Product data:', formData);
      // Here you would typically call your API to create the product
      // this.productService.createProduct(formData).subscribe(...);

      // For demonstration, just navigate after "submitting"
      this.router.navigate(['/products']);
    }
  }
}













