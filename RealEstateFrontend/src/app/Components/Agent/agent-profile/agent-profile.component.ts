import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { API_CONFIG } from '../../../app.config';
import { AgentDto, AgentService } from '../../../Services/ApiServices/agent.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { lastValueFrom } from 'rxjs';  // Important import

@Component({
  selector: 'app-agent-profile',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './agent-profile.component.html',
  styleUrl: './agent-profile.component.css'
})
export class AgentProfileComponent {

  userImage: string | null = null;
  currentUser: any;
  MyForm!: FormGroup;
  apiConfig = API_CONFIG;
  agent: AgentDto | null = null;

  selectedImage: File | null = null;
  removeImageFlag = false;

  constructor(private router: Router, private auth: AuthService, private agentService: AgentService) { }

  async ngOnInit() {
    if (!this.hasRole('Agent')) {
      this.router.navigate(['/login']);
      return;
    }
    this._initializeForm(); // Initialize FIRST
    await this.loadAgent(); // Load data AFTER
    this._patchFormValues(); // Update form

    this.userImage = this.agent?.imageUrl ? (this.apiConfig.apiUrl + this.agent?.imageUrl) : null;
  }

  async loadAgent(): Promise<void> {
    try {
      this.agent = await lastValueFrom(this.agentService.getAgent());
      // Date conversion logic here
    } catch (err) {
      console.error('Failed to fetch agent:', err);
    }
  }

  private _initializeForm() {
    this.MyForm = new FormGroup(
      {

        Name: new FormControl('', [
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
    if (!this.agent) return;

    this.MyForm.patchValue({
      Name: this.agent.name,
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
      alert('Please fill in all required fields correctly.');
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
      const response = await lastValueFrom(this.agentService.updateAgent(formData));

      // Handle success
      console.log('Update successful:', response.message);

      // Update local data
      this.agent = response.agentDto;
      this.userImage = this.agent.imageUrl ? (this.apiConfig.apiUrl + this.agent.imageUrl) : null;

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
