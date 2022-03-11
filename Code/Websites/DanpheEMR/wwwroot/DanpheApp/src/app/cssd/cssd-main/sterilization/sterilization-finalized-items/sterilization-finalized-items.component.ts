import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { GridEmitModel } from '../../../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import CSSDGridColumns from '../../../shared/cssd-grid-columns';
import { SterilizationService } from '../sterilization.service';

@Component({
  selector: 'app-sterilization-finalized-items',
  templateUrl: './sterilization-finalized-items.component.html'
})
export class SterilizationFinalizedItemsComponent implements OnInit {
  finalizedItemsGridColumns: any[] = [];
  finalizedItemsGridData: any[];
  fromDate: any;
  toDate: any;
  dateRange: string = 'None';
  NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  constructor(public sterilizationService: SterilizationService, public msgBox: MessageboxService) {
    this.finalizedItemsGridColumns = CSSDGridColumns.FinalizedItemColumns;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(...[new NepaliDateInGridColumnDetail('RequestDate', false), new NepaliDateInGridColumnDetail('DisinfectedDate', false)]);
  }
  ngOnInit() {
  }
  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.loadFinalizedItemList();
      } else {
        this.msgBox.showMessage('failed', ['Please enter valid From date and To date']);
      }

    }
  }
  loadFinalizedItemList(): void {
    this.sterilizationService.getAllFinalizedCSSDTransactions(this.fromDate, this.toDate).subscribe(res => {
      if (res.Status == "OK") {
        this.finalizedItemsGridData = res.Results;
      }
      else {
        this.msgBox.showMessage("Failed", ["Failed to load pending cssd list."]);
      }
    }, () => {
      this.msgBox.showMessage("Failed", ["Failed to load pending cssd list."]);
    });
  }
  finalizedItemsGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "dispatch-item":
        {
          var data = confirm(`Are you sure you want to dispatch ${$event.Data.ItemName} to ${$event.Data.RequestedFrom}? `);
          if (data) {
            var selectedCssdTxnId = $event.Data.CssdTxnId;
            var dispatchRemarks = '';
            this.sterilizationService.dispatchCSSDItem(selectedCssdTxnId, dispatchRemarks).subscribe(res => {
              if (res.Status == "OK") {
                this.finalizedItemsGridData = this.finalizedItemsGridData.filter(a => a.CssdTxnId != selectedCssdTxnId);
                this.msgBox.showMessage("Success", [`${$event.Data.ItemName} is successfully dispatched.`]);
              }
              else {
                this.msgBox.showMessage("Failed", ["Failed to dispatch selected item."]);
              }
            }, err => {
              this.msgBox.showMessage("Failed", ["Failed to dispatch selected item."]);
            });
          }
          break;
        }
      default:
        break;

    }
  }
  gridExportOptions = {
    fileName: 'Sterilization_FinalizedItemList_' + moment().format('YYYY-MM-DD') + '.xls',
  };
}
