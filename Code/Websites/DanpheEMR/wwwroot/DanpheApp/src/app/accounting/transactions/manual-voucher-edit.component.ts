import { Component, EventEmitter, Output, ChangeDetectorRef } from "@angular/core";
import { Voucher } from "./shared/voucher";
import { AccountingBLService } from "../shared/accounting.bl.service";
import { CoreService } from "../../core/shared/core.service";
import { TransactionViewModel } from "./shared/transaction.model";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { AccountingService } from "../shared/accounting.service";
import { RouteFromService } from "../../shared/routefrom.service";
import { Router } from "@angular/router";
import { FiscalYearModel } from "../settings/shared/fiscalyear.model";

@Component({
  templateUrl: "./manual-voucher-edit-component.html" //  "/PharmacyView/PHRMSaleReturn"
})

export class ManualVoucherEditComponent {

  public voucherNumber: any;
  public voucher: Voucher = new Voucher();
  public sectionId: number = 4;  //for manual voucher we are using section id=4 and name =Manual_Voucher
  public FiscalYearList: Array<FiscalYearModel> = new Array<FiscalYearModel>(); 
  public ActiveFiscalYearList: Array<FiscalYearModel> = new Array<FiscalYearModel>(); 
  public showVoucherDetailsPage: boolean = false;//sud:14mar'20
  public fiscalYearId: number = 0;
  public fiscalYId: any;

  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public accountingBLService: AccountingBLService,
    public routeFrom: RouteFromService,
    public accountingService:AccountingService ) { 
      this.getActiveFiscalYear();
    }

  ViewTransactionDetails() {
    try {
      if (this.voucher.VoucherCode && this.voucher.VoucherCode.trim()) {

        this.showVoucherDetailsPage = false;//sud:14Mar'20
       // localStorage.setItem("SectionId", this.sectionId.toString());
        this.voucherNumber = null;
       // this.routeFrom.RouteFrom = "EditManualVoucher"
        this.voucherNumber = this.voucher.VoucherCode.trim().toUpperCase();
        this.fiscalYId =this.fiscalYearId;
        this.voucher = new Voucher();
        this.changeDetectorRef.detectChanges();//sud:14Mar'20
        this.showVoucherDetailsPage = true;//sud:14Mar'20
      }
      else {
        this.msgBoxServ.showMessage("Error", ["Enter Voucher Number."]);
      }

    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  public ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }

  getActiveFiscalYear() {
    try {
      if (!!this.accountingService.accCacheData.FiscalYearList && this.accountingService.accCacheData.FiscalYearList.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
        this.FiscalYearList = this.accountingService.accCacheData.FiscalYearList;//mumbai-team-june2021-danphe-accounting-cache-change
        this.FiscalYearList = this.FiscalYearList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
        this.ActiveFiscalYearList = this.FiscalYearList.filter(f => f.IsActive == true && f.IsClosed != true);
        this.ActiveFiscalYearList = this.ActiveFiscalYearList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
        this.fiscalYearId = this.FiscalYearList[0].FiscalYearId;
      }
    } catch (ex) {
      console.log(ex);
    }
  }
// onFiscalYearChange() {
//   var fs = this.FiscalYearList.filter(f => f.FiscalYearId == this.fiscalYearId);
//   if (fs.length > 0) {
//       this.activeFiscalYear = fs[0];
//       this.fiscalYearId = fs[0].FiscalYearId;
//       // this.disablebtn = (this.activeFiscalYear.IsClosed == true) ? true : false;  //old code
//       var today = this.securityService.AccHospitalInfo.TodaysDate;
//       var currentData = moment(today).format('YYYY-MM-DD');
//       if (this.fiscalYearId != null) {
//           if (this.activeFiscalYear.IsClosed == true && this.activeFiscalYear.EndDate < currentData)       //btn is desable when selected fs year is closed
//           {
//               this.disablebtn = true;
//           }
//           else if (this.activeFiscalYear.IsClosed == false && this.activeFiscalYear.EndDate < currentData)      //btn is enable when selected fs year is not closed
//           {
//               this.disablebtn = false;
//           }
//           else if (this.activeFiscalYear.IsClosed == false && this.activeFiscalYear.EndDate > currentData)      // btn is desable when selected(current) fs year is not closed  
//           {
//               this.disablebtn = true;
//           }
//       }
//       else {
//           this.disablebtn = true;                            //btn desable when fs years is null
//       }
//   }
// }
}
