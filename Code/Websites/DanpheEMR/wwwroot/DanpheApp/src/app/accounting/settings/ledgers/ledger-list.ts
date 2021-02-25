
import { Component, ChangeDetectorRef } from "@angular/core";

import { LedgerModel } from '../shared/ledger.model';
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';

@Component({
  selector: 'ledger-list',
  templateUrl: './ledger-list.html',
})
export class LedgerListComponent {
  public ledgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public showLedgerList: boolean = true;
  public ledgerGridColumns: Array<any> = null;

  public showAddPage: boolean = false;
  public showEditPage: boolean = false;
  public selectedLedger: LedgerModel;
  public index: number;

  constructor(public accountingSettingsBLService: AccountingSettingsBLService,
    public msgBox: MessageboxService,
    public changeDetector: ChangeDetectorRef) {
    this.ledgerGridColumns = GridColumnSettings.ledgerList;
    this.getLedgerList();
  }
  public getLedgerList() {
    this.accountingSettingsBLService.GetLedgerList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.ledgerList = res.Results;
          this.showLedgerList = true;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }

  AddLedger() {
    this.index = null;
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showEditPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  CallBackAdd($event) {
    let tempLed = $event.ledger;
    //this.ledgerList.push(tempLed);
    ////this.ledgerList.push($event.ledger[0]);
    //if (this.index)
    //    this.ledgerList.splice(this.index, 1);
    //this.ledgerList = this.ledgerList.slice();

    this.changeDetector.detectChanges();
    this.getLedgerList();
    this.showAddPage = false;
    this.showEditPage = false;
    this.changeDetector.detectChanges();
    this.selectedLedger = null;
    this.index = null;
  }
  LedgerGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "activateDeactivateBasedOnStatus": {
        this.selectedLedger = null;
        this.index = $event.RowIndex;
        this.selectedLedger = $event.Data;
        this.ActivateDeactivateLedgerStatus(this.selectedLedger)
        this.showLedgerList = true;
        this.selectedLedger = null;
        break;
      }
      case "edit": {
        this.selectedLedger = null;
        this.showAddPage = false;
        this.showEditPage = false;
        this.index = $event.RowIndex;
        this.changeDetector.detectChanges();
        this.selectedLedger = $event.Data;
        this.showLedgerList = true;
        this.showEditPage = true;
        break;
      }
      default:
        break;
    }
  }

  ActivateDeactivateLedgerStatus(selectedLedger: LedgerModel) {
    if (selectedLedger != null) {
      let status = selectedLedger.IsActive == true ? false : true;
      let msg = status == true ? 'Activate' : 'Deactivate';
      if (confirm("Are you Sure want to " + msg + ' ' + selectedLedger.LedgerName + ' ?')) {

        selectedLedger.IsActive = status;
        //we want to update the ISActive property in table there for this call is necessry
        this.accountingSettingsBLService.UpdateLedgerStatus(selectedLedger)
          .subscribe(
            res => {
              if (res.Status == "OK") {
                let responseMessage = res.Results.IsActive ? "is now activated." : "is now Deactivated.";
                this.msgBox.showMessage("success", [res.Results.LedgerName + ' ' + responseMessage]);
                //This for send to callbackadd function to update data in list
                this.getLedgerList();
              }
              else {
                this.msgBox.showMessage("error", ['Something wrong' + res.ErrorMessage]);
              }
            },
            err => {
              this.logError(err);
            });
      }

    }

  }

  logError(err: any) {
    console.log(err);
  }

}
