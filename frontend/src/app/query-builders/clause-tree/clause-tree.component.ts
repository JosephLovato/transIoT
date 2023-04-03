import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroupDirective } from '@angular/forms'
import { ClauseNode, LogicalOperator } from 'src/app/where-clauses';
import { WhereClauseDialog } from '../where-clause-dialog/where-clause-dialog.component';
import { Attributes } from 'src/app/query';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

export class DialogData {
  node: ClauseNode;
  attributes: Attributes;
}

@Component({
  selector: 'app-clause-tree',
  templateUrl: './clause-tree.component.html',
  styleUrls: ['./clause-tree.component.css']
})
export class ClauseTreeComponent implements OnInit {
  @Input() attributes: Attributes = {};
  @Input() formName: string;
  form: FormControl;

  treeControl = new NestedTreeControl<ClauseNode, string>(node => node.children, {
    trackBy: (node) => node.id.toString()
  });
  dataSource = new MatTreeNestedDataSource<ClauseNode>();
  dataChange = new BehaviorSubject<ClauseNode[]>([]);
  // * Delete
  // currentNode: ClauseNode;

  get data(): ClauseNode[] {
    return this.dataChange.value;
  }

  constructor(
    private dialog: MatDialog,
    private rootFormControl: FormGroupDirective) {
    this.dataChange.subscribe(data => {
      this.dataSource.data = data;
    })
  }

  hasChild = (_: number, node: ClauseNode) => !!node.children && node.children.length > 0;

  ngOnInit(): void {
    this.form = this.rootFormControl.control.get(this.formName) as FormControl;
    this.dataChange.next(this.whereClauses);
  }

  get whereClauses(): ClauseNode[] {
    return [this.form.value]
  }

  addNode(node: ClauseNode) {
    node.children?.push(new ClauseNode);
    this.dataSource.data = []; // current hack to get DOM to update
    this.dataSource.data = this.whereClauses;
    this.treeControl.expand(node); // does this do anything?
  }

  async editNode(node: ClauseNode) {
    console.log("[<Clause-Tree>]: editing node: ", node.id);
    // open dialog to edit
    const dialogRef = this.dialog.open(WhereClauseDialog, {
      width: '30%',
      data: {
        node: node,
        attributes: this.attributes
      }
    });
    // wait for dialog to return the edited node
    let editedNode = await lastValueFrom<ClauseNode>(dialogRef.afterClosed());
    if(editedNode == null) return; // don't do anything if the dialog was 'canceled'
    // manually inject edited values (only way that worked)
    node.id = editedNode.id;
    node.nodeType = editedNode.nodeType;
    node.logicalOperator = editedNode.logicalOperator;
    node.whereClause = editedNode.whereClause;
    node.children = editedNode.children;
    // refresh DOM
    // TODO: refactor into function
    this.dataSource.data = []; // current hack to get DOM to update
    this.dataSource.data = this.whereClauses;
  }

}
