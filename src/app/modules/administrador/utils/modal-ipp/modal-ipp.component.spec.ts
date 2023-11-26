import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalIppComponent } from './modal-ipp.component';

describe('ModalIppComponent', () => {
  let component: ModalIppComponent;
  let fixture: ComponentFixture<ModalIppComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalIppComponent]
    });
    fixture = TestBed.createComponent(ModalIppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
