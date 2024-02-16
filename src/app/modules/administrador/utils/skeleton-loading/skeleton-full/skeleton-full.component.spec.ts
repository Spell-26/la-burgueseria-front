import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonFullComponent } from './skeleton-full.component';

describe('SkeletonFullComponent', () => {
  let component: SkeletonFullComponent;
  let fixture: ComponentFixture<SkeletonFullComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SkeletonFullComponent]
    });
    fixture = TestBed.createComponent(SkeletonFullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
