import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusStopsComponent } from './bus-stops.component';

describe('BusStopsComponent', () => {
  let component: BusStopsComponent;
  let fixture: ComponentFixture<BusStopsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusStopsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusStopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
