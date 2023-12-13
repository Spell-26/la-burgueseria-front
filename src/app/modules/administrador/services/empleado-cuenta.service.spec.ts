import { TestBed } from '@angular/core/testing';

import { EmpleadoCuentaService } from './empleado-cuenta.service';

describe('EmpleadoCuentaService', () => {
  let service: EmpleadoCuentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpleadoCuentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
