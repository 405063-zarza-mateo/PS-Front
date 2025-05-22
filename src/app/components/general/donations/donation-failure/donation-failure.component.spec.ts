import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationFailureComponent } from './donation-failure.component';

describe('DonationFailureComponent', () => {
  let component: DonationFailureComponent;
  let fixture: ComponentFixture<DonationFailureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonationFailureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonationFailureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
