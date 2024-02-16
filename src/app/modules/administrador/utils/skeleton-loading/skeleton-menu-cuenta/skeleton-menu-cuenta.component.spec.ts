import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonMenuCuentaComponent } from './skeleton-menu-cuenta.component';

describe('SkeletonMenuCuentaComponent', () => {
  let component: SkeletonMenuCuentaComponent;
  let fixture: ComponentFixture<SkeletonMenuCuentaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SkeletonMenuCuentaComponent]
    });
    fixture = TestBed.createComponent(SkeletonMenuCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
