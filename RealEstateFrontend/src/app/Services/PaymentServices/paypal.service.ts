import { Injectable } from '@angular/core';
import { loadScript } from '@paypal/paypal-js';


@Injectable({
  providedIn: 'root'
})
export class PaypalService {

  constructor() { }

  clientId: string = 'AVGqol8pCSM2nJ9kxkp5Ar3FxhewwKmec8Tz5mKSAdo7afvQitkUMAnStNXLihl0JERV6zSxWWBFINPj'

  async loadPayPal(clientId: string) {
    try {
      const paypal = await loadScript({ clientId });
      return paypal;
    } catch (error) {
      console.error('PayPal SDK failed to load:', error);
      return null; // Ensure that we return null if it fails
    }
  }

}
