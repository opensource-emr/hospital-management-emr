import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { DLService } from "../../../shared/dl.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { SecurityService } from "../../../security/shared/security.service";
import GridColumnSettings from "../../../shared/danphe-grid/grid-column-settings.constant";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { IncentiveBLService } from "../../shared/incentive.bl.service";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { CoreService } from "../../../core/shared/core.service";
import { INCTVGridColumnSettings } from "../../shared/inctv-grid-column-settings";
import { CommonFunctions } from "../../../shared/common.functions";

@Component({
  templateUrl: './inctv-billtxnitems-list.html'
})
export class INCTV_BillTxnItemListComponent {

  public fromDate: string = moment().format('YYYY-MM-DD');
  public toDate: string = moment().format('YYYY-MM-DD');
  public dateRange: string = "last1Week";//by default show last 1 week data.
  public allBillTxnItemsList: Array<any> = [];
  public billTxnItmGridColumns: Array<any> = null;

  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();


  constructor(public msgBoxServ: MessageboxService,
    public dlService: DLService,
    public securityService: SecurityService,
    public incentiveBLService: IncentiveBLService,
    public changeDetectorRef: ChangeDetectorRef,
    public coreService: CoreService
  ) {

    this.billTxnItmGridColumns = INCTVGridColumnSettings.Incentive_BillTxnItemList_GridCols;
    // below two are needed so that we can send these data to edit-fraction component.
    this.LoadAllDocList();
    //this.LoadEmpProfileMap();
    this.GetEmpIncentiveInfo();
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('TransactionDate', true));


  }

  LoadIncentiveTxnItemsList($event) {

    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.dlService.Read("/api/Incentive?reqType=view-txn-items-list&fromDate=" + this.fromDate + "&toDate=" + this.toDate)
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.allBillTxnItemsList = res.Results;

        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get transaction items."]);
          console.log(res.ErrorMessage);
        }
      });

  }

  public showEditFraction: boolean = false;
  public selectedBillTxnItem: any = null;

  TxnItemGridActions($event: GridEmitModel) {

    switch ($event.Action) {

      case "edit":
        {
          this.showEditFraction = false;
          this.changeDetectorRef.detectChanges();
          //console.log($event.Data);
          this.selectedBillTxnItem = $event.Data;
          this.showEditFraction = true;

        }
        break;
      default:
        this.showEditFraction = false;
        this.selectedBillTxnItem = null;
        break;
    }

  }

  EditFractionOnClose($event) {
    if ($event && $event.action == "save") {
      //format of $event is : { action: "save", data: { TxnItemId: number, fractionItems: array<> } }
      //here we receive TxnItemId and array of fraction items from edit fraction component.


      console.log("edit component closed..")
      console.log($event.data);
      //Below section is to update the FractionCount of Current Row in the Source of the Grid
      if ($event.data) {
        let txnItemId = $event.data.TxnItemId;
        if (txnItemId) {
          //get the array lenth (count of fraciton items.)
          let frcCount = 0;
          if ($event.data.fractionItems && $event.data.fractionItems.length) {
            frcCount = $event.data.fractionItems.filter(frc => frc.IsActive == true).length;
          }

          // find the current item in grid source and update the fraction count.
          let currTxnItemInGrid = this.allBillTxnItemsList.find(a => a.BillingTransactionItemId == txnItemId);
          if (currTxnItemInGrid) {
            currTxnItemInGrid.FractionCount = frcCount;
            //slice reloads/resets the array, otherwise grid doesn't reload/refresh the data.
            this.allBillTxnItemsList = this.allBillTxnItemsList.slice();
          }


        }
      }
    }
    else {
      this.showEditFraction = false;
    }
  }

  //// this is needed as a global variable.
  //public EmpProfMap_All: Array<any> = [];

  //LoadEmpProfileMap() {
  //  this.incentiveBLService.GetEmpIncentiveInfo()
  //    .subscribe((res: DanpheHTTPResponse) => {
  //      if (res.Status == "OK") {
  //        this.EmpProfMap_All = res.Results;
  //      }
  //      else {
  //        this.msgBoxServ.showMessage("failed", ["Unable to get transaction items."]);
  //        console.log(res.ErrorMessage);
  //      }
  //    });
  //}


  public allEmpList: Array<any> = [];
  LoadAllDocList() {
    // this.dlService.Read("/BillingReports/GetReferralList")
    //   .map(res => res)
    //   .subscribe((res: DanpheHTTPResponse) => {
    //     if (res.Status == "OK") {
    //       let doclist: Array<any> = res.Results;
    //       this.allEmpList = doclist.map(a => {
    //         return { EmployeeId: a.EmployeeId, FullName: a.FullName }
    //       });
    //       this.allEmpList.unshift({ EmployeeId: 0, FullName: "--Select--" });

    //     }
    //     else {
    //       this.msgBoxServ.showMessage("failed", ["Unable to get transaction items."]);
    //       console.log(res.ErrorMessage);
    //     }
    //   });

    this.incentiveBLService.GetIncentiveApplicableDocterList()
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          let doclist: Array<any> = res.Results;
          this.allEmpList = doclist.map(a => {
            return { EmployeeId: a.EmployeeId, FullName: a.FullName }
          });
          this.allEmpList.unshift({ EmployeeId: 0, FullName: "--Select--" });

        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get transaction items."]);
          console.log(res.ErrorMessage);
        }
      });

  }
  public EmpIncentiveInfo: Array<any> = [];

  public GetEmpIncentiveInfo() {
    this.incentiveBLService.GetEmpIncentiveInfo()
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.EmpIncentiveInfo = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get Data."]);
          console.log(res.ErrorMessage);
        }
      });
  }

  gridExportOptions = {
    fileName: 'InvoiceItemLevelIncentive_' + moment().format('YYYY-MM-DD') + '.xls',
    displayColumns: ['TransactionDate', 'PatientName', 'ServiceDepartmentName', 'ItemName', 'InvoiceNo', 'ReferredByEmpName', 'AssignedToEmpName', 'TotalAmount','FractionCount']
  };

  public ExportAllIncentiveDate() {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcel_INCTV_InvoiceItemLevel?FromDate="
      + this.fromDate + "&ToDate=" + this.toDate)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "InvoiceItemLevelIncentive_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },

        res => this.ErrorMsg(res));
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }
}
