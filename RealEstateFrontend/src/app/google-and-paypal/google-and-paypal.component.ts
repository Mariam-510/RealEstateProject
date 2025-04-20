import { Component, OnInit } from '@angular/core';
import { PaypalService } from '../Service/paypal.service';
import { ToastrService } from '../Service/toastr.service';
import { AuthService } from '../Service/auth.service';

@Component({
  selector: 'app-google-and-paypal',
  imports: [],
  templateUrl: './google-and-paypal.component.html',
  styleUrl: './google-and-paypal.component.css'
})
export class GoogleAndPaypalComponent implements OnInit {

  constructor(private payPalService: PaypalService, private _authService: AuthService,
    private toastr: ToastrService) { }

  currentUser: any;

  clientId: string = '';

  async ngOnInit() {

    this.currentUser = this._authService.currentUser;
    this._authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });


    try {
      this.clientId = this.payPalService.clientId;

      const paypal = await this.payPalService.loadPayPal(this.clientId);

      if (!paypal || !paypal.Buttons) {
        console.error('PayPal SDK failed to load');
        return;
      }

      paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: 700 } }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          const order = await actions.order.capture();
          console.log('Payment captured:', order);
          // // window.location.href = `/success?orderId=${data.orderID}`;
          // window.location.href = `/profile/bookingHistory`;
          this.toastr.success('Payment successful!');
          setTimeout(() => {
            window.location.href = `/gopl`;
          }, 2500);
        },
        onError: (err: any) => {
          // console.error('PayPal Error:', err);
          this.toastr.error('Payment failed. Please try again.');
        }
      }).render('#paypal-button-container');

    } catch (error) {
      console.error('Error initializing PayPal:', error);
    }
  }


  googleLogin() {
    this._authService.googleLogin();
  }

}
