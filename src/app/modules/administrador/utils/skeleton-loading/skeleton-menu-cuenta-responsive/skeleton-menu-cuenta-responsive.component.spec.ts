import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonMenuCuentaResponsiveComponent } from './skeleton-menu-cuenta-responsive.component';

describe('SkeletonMenuCuentaResponsiveComponent', () => {
  let component: SkeletonMenuCuentaResponsiveComponent;
  let fixture: ComponentFixture<SkeletonMenuCuentaResponsiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SkeletonMenuCuentaResponsiveComponent]
    });
    fixture = TestBed.createComponent(SkeletonMenuCuentaResponsiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
