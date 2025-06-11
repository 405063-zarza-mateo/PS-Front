import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherAttendanceChartComponent } from './teacher-attendance-chart.component';

describe('TeacherAttendanceChartComponent', () => {
  let component: TeacherAttendanceChartComponent;
  let fixture: ComponentFixture<TeacherAttendanceChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherAttendanceChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherAttendanceChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
