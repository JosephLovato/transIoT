import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Query } from 'src/app/query/query';

@Component({
  selector: 'app-edit-layer-dialog',
  templateUrl: './edit-layer-dialog.component.html',
  styleUrls: ['./edit-layer-dialog.component.css']
})
export class EditLayerDialogComponent implements OnInit {
  layerForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditLayerDialogComponent, Query>,
    @Inject(MAT_DIALOG_DATA) public data: Query,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.initializeForm(this.data);
  }

  initializeForm(data: Query) {
    this.layerForm = this.fb.group({
      name: data.name
    });
  }

  onSubmit() {
    this.data.name = this.layerForm.get('name')?.value;
    this.dialogRef.close(this.data);
  }

  onCancel() {
    this.dialogRef.close();
  }

}
