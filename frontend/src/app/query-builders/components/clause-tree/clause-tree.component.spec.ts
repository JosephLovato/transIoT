import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClauseTreeComponent } from './clause-tree.component';

describe('ClauseTreeComponent', () => {
  let component: ClauseTreeComponent;
  let fixture: ComponentFixture<ClauseTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClauseTreeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClauseTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
