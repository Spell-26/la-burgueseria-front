import { TestBed } from '@angular/core/testing';

import { ProductosCuentaService } from './productos-cuenta.service';

describe('ProductosCuentaService', () => {
  let service: ProductosCuentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductosCuentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
