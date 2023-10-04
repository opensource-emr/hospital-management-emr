import { ThrowStmt } from '@angular/compiler';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { appInitializerFactory } from '@angular/platform-browser/src/browser/server-transition';


@Component({
  selector: 'lab-status-filter',
  templateUrl: './lab-status-filter.component.html'
})


export class LabStatusFilterComponent implements OnInit {


  @Input("statusAbove")
  statusAbove: number = 0;
  @Input("data")
  data = { statusList: '' };
  public isAllChecked: boolean = true;
  public showAll: boolean = true;
  public orderStatus: any;
  public selectedStatus: Array<string> = [];
  public orderStatusFiltered: any;
  constructor() {

  }

  ngOnInit() {
    this.initializeCheckBox();

  }

  initializeCheckBox() {
    //sud:21Sep'21--renaming the label value for user's ease in understanding.
    this.orderStatus = [
      { id: 1, name: 'Sample Pending', value: "active", isChecked: true },
      { id: 2, name: 'Result Pending', value: "pending", isChecked: true },
      { id: 3, name: 'Result Added', value: "result-added", isChecked: true },
      { id: 4, name: 'Report-Finalized', value: "report-generated", isChecked: true }
    ];

    this.orderStatusFiltered = this.orderStatus.filter(o => o.id > this.statusAbove);
    this.orderStatusFiltered.forEach(elm => {
      this.selectedStatus.push(elm.value);
    });
    if (this.statusAbove >= 3) {
      this.showAll = false;
    }
    this.sendResult();
  }

  onChanged(event) {
    if (event.currentTarget.checked) {
      if (event.currentTarget.value == 'all') {
        this.selectedStatus = [];
        this.initializeCheckBox();
        this.orderStatus.forEach(a => a.isChecked = true);
        this.isAllChecked = true;
      }
      else {
        let index = this.selectedStatus.findIndex(a => a == event.currentTarget.value)
        if (index == -1) {
          this.selectedStatus.push(event.currentTarget.value);
        }
        this.orderStatus.find(a => a.value == event.currentTarget.value).isChecked = true;
        if (this.orderStatus.every(a => a.isChecked)) {
          this.isAllChecked = true;
        }
      }
    }
    else {
      if (event.currentTarget.value == 'all') {
        this.selectedStatus = [];
        this.orderStatus.forEach(a => a.isChecked = false);
        this.isAllChecked = false;
      }
      else {
        let val = event.currentTarget.value;
        let index = this.selectedStatus.findIndex(a => a == val)
        if (index != -1) {
          this.selectedStatus.splice(index, 1);
        }
        this.orderStatus.find(a => a.value == val).isChecked = false;
        if (!this.orderStatus.every(a => a.isChecked)) {
          this.isAllChecked = false;
        }
      }
    }
    this.sendResult();
  }

  sendResult() {
    var data = '';
    this.selectedStatus.forEach(a => {
      data += a + ',';
    });
    data = data.substring(0, data.length - 1);
    this.data.statusList = data;
  }
}
