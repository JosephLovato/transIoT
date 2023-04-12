import { Component, Input, OnInit, ChangeDetectorRef, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroupDirective } from '@angular/forms'
import { ClauseNode, LogicalOperator } from 'src/app/query/where-clauses';
import { WhereClauseDialog } from '../where-clause-dialog/where-clause-dialog.component';
import { Attributes } from 'src/app/query/query';
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
  @Input() set refresh(value: number) {
    if (value > 0) this.ngOnInit();
  }
  @Output() rootNodeDeleted = new EventEmitter<boolean>();
  form: FormControl;

  treeControl = new NestedTreeControl<ClauseNode, string>(node => node.children, {
    trackBy: (node) => node.id.toString()
  });
  dataSource = new MatTreeNestedDataSource<ClauseNode>();
  dataChange = new BehaviorSubject<ClauseNode[]>([]);
  // * Delete
  // currentNode: ClauseNode;

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
    // this.rootNode = this.form.value;
    this.dataSource.data = []; // current hack to get DOM to update
    this.dataSource.data = [this.rootNode];
    console.log("INIT");
  }

  get rootNode(): ClauseNode {
    return this.form.value
  }

  addNode(node: ClauseNode) {
    let c = new ClauseNode();
    c.parent = node;
    node.children?.push(c);
    this.dataSource.data = []; // current hack to get DOM to update
    this.dataSource.data = [this.rootNode];
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
    if (editedNode == null) return; // don't do anything if the dialog was 'canceled'
    // manually inject edited values (only way that worked)
    node.id = editedNode.id;
    node.nodeType = editedNode.nodeType;
    node.logicalOperator = editedNode.logicalOperator;
    node.whereClause = editedNode.whereClause;
    node.children = editedNode.children;
    node.parent = editedNode.parent;
    // refresh DOM
    // TODO: refactor into function
    this.dataSource.data = []; // current hack to get DOM to update
    this.dataSource.data = [this.rootNode];
    // this.rootNode = this.form.value;
  }

  deleteNode(node: ClauseNode) {
    console.log(node === this.rootNode)
    if (node == this.rootNode) {
      if (this.hasChild(0, node)) {
        if (confirm("Deleting this logical operator will delete all children clauses and operators. Are you sure you want to delete?")) {
          this.form.setValue(new ClauseNode()); // reset root node
          this.rootNodeDeleted.emit(true);
        }
      } else {
        this.form.setValue(new ClauseNode()); // reset root node
        this.rootNodeDeleted.emit(true);
      }
    } else {
      if (this.hasChild(0, node)) {
        if (confirm("Deleting this logical operator will delete all children clauses and operators. Are you sure you want to delete?")) {
          node.parent!.children = node.parent?.children.filter(n => n !== node)!;
        }
      } else {
        node.parent!.children = node.parent?.children.filter(n => n !== node)!;
      }
    }
    // TODO: refactor into function
    this.dataSource.data = []; // current hack to get DOM to update
    this.dataSource.data = [this.rootNode];
  }

}
