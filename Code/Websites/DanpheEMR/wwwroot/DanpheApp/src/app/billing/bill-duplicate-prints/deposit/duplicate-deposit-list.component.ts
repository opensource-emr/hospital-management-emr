import { Component } from '@angular/core';

import { BillingBLService } from '../../shared/billing.bl.service';

import { BillingDeposit } from "../../shared/billing-deposit.model";

import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';

import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: './duplicate-deposit-list.html',
  host: { '(window:keydown)': 'hotkeys($event)' }
})
   
// App Component class
export class BIL_DuplicatePrint_DepositListComponent{

  public deposit: BillingDeposit;
  public showReceipt: boolean = false;
  public depositList;
  public duplicateBillGrid: Array<any> = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(
    public BillingBLService: BillingBLService,
    public msgBoxServ: MessageboxService) {
    this.duplicateBillGrid = GridColumnSettings.DuplicateDepositReceiptList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('CreatedOn', true));
    this.GetDepositList();
  }

  GetDepositList() {
    this.BillingBLService.GetDepositList()
      .subscribe(res => {
        this.depositList = res.Results;
      });
  }


  DuplicateReceiptGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "showDetails":
        {
          this.deposit = $event.Data;
          this.showReceipt = true;

        }
        break;
      default:
        break;
    }
  }

  //ShowGridView() {
  //  this.GetDepositList();
  //  this.showReceipt = false;
  //  this.deposit = null;
  //}

  CloseDepositReceiptPopUp() {
    this.showReceipt = false;
    this.deposit = null;
  }

  CallBackCloseRecipt($event) {
    this.CloseDepositReceiptPopUp()
  }

  public hotkeys(event) {
    if (event.keyCode == 27) {//key->ESC
      this.CloseDepositReceiptPopUp();
    }
  }
}
