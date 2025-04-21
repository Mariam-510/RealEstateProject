import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AccountService } from '../../Service/ApiServices/account.service';

@Component({
  selector: 'app-send-code',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './send-code.component.html',
  styleUrl: './send-code.component.css'
})
export class SendCodeComponent {
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

  // Confirm() {
  //   for (let i = 0; i < this.codeArray.length; i++) {
  //     if (!/^\d$/.test(this.codeArray[i])) {
  //       this.validationErrors[i] = true;
  //     } else {
  //       this.validationErrors[i] = false;
  //     }
  //   }

  //   if (!this.isFormValid()) {
  //     return;
  //   }

  //   const code = this.codeArray.join('');
  //   console.log('Code submitted:', code);
  //   this.codeArray = ["", "", "", "", "", ""];
  //   this.validationErrors = [false, false, false, false, false, false];
  //   this.startTimer();
  // }

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


  Confirm(): void {
    // Validate each digit
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


  ResendCode() {
    console.log("Code resent! Timer reset to 2 minutes.");
    this.startTimer();
  }

}
