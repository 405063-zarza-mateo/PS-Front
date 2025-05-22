import { TestBed } from '@angular/core/testing';

import { MercadoPagoService} from './mercado-pago-service.service';

describe('MercadoPagoServiceService', () => {
  let service: MercadoPagoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MercadoPagoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
