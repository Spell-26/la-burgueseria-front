import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelDeGestionComponent } from './panel-de-gestion.component';

describe('PanelDeGestionComponent', () => {
  let component: PanelDeGestionComponent;
  let fixture: ComponentFixture<PanelDeGestionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PanelDeGestionComponent]
    });
    fixture = TestBed.createComponent(PanelDeGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
