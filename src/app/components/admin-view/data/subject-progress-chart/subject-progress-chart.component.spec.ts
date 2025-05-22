import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectProgressChartComponent } from './subject-progress-chart.component';

describe('SubjectProgressChartComponent', () => {
  let component: SubjectProgressChartComponent;
  let fixture: ComponentFixture<SubjectProgressChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectProgressChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectProgressChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
