import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditarCuentaComponent } from './modal-editar-cuenta.component';

describe('ModalEditarCuentaComponent', () => {
  let component: ModalEditarCuentaComponent;
  let fixture: ComponentFixture<ModalEditarCuentaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalEditarCuentaComponent]
    });
    fixture = TestBed.createComponent(ModalEditarCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
