import { Pipe, PipeTransform } from '@angular/core';
import { CartItem, CartService } from '../Services/cart.service';

 /* Custom pipe for item count display */
 @Pipe({ name: 'cartItemCount' })
 export class CartItemCountPipe implements PipeTransform {

  constructor(public cartService: CartService) {}

   transform(items: CartItem[]): number {
     return items?.reduce((total, item) => total + item.quantity, 0) || 0;
   }
 }
