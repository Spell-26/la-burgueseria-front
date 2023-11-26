import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditarProductoComponent } from './modal-editar-producto.component';

describe('ModalEditarProductoComponent', () => {
  let component: ModalEditarProductoComponent;
  let fixture: ComponentFixture<ModalEditarProductoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalEditarProductoComponent]
    });
    fixture = TestBed.createComponent(ModalEditarProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
