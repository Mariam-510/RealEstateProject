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
export class ForgetPasswordSendCodeComponent {
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
      return;
    }

    const code = this.codeArray.join('').toString();

  }



  isResending = false;
  successMes = '';

  ResendCode() {
    if (this.isResending) return;

    this.isResending = true;
    this.errorMes = '';
  }

}
