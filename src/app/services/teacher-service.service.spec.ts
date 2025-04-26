import { TestBed } from '@angular/core/testing';

import { TeacherService } from './teacher-service.service';

describe('TeacherServiceService', () => {
  let service: TeacherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeacherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
