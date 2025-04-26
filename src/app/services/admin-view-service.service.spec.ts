import { TestBed } from '@angular/core/testing';

import { AdminViewService } from './admin-view-service.service';

describe('AdminViewServiceService', () => {
  let service: AdminViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
