import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAttendanceChartComponent } from './student-attendance-chart.component';

describe('StudentAttendanceChartComponent', () => {
  let component: StudentAttendanceChartComponent;
  let fixture: ComponentFixture<StudentAttendanceChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAttendanceChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentAttendanceChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
