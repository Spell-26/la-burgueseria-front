import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNuevoProductoComponent } from './modal-nuevo-producto.component';

describe('ModalNuevoProductoComponent', () => {
  let component: ModalNuevoProductoComponent;
  let fixture: ComponentFixture<ModalNuevoProductoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalNuevoProductoComponent]
    });
    fixture = TestBed.createComponent(ModalNuevoProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
