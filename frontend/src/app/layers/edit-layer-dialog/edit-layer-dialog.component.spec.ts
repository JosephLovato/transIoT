import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayerDialogComponent } from './edit-layer-dialog.component';

describe('EditLayerDialogComponent', () => {
  let component: EditLayerDialogComponent;
  let fixture: ComponentFixture<EditLayerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditLayerDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditLayerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
