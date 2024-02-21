import { TestBed } from '@angular/core/testing';

import { ValidarExistenciasService } from './validar-existencias.service';

describe('ValidarExistenciasService', () => {
  let service: ValidarExistenciasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidarExistenciasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
