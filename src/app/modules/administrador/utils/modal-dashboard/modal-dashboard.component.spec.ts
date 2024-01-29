import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDashboardComponent } from './modal-dashboard.component';

describe('ModalDashboardComponent', () => {
  let component: ModalDashboardComponent;
  let fixture: ComponentFixture<ModalDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalDashboardComponent]
    });
    fixture = TestBed.createComponent(ModalDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
