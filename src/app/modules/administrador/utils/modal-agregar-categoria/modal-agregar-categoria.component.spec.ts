import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAgregarCategoriaComponent } from './modal-agregar-categoria.component';

describe('ModalAgregarCategoriaComponent', () => {
  let component: ModalAgregarCategoriaComponent;
  let fixture: ComponentFixture<ModalAgregarCategoriaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalAgregarCategoriaComponent]
    });
    fixture = TestBed.createComponent(ModalAgregarCategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
