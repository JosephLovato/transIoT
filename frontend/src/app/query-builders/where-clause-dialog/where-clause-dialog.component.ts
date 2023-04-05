import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, AbstractControl } from '@angular/forms'
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { ClauseNode, LogicalOperator, Operator, WhereClause, NodeType } from 'src/app/where-clauses';
import { Attribute, Attributes } from 'src/app/query';
import { DialogData } from '../clause-tree/clause-tree.component';
import { pairwise, startWith } from 'rxjs';

@Component({
    selector: 'where-clause-dialog',
    templateUrl: 'where-clause-dialog.component.html',
    styleUrls: ['./where-clause-dialog.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WhereClauseDialog {
    clauseForm: FormGroup;
    whereOps = Object.values(Operator);
    logicalOps = Object.values(LogicalOperator);
    nodeTypes = Object.values(NodeType);
    attributes: Attributes;
    attributesIterable: Attribute[];
    // previousNode: ClauseNode;

    nodeType: NodeType = NodeType.Clause;

    constructor(
        public dialogRef: MatDialogRef<WhereClauseDialog, ClauseNode>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private fb: FormBuilder) { }

    ngOnInit(): void {
        this.initializeForm(this.data.node);
        this.attributes = this.data.attributes;
        this.attributesIterable = Object.values(this.attributes);
        // this.previousNode = { ...this.data.node, whereClause: this.data.node.whereClause};
    }

    initializeForm(data: ClauseNode) {
        // set up form group
        this.clauseForm = this.fb.group({
            nodeType: data.nodeType,
            logicalOperator: data.logicalOperator,
            whereClause: this.fb.group({
                attribute: data.whereClause?.attribute,
                operator: data.whereClause?.operator,
                value: data.whereClause?.value
            }),
        })

        // disable fields if necessary
        if(data.nodeType == NodeType.Clause) {
            this.clauseForm.get('logicalOperator')?.disable();
        } else {
            this.clauseForm.get('whereClause')?.disable();
        }

        // watch value changes on nodeType to enable/disable dynamically
        this.clauseForm.get('nodeType')?.valueChanges
        .pipe(startWith(this.clauseForm.get('nodeType')!.getRawValue()), pairwise())
        .subscribe(([old,value]) => {
            if(old != value) {
                this.toggleFormField(this.clauseForm.get('logicalOperator')!);
                this.toggleFormField(this.clauseForm.get('whereClause')!);
            }
        });

        // watch value changes on attribute to change properties of input
        this.clauseForm.get('whereClause')?.get('attribute')?.valueChanges
        .pipe(startWith(this.clauseForm.get('whereClause')?.get('attribute')?.getRawValue()))
        .subscribe(value => {
            // this.clauseForm.get('whereClause')?.get('value')?.ty
        })
    }

    onSubmit() {
        // confirm with user that changing to clause deleted children
        if(this.clauseForm.get('nodeType')?.value == NodeType.Clause &&
            this.data.node.nodeType == NodeType.LogicalOperator) {
                if(confirm('Switching the type to clause will delete all child clauses. Do you want to switch?')) {
                    this.dialogRef.close({ ...this.clauseForm.value, children: [], id: this.data.node.id, parent: this.data.node.parent})
                }
        } else if(this.clauseForm.get('nodeType')?.value == NodeType.LogicalOperator &&
        this.data.node.nodeType == NodeType.Clause) {
            if(confirm('Switching the type to logical operator will delete this clause\'s attribute/op/value. Do you want to switch?')) {
                this.dialogRef.close({ ...this.clauseForm.value, children: this.data.node.children, id: this.data.node.id, parent: this.data.node.parent})
            }
        } else {
            this.dialogRef.close({ ...this.clauseForm.value, children: this.data.node.children, id: this.data.node.id, parent: this.data.node.parent});
        }

    }

    onCancel() {
        this.dialogRef.close();
    }

    toggleFormField(formControl: AbstractControl) {
        if(formControl.enabled) {
            formControl.disable();
        } else {
            formControl.enable();
        }
    }
}