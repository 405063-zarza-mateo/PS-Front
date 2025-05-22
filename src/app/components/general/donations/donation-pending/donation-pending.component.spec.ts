import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationPendingComponent } from './donation-pending.component';

describe('DonationPendingComponent', () => {
  let component: DonationPendingComponent;
  let fixture: ComponentFixture<DonationPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonationPendingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonationPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
