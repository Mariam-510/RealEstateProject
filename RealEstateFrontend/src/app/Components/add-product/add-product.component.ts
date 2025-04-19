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
      quantity: ['', [Validators.required, Validators.min(0)]],
      isUsed: [false, Validators.required],
      categoryID: ['', Validators.required],
      images: [[], Validators.required],
    });
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
    if (this.productForm.valid && this.images.length > 0) {
      const formData = new FormData();

      // Append all form values
      Object.keys(this.productForm.value).forEach((key) => {
        if (key !== 'images') {
          formData.append(
            key.charAt(0).toUpperCase() + key.slice(1),
            this.productForm.value[key]
          );
        }
      });

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
