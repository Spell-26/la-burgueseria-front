import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonPartialComponent } from './skeleton-partial.component';

describe('SkeletonPartialComponent', () => {
  let component: SkeletonPartialComponent;
  let fixture: ComponentFixture<SkeletonPartialComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SkeletonPartialComponent]
    });
    fixture = TestBed.createComponent(SkeletonPartialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
