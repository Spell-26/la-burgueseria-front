import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BootstrapRangeCalendarComponent } from './bootstrap-range-calendar.component';

describe('BootstrapRangeCalendarComponent', () => {
  let component: BootstrapRangeCalendarComponent;
  let fixture: ComponentFixture<BootstrapRangeCalendarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BootstrapRangeCalendarComponent]
    });
    fixture = TestBed.createComponent(BootstrapRangeCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
