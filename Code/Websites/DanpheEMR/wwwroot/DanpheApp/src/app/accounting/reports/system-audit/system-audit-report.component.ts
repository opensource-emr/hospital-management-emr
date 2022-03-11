import { Component } from "@angular/core";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { AccountingReportsBLService } from "../shared/accounting-reports.bl.service";
import * as moment from "moment/moment";
import { CoreService } from "../../../core/shared/core.service";
import { AccountingService } from "../../shared/accounting.service";
import { SecurityService } from "../../../security/shared/security.service";
import GridColumnSettings from "../../../shared/danphe-grid/grid-column-settings.constant";
import { SectionModel } from "../../settings/shared/section.model";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { SettingsBLService } from "../../../settings-new/shared/settings.bl.service";

@Component({
  selector: "my-app",
  templateUrl: "./system-audit-report.html",
})
export class SystemAuditReportComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public fiscalyearList: any;
  public voucherType: string = "";
  btndisabled=false;
  public editvoucherGridColumns: Array<any> = null;
  public backDateEntryGridColumns: Array<any> = null;
  public voucherReversalGridColumns: Array<any> = null;
  public logsResults: Array<any> = Array<any>();
  public showeditvoucherlog: boolean = false;
  public showbackdateEntrylog: boolean = false;
  public showeditvoucherreversallog: boolean = false;
  public fiscalYearId: number = null;
  public validDate: boolean = true;
  public sectionId: number = 0;
  public showReversedTxnDetails: boolean = false;
  public sectionList: Array<SectionModel> = [];
  public reverseTxnId: number = 0;
  public reverseTxnDetailObj: Array<any> = new Array<any>();
  public permissions: Array<any> = new Array<any>();
  public applicationList: Array<any> = new Array<any>();
  constructor(
    public msgBoxServ: MessageboxService,
    public coreservice: CoreService,
    public accReportBLService: AccountingReportsBLService,
    public accountingService: AccountingService,
    public securityService: SecurityService,
    public settingsBLService: SettingsBLService
  ) {
    this.editvoucherGridColumns = GridColumnSettings.EditVoucherLogReport;
    this.backDateEntryGridColumns = GridColumnSettings.BackDateEnrtyLogReport;
    this.voucherReversalGridColumns =
      GridColumnSettings.VoucherReversalLogReport;
    this.GetSection();
    this.GetFiscalYearList();
  }
  public GetFiscalYearList() {
    if (!!this.accountingService.accCacheData.FiscalYearList && this.accountingService.accCacheData.FiscalYearList.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
      this.fiscalyearList = this.accountingService.accCacheData.FiscalYearList; //mumbai-team-june2021-danphe-accounting-cache-change
      this.fiscalyearList = this.fiscalyearList.slice(); //mumbai-team-june2021-danphe-accounting-cache-change
    }
  }
  //public validDate:boolean=true;
  //selectDate(event){
  //  if (event) {
  //    this.fromDate = event.fromDate;
  //    this.toDate = event.toDate;
  //    this.validDate = true;
  //  } 
  //   else {
  //    this.validDate =false;
  //  } 
  //}
  checkDateValidation() {
    if (this.sectionId > 0) {
      if (!this.validDate) {
        this.msgBoxServ.showMessage("error", ["Select proper date."]);
        return false;
      } else {
        return true;
      }
    } else {
      this.msgBoxServ.showMessage("error", ["seslect module and try again."]);
      return false;
    }
    // var frmdate = moment(this.fromDate, "YYYY-MM-DD");
    // var tdate = moment(this.toDate, "YYYY-MM-DD");
    // var flg = false;
    // this.fiscalyearList.forEach(a => {
    //   if ((moment(a.StartDate, 'YYYY-MM-DD') <= frmdate) && (tdate <= moment(a.EndDate, 'YYYY-MM-DD'))) {
    //     flg = true;
    //   }
    // });
    // if (flg == false) {
    //   this.msgBoxServ.showMessage("error", ['Selected dates must be with in a fiscal year']);
    //   return flg;
    // }
    // let flag = true;
    // flag = moment(this.fromDate, "YYYY-MM-DD").isValid() == true ? flag : false;
    // flag = moment(this.toDate, "YYYY-MM-DD").isValid() == true ? flag : false;
    // flag = (this.toDate >= this.fromDate) == true ? flag : false;
    // if (!flag) {
    //   this.msgBoxServ.showMessage("error", ['select proper date(FromDate <= ToDate)']);
    // }
    // return flag;
  }
  selectDate(event) {
    if (event) {
      this.fromDate = event.fromDate;
      this.toDate = event.toDate;
      this.fiscalYearId = event.fiscalYearId;
      this.validDate = true;
    } else {
      this.validDate = false;
    }
  }

  GetChangedReportType() {
    try {
      if (this.voucherType == "VoucherReversal") {
        this.logsResults = new Array<any>();
        this.showeditvoucherreversallog = true;
        this.showeditvoucherlog = false;
        this.showbackdateEntrylog = false;
      } else if (this.voucherType == "EditVoucher") {
        this.logsResults = new Array<any>();
        this.showeditvoucherreversallog = false;
        this.showeditvoucherlog = true;
        this.showbackdateEntrylog = false;
      } else {
        this.logsResults = new Array<any>();
        this.showeditvoucherreversallog = false;
        this.showeditvoucherlog = false;
        this.showbackdateEntrylog = true;
      }
      this.Load(this.voucherType);
    } catch (ex) {}
  }
  public GetChangedSection() {
    try {
      this.sectionId = this.sectionList.find(
        (s) => s.SectionId == this.sectionId
      ).SectionId;
    } catch (ex) {}
  }
  public GetSection() {
    this.settingsBLService.GetApplicationList()
    .subscribe(res => {
      if (res.Status == 'OK') {
        this.applicationList = res.Results;
        let sectionApplication = this.applicationList.filter(a => a.ApplicationCode == "ACC-Section" && a.ApplicationName == "Accounts-Sections")[0];
        if (sectionApplication != null || sectionApplication != undefined) {
          this.permissions = this.securityService.UserPermissions.filter(p => p.ApplicationId == sectionApplication.ApplicationId);
        }
        let sList = this.accountingService.accCacheData.Sections; //mumbai-team-june2021-danphe-accounting-cache-change
        sList.forEach(s => {
          let sname = s.SectionName.toLowerCase();
          let pp = this.permissions.filter(f => f.PermissionName.includes(sname))[0];
          if (pp != null || pp != undefined) {
            this.sectionList.push(s);
            this.sectionList = this.sectionList.slice(); //mumbai-team-june2021-danphe-accounting-cache-change
          }
        })
        let defSection = this.sectionList.find(s => s.IsDefault == true);
        if (defSection) {
          this.sectionId = defSection.SectionId;
        }
        else {
          this.sectionId = this.sectionList[0].SectionId;
        }
      }

    });


}
  Load(type) {
    this.btndisabled=true;
    try {
      if (this.voucherType !== "") {
        let getvouchertype = type == "" ? this.voucherType : type;
        if (this.checkDateValidation()) {
          this.logsResults = Array<any>();
          this.accReportBLService
            .GetSystemAuditReport(
              this.fromDate,
              this.toDate,
              this.voucherType,
              this.sectionId
            )
            .subscribe((res) => {
              if (res.Status == "OK" && res.Results.length) {
                this.btndisabled=false;
                this.logsResults = res.Results;
              } else {
                this.btndisabled=false;
                this.msgBoxServ.showMessage("notice", ["No record found."]);
              }
            });
        }
      } else {
        this.btndisabled=false;
        this.msgBoxServ.showMessage("error", [
          "Please select first Audit report type",
        ]);
      }
    } catch (ex) {}
  }
  ReverseTransactionGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "view-detail": {
        this.showReversedTxnDetails = false;
        this.reverseTxnId = $event.Data.ReverseTransactionId;
        this.GetReverseTransactionDetail();
      }
      default:
        break;
    }
  }
  GetReverseTransactionDetail() {
    if (this.reverseTxnId > 0) {
      this.reverseTxnDetailObj = new Array<any>();
      this.accReportBLService
        .GetReverseTransactionDetail(this.reverseTxnId)
        .subscribe((res) => {
          if (res.Status == "OK") {
            if (res.Results.RevereTransactionDetailList.length > 0) {
              this.reverseTxnDetailObj = res.Results.RevereTransactionDetailList;
              let txnRecords = new Array<any>();
              txnRecords = res.Results.txnRecordList;
              this.reverseTxnDetailObj.forEach((rt) => {
                var matchedRec = txnRecords.filter(
                  (t) =>
                    t.SectionId == rt.SectionId &&
                    t.FiscalYearId == rt.FiscalYearId &&
                    t.VoucherNumber == rt.VoucherNumber
                ).length;
                rt.IsRecreated = matchedRec > 0 ? true : false;
              });
              this.showReversedTxnDetails = true;
            } else {
              this.msgBoxServ.showMessage("notice", ["No record found."]);
            }
          } else {
            this.msgBoxServ.showMessage("notice", ["No record found."]);
          }
        });
    } else {
      this.msgBoxServ.showMessage("error", [
        "Please click on view detail and try again.",
      ]);
    }
  }
  Close() {
     this.reverseTxnDetailObj= new Array<any>();
     this.showReversedTxnDetails=false;
}

}
