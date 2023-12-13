import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddProductoComponent } from './modal-add-producto.component';

describe('ModalAddProductoComponent', () => {
  let component: ModalAddProductoComponent;
  let fixture: ComponentFixture<ModalAddProductoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalAddProductoComponent]
    });
    fixture = TestBed.createComponent(ModalAddProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
