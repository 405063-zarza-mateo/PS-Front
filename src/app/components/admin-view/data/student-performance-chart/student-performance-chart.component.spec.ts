import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentPerformanceChartComponent } from './student-performance-chart.component';

describe('StudentPerformanceChartComponent', () => {
  let component: StudentPerformanceChartComponent;
  let fixture: ComponentFixture<StudentPerformanceChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentPerformanceChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentPerformanceChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
