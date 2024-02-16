import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonModalComponent } from './skeleton-modal.component';

describe('SkeletonModalComponent', () => {
  let component: SkeletonModalComponent;
  let fixture: ComponentFixture<SkeletonModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SkeletonModalComponent]
    });
    fixture = TestBed.createComponent(SkeletonModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
