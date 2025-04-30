import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { API_CONFIG } from '../../app.config';
import { AuctionDTOShow } from '../ApiServices/auction.service';
import { PropertyBidDto } from '../ApiServices/property-bid.service';
import { AuthService } from '../ApiServices/auth.service';

@Injectable({ providedIn: 'root' })
export class SignalRService {

  public isConnectionStarted = false;
  // Solution 1: Definite assignment assertion
  public hubConnection!: signalR.HubConnection;

  constructor(private authService: AuthService) {
    this.createConnection();
  }

  private createConnection() {
    // Solution 2: Direct initialization
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_CONFIG.apiUrlNoSlash}/auctionHub`, {
        accessTokenFactory: () => this.authService.getToken() || ''
      })
      .withAutomaticReconnect()
      .build();
  }

  public startConnection(): Promise<void> {
    if (!this.isConnectionStarted) {
      this.isConnectionStarted = true;
      return this.hubConnection.start()
        .then(() => {
          console.log('SignalR connection started');
          // Add reconnection handling
          this.hubConnection.onreconnected(() => {
            console.log('SignalR reconnected');
          });
        })
        .catch(err => {
          console.error('Error starting connection: ' + err);
          this.isConnectionStarted = false;
        });
    }
    return Promise.resolve();
  }

  // Listeners
  public listenToAllAuctions(callback: (auctions: AuctionDTOShow[]) => void) {
    this.hubConnection.on('ReceiveAllAuctions', callback);
  }

  public listenToAuctionDetails(callback: (auction: AuctionDTOShow) => void) {
    this.hubConnection.on('ReceiveAuctionDetails', callback);
  }

  public listenToNewAuctions(callback: (auction: AuctionDTOShow) => void) {
    this.hubConnection.on('NewAuctionCreated', callback);
  }

  public listenToDeletedAuctions(callback: (auctionId: number) => void) {
    this.hubConnection.on('AuctionDeleted', callback);
  }

  public listenToAuctionListUpdates(callback: (updatedAuction: AuctionDTOShow) => void) {
    this.hubConnection.on('AuctionListUpdate', callback);
  }

  // Group Management
  public joinAuctionGroup(auctionId: number): Promise<void> {
    return this.hubConnection.invoke('JoinAuctionGroup', auctionId.toString());
  }

  public leaveAuctionGroup(auctionId: number): Promise<void> {
    return this.hubConnection.invoke('LeaveAuctionGroup', auctionId.toString());
  }

  // Error Handling
  public getConnectionState(): signalR.HubConnectionState {
    return this.hubConnection.state;
  }

  //---------------------------------------------------------------------
  // Add these new bid-related listeners
  public listenToAllBidsUpdates(callback: (data: {
    AuctionId: number,
    AllBids: PropertyBidDto[],
    BidCount: number,
    LastBid: PropertyBidDto | null,
    PropertyStatus: string,
    AuctionStatus: string
  }) => void) {
    this.hubConnection.on('AllBidsUpdated', callback);
  }

  public listenToBidHistoryUpdates(callback: (data: {
    AuctionId: number,
    Bids: PropertyBidDto[]
  }) => void) {
    this.hubConnection.on('BidHistoryUpdated', callback);
  }

}
