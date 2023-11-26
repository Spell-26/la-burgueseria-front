import { TestBed } from '@angular/core/testing';

import { InsumosPorProductoService } from './insumos-por-producto.service';

describe('InsumosPorServicioService', () => {
  let service: InsumosPorProductoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InsumosPorProductoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
