import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableCuentaComponent } from './draggable-cuenta.component';

describe('DraggableCuentaComponent', () => {
  let component: DraggableCuentaComponent;
  let fixture: ComponentFixture<DraggableCuentaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DraggableCuentaComponent]
    });
    fixture = TestBed.createComponent(DraggableCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
