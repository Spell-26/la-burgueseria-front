import { TestBed } from '@angular/core/testing';

import { CategoriaProductoService } from './categoria-producto.service';

describe('CategoriaProductoService', () => {
  let service: CategoriaProductoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoriaProductoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
