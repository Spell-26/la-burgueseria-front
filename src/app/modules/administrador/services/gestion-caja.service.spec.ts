import { TestBed } from '@angular/core/testing';

import { GestionCajaService } from './gestion-caja.service';

describe('GestionCajaService', () => {
  let service: GestionCajaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestionCajaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
