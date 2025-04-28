import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sign-up-role-component',
  imports: [RouterModule],
  templateUrl: './sign-up-role-component.component.html',
  styleUrl: './sign-up-role-component.component.css'
})

export class SignUpRoleComponentComponent {

  constructor(
    public dialogRef: MatDialogRef<SignUpRoleComponentComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  closeDialog(): void {
    this.dialogRef.close();
  }

  signUpAsAgent(): void {
    this.dialogRef.close();
    this.router.navigate(['/registerAgent']);
  }

  signUpAsSeller(): void {
    this.dialogRef.close();
    this.router.navigate(['/register'], { queryParams: { role: 'seller' } });
  }

  signUpAsBuyer(): void {
    this.dialogRef.close();
    this.router.navigate(['/register'], { queryParams: { role: 'buyer' } });
  }
}
