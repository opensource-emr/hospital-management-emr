import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { GridEmitModel } from '../../../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import CSSDGridColumns from '../../../shared/cssd-grid-columns';
import { SterilizationService } from '../sterilization.service';

@Component({
  selector: 'app-sterilization-pending-items',
  templateUrl: './sterilization-pending-items.component.html'
})
export class SterilizationPendingItemsComponent implements OnInit {
  pendingItemsGridColumns: any[] = [];
  pendingItemsGridData: any[];
  fromDate: any;
  toDate: any;
  dateRange: string = 'None';
  NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  //#region : Disinfection pop up related fields
  showDisinfectionPopUp: boolean;
  selectedItemCssdTxnId: number;
  selectedItemName: string;
  //#endregion : Disinfection pop up related fields

  constructor(public sterilizationService: SterilizationService, public msgBox: MessageboxService) {
    this.pendingItemsGridColumns = CSSDGridColumns.PendingItemColumns;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('RequestDate', false));
  }

  ngOnInit() {
  }
  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.loadPendingItemList();
      } else {
        this.msgBox.showMessage('failed', ['Please enter valid From date and To date']);
      }

    }
  }
  loadPendingItemList(): void {
    this.sterilizationService.getAllPendingCSSDTransactions(this.fromDate, this.toDate).subscribe(res => {
      if (res.Status == "OK") {
        this.pendingItemsGridData = res.Results;
      }
      else {
        this.msgBox.showMessage("Failed", ["Failed to load pending cssd list."]);
      }
    }, () => {
      this.msgBox.showMessage("Failed", ["Failed to load pending cssd list."]);
    });
  }
  pendingItemsGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "disinfect-item":
        {
          let selectedAsset = $event.Data;
          this.selectedItemName = selectedAsset.ItemName;
          this.selectedItemCssdTxnId = selectedAsset.CssdTxnId;
          this.showDisinfectionPopUp = true;
          break;
        }
      default:
        break;

    }
  }
  gridExportOptions = {
    fileName: 'Sterilization_PendingItemList_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  callBackCloseDisinfectionPopUp($event) {
    if ($event.event == "disinfect" && $event.status == "success") {
      this.pendingItemsGridData = this.pendingItemsGridData.filter(a => a.CssdTxnId != this.selectedItemCssdTxnId);
    }
    this.showDisinfectionPopUp = false;
  }
}
