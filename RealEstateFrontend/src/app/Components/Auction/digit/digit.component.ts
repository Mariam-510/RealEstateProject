import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CountdownModule } from 'ngx-countdown';
import { interval, Subscription } from 'rxjs';
// Add type definitions
type TimeSegment = 'days' | 'hours' | 'minutes' | 'seconds';

interface DigitState {
  current: string;
  next: string;
  flipping: boolean;
}
// Update the component class with proper typing
interface TimeRemaining {
  Total: number;
  Days: number;
  Hours: number;
  Minutes: number;
  Seconds: number;
}

interface CurrentTime {
  Total: Date;
  Hours: number;
  Minutes: number;
  Seconds: number;
}
@Component({
  selector: 'app-digit',
  imports:[CommonModule,CountdownModule,BrowserModule],
  templateUrl: './digit.component.html',
  styleUrls: ['./digit.component.css']
})
export class DigitComponent  {
}