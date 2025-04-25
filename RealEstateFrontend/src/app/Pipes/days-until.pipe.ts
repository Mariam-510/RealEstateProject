import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'daysUntil'
})
export class DaysUntilPipe implements PipeTransform {

  transform(auctionDate: Date): number {
    const today = new Date();
    const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const utcAuction = Date.UTC(
      new Date(auctionDate).getFullYear(),
      new Date(auctionDate).getMonth(),
      new Date(auctionDate).getDate()
    );
    
    const diffTime = utcAuction - utcToday;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(diffDays, 0);
  }
}
