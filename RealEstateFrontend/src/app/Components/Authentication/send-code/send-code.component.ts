import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AccountService } from '../../../Services/ApiServices/account.service';
import { } from '@angular/core';

@Component({
  selector: 'app-send-code',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './send-code.component.html',
  styleUrl: './send-code.component.css'
})
export class SendCodeComponent implements OnInit {
  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef>;
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
      this.router.navigate(['/register']);
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
  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');

    if (index < this.codeArray.length - 1 && input.value) {
      const inputsArray = this.codeInputs.toArray();
      inputsArray[index + 1]?.nativeElement.focus();
    }
  }
  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.codeArray[index] && index > 0) {
      event.preventDefault();
      const inputsArray = this.codeInputs.toArray();
      inputsArray[index - 1].nativeElement.focus();
      inputsArray[index - 1].nativeElement.select();
    }
  }
  onKeyPress(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'Enter', 'Delete', 'ArrowLeft', 'ArrowRight'];
    if (allowedKeys.includes(event.key)) {
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }
  handlePaste(event: ClipboardEvent, startIndex: number) {
    event.preventDefault();
    const clipboardData = event.clipboardData?.getData('text/plain') || '';
    const digits = clipboardData.replace(/\D/g, '').split('');

    for (let i = 0; i < digits.length && startIndex + i < this.codeArray.length; i++) {
      this.codeArray[startIndex + i] = digits[i];
    }

    const lastFilledIndex = Math.min(startIndex + digits.length - 1, this.codeArray.length - 1);
    const inputs = document.querySelectorAll<HTMLInputElement>('input[type="text"]');
    if (inputs[lastFilledIndex]) {
      inputs[lastFilledIndex].focus();
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


  Confirm(): void {
    this.validationErrors = this.codeArray.map(c => !/^\d$/.test(c));

    if (!this.isFormValid()) {
      return;
    }

    const code = this.codeArray.join('').toString();

    this.accountService.confirmEmailCode(this.email, code).subscribe({
      next: (response) => {
        console.log('Email confirmed successfully', response);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Confirmation failed', err);
        this.handleConfirmationError(err);
      }
    });
  }

  errorMes: string = '';
  private handleConfirmationError(error: any): void {
    if (error.status === 400) {
      this.errorMes = error.error?.message || 'Invalid code or expired code';
    } else if (error.status === 404) {
      this.errorMes = 'User not found';
    } else if (error.status === 409) {
      this.errorMes = 'Email already confirmed';
      this.router.navigate(['/login']);
    } else {
      this.errorMes = 'An unexpected error occurred';
    }

    // Clear the code fields on error
    // this.codeArray = ['', '', '', '', '', ''];
    // this.validationErrors = [false, false, false, false, false, false];
  }


  isResending = false;
  successMes = '';

  ResendCode() {
    if (this.isResending) return;

    this.isResending = true;
    this.errorMes = '';
    this.successMes = '';

    this.accountService.resendConfirmationEmail(this.email).subscribe({
      next: (response) => {
        console.log('Resend successful', response);
        this.successMes = 'New code sent! Check your email.';
        this.startTimer();
        this.isResending = false;
      },
      error: (err) => {
        console.error('Resend failed', err);
        this.handleResendError(err);
        this.isResending = false;
      }
    });
  }
  private handleResendError(error: any): void {
    if (error.status === 404) {
      this.errorMes = 'Email not found. Please register again.';
      this.router.navigate(['/register']);
    } else if (error.status === 409) {
      this.errorMes = 'Email already confirmed';
      this.router.navigate(['/login']);
    } else if (error.status === 400) {
      this.errorMes = error.error?.message || 'Invalid request';
    } else {
      this.errorMes = 'Failed to resend code. Please try again.';
    }
  }

}
