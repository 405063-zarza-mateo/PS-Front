import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentListAdminComponent } from './student-list-admin.component';

describe('StudentListAdminComponent', () => {
  let component: StudentListAdminComponent;
  let fixture: ComponentFixture<StudentListAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentListAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentListAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
