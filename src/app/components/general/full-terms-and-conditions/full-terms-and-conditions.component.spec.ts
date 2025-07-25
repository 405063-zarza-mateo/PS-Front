import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullTermsAndConditionsComponent } from './full-terms-and-conditions.component';

describe('FullTermsAndConditionsComponent', () => {
  let component: FullTermsAndConditionsComponent;
  let fixture: ComponentFixture<FullTermsAndConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullTermsAndConditionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullTermsAndConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
