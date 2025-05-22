import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseComparisonChartComponent } from './course-comparison-chart.component';

describe('CourseComparisonChartComponent', () => {
  let component: CourseComparisonChartComponent;
  let fixture: ComponentFixture<CourseComparisonChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseComparisonChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseComparisonChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
