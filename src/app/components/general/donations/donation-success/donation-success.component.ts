import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-donation-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donation-success.component.html',
  styleUrl: './donation-success.component.scss'
})
export class DonationSuccessComponent implements OnInit, OnDestroy {
  paymentId: string | null = null;
  subscription : Subscription | undefined;

  constructor(private route: ActivatedRoute) { }
  
  ngOnInit(): void {
   this.subscription = this.route.queryParams.subscribe(params => {
      this.paymentId = params['payment_id'] || null;
    });
  }

 ngOnDestroy(): void {
  if(this.subscription)
    this.subscription.unsubscribe();
  }
}
