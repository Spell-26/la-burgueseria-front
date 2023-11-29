import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesasComponent } from './mesas.component';

describe('MesasComponent', () => {
  let component: MesasComponent;
  let fixture: ComponentFixture<MesasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MesasComponent]
    });
    fixture = TestBed.createComponent(MesasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
