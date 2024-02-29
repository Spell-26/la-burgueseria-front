import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAgregarInsumoComponent } from './modal-agregar-insumo.component';

describe('ModalAgregarInsumoComponent', () => {
  let component: ModalAgregarInsumoComponent;
  let fixture: ComponentFixture<ModalAgregarInsumoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalAgregarInsumoComponent]
    });
    fixture = TestBed.createComponent(ModalAgregarInsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
