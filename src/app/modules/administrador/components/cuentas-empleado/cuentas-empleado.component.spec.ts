import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentasEmpleadoComponent } from './cuentas-empleado.component';

describe('CuentasEmpleadoComponent', () => {
  let component: CuentasEmpleadoComponent;
  let fixture: ComponentFixture<CuentasEmpleadoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CuentasEmpleadoComponent]
    });
    fixture = TestBed.createComponent(CuentasEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
