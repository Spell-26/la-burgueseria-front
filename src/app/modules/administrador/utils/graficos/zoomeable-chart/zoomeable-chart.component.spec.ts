import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoomeableChartComponent } from './zoomeable-chart.component';

describe('ZoomeableChartComponent', () => {
  let component: ZoomeableChartComponent;
  let fixture: ComponentFixture<ZoomeableChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ZoomeableChartComponent]
    });
    fixture = TestBed.createComponent(ZoomeableChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
