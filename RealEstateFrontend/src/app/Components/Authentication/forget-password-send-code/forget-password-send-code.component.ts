import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AccountService } from '../../../Services/ApiServices/account.service';

@Component({
  selector: 'app-forget-password-send-code',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './forget-password-send-code.component.html',
  styleUrl: './forget-password-send-code.component.css'
})
export class ForgetPasswordSendCodeComponent implements OnInit {
  codeArray: string[] = ['', '', '', '', '', ''];
  validationErrors: boolean[] = [false, false, false, false, false, false];
  timer: number = 120;
  displayTime: string = '';
  interval: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService
  ) { }

  email!: string;
  ngOnInit(): void {
    // In SendCodeComponent:
    this.email = this.route.snapshot.queryParams['email'];

    if (!this.email) {
      this.router.navigate(['/forgetpassword']);
      return;
    }

    this.startTimer();
  }


  trackByIndex(index: number): number {
    return index;
  }
  startTimer() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.timer = 120;
    this.updateDisplayTime();

    this.interval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
        this.updateDisplayTime();
      } else {
        clearInterval(this.interval);
        this.displayTime = 'Time expired';
      }
    }, 1000);
  }

  updateDisplayTime() {
    const minutes = Math.floor(this.timer / 60);
    const seconds = this.timer % 60;
    this.displayTime = `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  isFormValid(): boolean {
    return this.codeArray.every(value => /^\d$/.test(value)) && this.timer > 0;;
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  moveFocus(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value && index < this.codeArray.length - 1) {
      const next = input.nextElementSibling as HTMLInputElement;
      next?.focus();
    } else if (event.key === 'Backspace' && index > 0 && !value) {
      const prev = input.previousElementSibling as HTMLInputElement;
      prev?.focus();
    }
  }
  validateInputOnBlur(index: number) {
    const value = this.codeArray[index];
    if (!/^\d$/.test(value)) {
      this.validationErrors[index] = true;
    } else {
      this.validationErrors[index] = false;
    }
  }


  errorMes: string = '';
  Confirm(): void {
    // Validate each digit
    this.validationErrors = this.codeArray.map(c => !/^\d$/.test(c));

    if (!this.isFormValid()) {
      this.errorMes = 'Please enter a valid 6-digit code';
      return;
    }

    const code = this.codeArray.join('');

    this.accountService.validateResetCode(this.email, code).subscribe({
      next: () => {
        this.router.navigate(['/newpassword'], {
          queryParams: { email: this.email }
        });
      },
      error: (err) => {
        console.error('Validation failed', err);
        if (err.status === 404) {
          this.errorMes = 'User not found';
        } else if (err.status === 400) {
          this.errorMes = err.error?.message || 'Invalid or expired code';
        } else {
          this.errorMes = 'Validation failed. Please try again.';
        }
      }
    });
  }

  isResending = false;
  successMes = '';

  ResendCode() {
    if (this.isResending) return;

    this.isResending = true;
    this.errorMes = '';
    this.successMes = '';

    this.accountService.forgotPassword(this.email).subscribe({
      next: (response) => {
        console.log('Resend successful', response);
        this.successMes = 'New code sent! Check your email.';
        this.startTimer();
        this.isResending = false;
      },
      error: (err) => {
        console.error('Resend failed', err);
        if (err.status === 404) {
          this.errorMes = "Email not found.";
        } else if (err.status === 400) {
          this.errorMes = err.error?.message || "Email not confirmed or account pending approval";
        } else if (err.status === 500) {
          this.errorMes = "Failed to send reset code. Please try again.";
        } else {
          this.errorMes = "An unexpected error occurred. Please try again.";
        }
        this.isResending = false;
      }

    });
  }

}
