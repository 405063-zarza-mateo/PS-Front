import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationSuccessComponent } from './donation-success.component';

describe('DonationSuccessComponent', () => {
  let component: DonationSuccessComponent;
  let fixture: ComponentFixture<DonationSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonationSuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonationSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
