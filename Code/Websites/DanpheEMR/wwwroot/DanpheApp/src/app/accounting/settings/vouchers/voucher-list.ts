
import { Component, ChangeDetectorRef } from "@angular/core";

import { VoucherModel } from '../shared/voucher.model';
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
import { AccountingService } from "../../shared/accounting.service";
import { Voucher } from "../../transactions/shared/voucher";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";

@Component({
    selector: 'voucher-list',
    templateUrl: './voucher-list.html',
})
export class VoucherListComponent {
    public voucherList: Array<Voucher> = new Array<Voucher>();//mumbai-team-june2021-danphe-accounting-cache-change
    public showVoucherList: boolean = true;
    public voucherGridColumns: Array<any> = null;

    public showAddPage: boolean = false;
    public selectedVoucher: VoucherModel;
    public index: number;

    constructor(public accountingSettingsBLService: AccountingSettingsBLService,
        public changeDetector: ChangeDetectorRef, public accountingService:AccountingService,
        public msgBox: MessageboxService) {
        this.voucherGridColumns = GridColumnSettings.voucherList;
        this.getVoucherList();
    }
    public getVoucherList() {
            if (!!this.accountingService.accCacheData.VoucherType && this.accountingService.accCacheData.VoucherType.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
                this.voucherList = this.accountingService.accCacheData.VoucherType;//mumbai-team-june2021-danphe-accounting-cache-change
                this.voucherList = this.voucherList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
                this.showVoucherList = true;
            }
    }
    //VoucherGridActions($event: GridEmitModel) {

    //    switch ($event.Action) {
    //        case "edit": {
    //            this.selectedVoucher = null;
    //            this.index = $event.RowIndex;
    //            this.showAddPage = false;
    //            this.changeDetector.detectChanges();
    //            this.selectedVoucher = $event.Data;
    //            this.showAddPage = true;
    //        }
    //        default:
    //            break;
    //    }
    //}
    AddVoucher() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        this.voucherList.push($event.voucher);
        if (this.index)
            this.voucherList.splice(this.index, 1);
        this.voucherList = this.voucherList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedVoucher = null;
        this.index = null;
    }
    VoucherGridActions($event: GridEmitModel) {


        switch ($event.Action) {
          case "showorhideChequeNo": {
            this.selectedVoucher = null;
            this.index = $event.RowIndex;
            this.selectedVoucher = $event.Data;
            this.ShowOrHideChequeNo(this.selectedVoucher,this.index)
            this.showVoucherList = true;
            this.selectedVoucher = null;
            break;
          }
          case "showorhidePayeeNameBasedOnStatus": {
            this.selectedVoucher = null;
            this.index = $event.RowIndex;
            this.selectedVoucher = $event.Data;
            this.ShowOrHidePayeeName(this.selectedVoucher,this.index)
            this.showVoucherList = true;
            this.selectedVoucher = null;
            break;
          }
          default:
            break;
        }
      }
      ShowOrHideChequeNo(selectedVoucher: VoucherModel,index:number) {
        if (selectedVoucher != null) {
          let status = selectedVoucher.ShowChequeNumber == true ? false : true;
          let msg = status == true ? 'Show' : 'Hide';
          if (confirm("Are you Sure want to " + msg + ' '  + ' Cheque Number?' )) {
    
            selectedVoucher.ShowChequeNumber = status;
            this.accountingSettingsBLService.UpdateChequeNoStatus(selectedVoucher)
              .subscribe(
                res => {
                  if (res.Status == "OK") {
                    let responseMessage = res.Results.ShowChequeNumber ? "Show Cheque Number." : "Hide Cheque Number.";
                    this.msgBox.showMessage("success", [res.Results.VoucherName + ' ' + responseMessage]);
                  
                    this.voucherList[index].ShowChequeNumber = res.Results.ShowChequeNumber;
                    //This for send to callbackadd function to update data in list
                    this.getVoucherList();
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
      ShowOrHidePayeeName(selectedVoucher: VoucherModel,index:number) {
        if (selectedVoucher != null) {
          let status = selectedVoucher.ShowPayeeName == true ? false : true;
          let msg = status == true ? 'Show' : 'Hide';
          if (confirm("Are you Sure want to " + msg + ' '  + ' Payee Name?' )) {
    
            selectedVoucher.ShowPayeeName = status;
            this.accountingSettingsBLService.UpdatePayeeNameStatus(selectedVoucher)
              .subscribe(
                res => {
                  if (res.Status == "OK") {
                    let responseMessage = res.Results.ShowPayeeName ? "Show Cheque Number." : "Hide Cheque Number.";
                    this.msgBox.showMessage("success", [res.Results.VoucherName + ' ' + responseMessage]);
                    this.voucherList[index].ShowPayeeName = res.Results.ShowPayeeName
                    //This for send to callbackadd function to update data in list
                    this.getVoucherList();
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