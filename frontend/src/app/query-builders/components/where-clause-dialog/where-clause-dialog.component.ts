import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { ClauseNode, LogicalOperator, Operator, WhereClause, NodeType } from 'src/app/query/where-clauses';
import { Attribute, Attributes } from 'src/app/query/query';
import { DialogData } from '../clause-tree/clause-tree.component';
import { Observable, map, pairwise, startWith } from 'rxjs';

@Component({
    selector: 'app-where-clause-dialog',
    templateUrl: 'where-clause-dialog.component.html',
    styleUrls: ['./where-clause-dialog.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WhereClauseDialogComponent implements OnInit {
    clauseForm: FormGroup;
    whereOps = Object.values(Operator);
    logicalOps = Object.values(LogicalOperator);
    nodeTypes = Object.values(NodeType);
    attributes: Attributes;
    attributesIterable: Attribute[];
    currentValueOptions: string[] = [];
    currentValueFilteredOptions: Observable<string[]>;
    nodeType: NodeType = NodeType.Clause;
    valueType: string | undefined = undefined;

    constructor(
        public dialogRef: MatDialogRef<WhereClauseDialogComponent, ClauseNode>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private fb: FormBuilder) { }

    ngOnInit(): void {
        this.attributes = this.data.attributes;
        this.attributesIterable = Object.values(this.attributes);
        this.initializeForm(this.data.node);
        this.valueType = this.data.node.whereClause.valueType;
    }

    // filter for value options selection
    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.currentValueOptions.filter(option => option.toLowerCase().includes(filterValue))
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
        if (data.nodeType == NodeType.Clause) {
            this.clauseForm.get('logicalOperator')?.disable();
        } else {
            this.clauseForm.get('whereClause')?.disable();
        }

        // watch value changes on nodeType to enable/disable dynamically
        this.clauseForm.get('nodeType')?.valueChanges
            .pipe(startWith(this.clauseForm.get('nodeType')?.getRawValue()), pairwise())
            .subscribe(([old, value]) => {
                if (old != value) {
                    this.toggleFormField(this.clauseForm.get('logicalOperator'));
                    this.toggleFormField(this.clauseForm.get('whereClause'));
                }
            });

        // watch value changes on attribute to change type of input field
        this.clauseForm.get('whereClause')?.get('attribute')?.valueChanges
            .pipe(startWith(this.clauseForm.get('whereClause')?.get('attribute')?.value))
            .subscribe(attr => {
                // don't do anything if the attribute is not set
                if (!attr) {
                    return;
                }
                this.valueType = this.attributes[attr].type;
                console.log(this.valueType)
            });

        // change drop down list when attribute changes
        this.clauseForm.get('whereClause')?.get('attribute')?.valueChanges
            .pipe(startWith(this.clauseForm.get('whereClause')?.get('attribute')?.value))
            .subscribe(attr => {
                // don't do anything if the attribute is not set
                if (!attr) {
                    return;
                }
                // add value selection options if type is a string
                if (this.attributes[attr].type == 'string') {
                    this.currentValueOptions = Object.keys(this.attributes[attr].possibleValues as { [key: string]: string });
                } else {
                    this.currentValueOptions = [];
                }
                // inject filter to drop down list
                // TODO see if this can be done without non-null assertion
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.currentValueFilteredOptions = this.clauseForm.get('whereClause')!.get('value')!.valueChanges.pipe(
                    startWith(''),
                    map(value => this._filter(value || ''))
                )
            });
    }

    onSubmit() {
        // confirm with user that changing to clause deleted children
        if (this.clauseForm.get('nodeType')?.value == NodeType.Clause &&
            this.data.node.nodeType == NodeType.LogicalOperator) {
            if (confirm('Switching the type to clause will delete all child clauses. Do you want to switch?')) {
                this.dialogRef.close({ ...this.clauseForm.value, children: [], id: this.data.node.id, parent: this.data.node.parent })
            }
            // confirm with user that change to logical operator deletes clause data
        } else if (this.clauseForm.get('nodeType')?.value == NodeType.LogicalOperator &&
            this.data.node.nodeType == NodeType.Clause) {
            if (confirm('Switching the type to logical operator will delete this clause\'s attribute/op/value. Do you want to switch?')) {
                this.dialogRef.close({ ...this.clauseForm.value, children: this.data.node.children, id: this.data.node.id, parent: this.data.node.parent })
            }
        } else {
            // user did not change node type
            const clause: WhereClause = { ...this.clauseForm.value.whereClause };
            clause.valueType = this.attributes[clause.attribute].type; // << ^^ quick hack to get attribute type // TODO may already be logical operater node, can't get value type
            this.dialogRef.close({ ...this.clauseForm.value, children: this.data.node.children, id: this.data.node.id, parent: this.data.node.parent, whereClause: clause });
        }

    }

    onCancel() {
        this.dialogRef.close();
    }

    toggleFormField(formControl: AbstractControl | null) {
        if (formControl === null) return;
        if (formControl.enabled) {
            formControl.disable();
        } else {
            formControl.enable();
        }
    }
}