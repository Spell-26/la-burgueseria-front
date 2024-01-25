import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEgresosComponent } from './modal-egresos.component';

describe('ModalEgresosComponent', () => {
  let component: ModalEgresosComponent;
  let fixture: ComponentFixture<ModalEgresosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalEgresosComponent]
    });
    fixture = TestBed.createComponent(ModalEgresosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
