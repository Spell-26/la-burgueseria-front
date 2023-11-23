import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalLateralComponent } from './modal-lateral.component';

describe('ModalLateralComponent', () => {
  let component: ModalLateralComponent;
  let fixture: ComponentFixture<ModalLateralComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalLateralComponent]
    });
    fixture = TestBed.createComponent(ModalLateralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
