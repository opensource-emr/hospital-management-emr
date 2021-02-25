import { Component } from '@angular/core';

import { BillingBLService } from '../shared/billing.bl.service';

import { BillingDeposit } from "../shared/billing-deposit.model";

import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';

import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { BillingReceiptModel } from '../shared/billing-receipt.model';
import { APIsByType } from '../../shared/search.service';
import { CoreService } from '../../core/shared/core.service';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  selector: 'provisional-receipt',
  templateUrl: './duplicate-provisional-receipt.html'
})

// App Component class
export class DuplicateProvisionalReceiptComponent {

  public showReceipt: boolean = false;
  public provisionalInvoiceList: Array<any> = new Array<any>();
  //public doctorsList: Array<any> = [];
  public duplicateProvisionalBillGridColumns: Array<any> = null;
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = null;
  public invoice: BillingReceiptModel;
  previousInvoiceNo: any;
  nextInvoiceNo: any;
  currentData: any;
  public patGirdDataApi:string="";
  searchText:string='';
  public enableServerSideSearch: boolean = false;


  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(
    public BillingBLService: BillingBLService,
    public msgBoxServ: MessageboxService, public coreService:CoreService) {
    this.dateRange = "None";
    this.duplicateProvisionalBillGridColumns = GridColumnSettings.DuplicateProvisionalReceiptList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('CreatedOn', true));

    // this.GetInvoiceListForDuplicatebill(this.fromDate,this.toDate);
    //this.GetDoctorsList();
    //this.patGirdDataApi=APIsByType.BillingProvisional;
    this.getParamter();
    this.GetInvoiceListForDuplicatebill("");

  }

  // onDateChange($event) {
  //   this.fromDate = $event.fromDate;
  //   this.toDate = $event.toDate;
  //   if (this.fromDate != null && this.toDate != null) {
  //     this.GetInvoiceListForDuplicatebill(this.fromDate, this.toDate);
  //   }
  // }
  serverSearchTxt(searchTxt) {
    this.searchText = searchTxt;
    this.GetInvoiceListForDuplicatebill(this.searchText);
}
getParamter(){
  let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "ServerSideSearchComponent").ParameterValue;
  var data= JSON.parse(parameterData);
  this.enableServerSideSearch = data["BillingProvisional"];
}
  GetInvoiceListForDuplicatebill(searchTxt) {
    this.BillingBLService.GetProvisionalReceiptDetailsForDuplicatebill(searchTxt)
      .subscribe(res => {
        this.provisionalInvoiceList = res.Results;
      });
  }

  DuplicateProvisionalBillPrintGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "showDetails":
        {
          var data = $event.Data;
          this.currentData = data;
          this.GetByReceiptNoFiscalYear(data.ProvisionalReceiptNo, data.FiscalYearId);
          // this.previousInvoiceNo = data.ProvisionalReceiptNo - 1;
          // this.nextInvoiceNo = data.ProvisionalReceiptNo + 1;
        }
        break;
      default:
        break;
    }
  }

  ShowGridView() {
    this.showReceipt = false;
    this.invoice = null;
  }

  GetByReceiptNoFiscalYear(Receiptno: number, fiscalYrId: number) {
    this.BillingBLService.GetProvInvoiceByReceiptNo(Receiptno, fiscalYrId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.invoice = BillingReceiptModel.GetProvisionalReceiptForDuplicate(res.Results, this.currentData);

          // for (let i = 0; i < this.invoice.BillingItems.length; i++) {
          //   if (this.invoice.BillingItems[i].RequestedBy) {
          //     //sometimes, when employee is InActive (disabled), we don't get that employee object in the list.
          //     let requestingDoctor = this.doctorsList.find(a => a.EmployeeId == this.invoice.BillingItems[i].RequestedBy);
          //     if (requestingDoctor) {
          //       this.invoice.BillingItems[i].RequestedByName = requestingDoctor.FullName;
          //     }
          //   }
          // }

          this.showReceipt = true;
        }
        else {
          this.msgBoxServ.showMessage("error", ["unable to fetch duplicate bill details. Pls try again later.."]);
          console.log(res.ErrorMessage);
        }
      },
        err => {
          //add messagebox here..
          alert("unable to fetch duplicate bill details. Pls try again later..");
          console.log(err);
        });
  }

  // //showing Previous Invoice
  // ShowPreviousInvoice() {
  //   var previousInvoiceInfo = this.provisionalInvoiceList.find(a => a.ProvisionalReceiptNo == this.previousInvoiceNo);
  //   if (previousInvoiceInfo) {
  //     this.GetByReceiptNoFiscalYear(previousInvoiceInfo.ProvisionalReceiptNo, previousInvoiceInfo.FiscalYearId);
  //     // this.previousInvoiceNo = previousInvoiceInfo.ProvisionalReceiptNo - 1;
  //     // this.nextInvoiceNo = previousInvoiceInfo.ProvisionalReceiptNo + 1;
  //   } else {
  //     this.msgBoxServ.showMessage("failed", ["Unable to fetch duplicate bill details. Please select Valid From-Date and To-Date"]);
  //   }

  // }

  // //showing next invoice
  // ShowNextInvoice() {
  //   var nextInvoiceInfo = this.provisionalInvoiceList.find(a => a.ProvisionalReceiptNo == this.nextInvoiceNo);
  //   if (nextInvoiceInfo) {
  //     this.GetByReceiptNoFiscalYear(nextInvoiceInfo.ProvisionalReceiptNo, nextInvoiceInfo.FiscalYearId);
  //     // this.nextInvoiceNo = nextInvoiceInfo.ProvisionalReceiptNo + 1;
  //     // this.previousInvoiceNo = nextInvoiceInfo.ProvisionalReceiptNo - 1;
  //   } else {
  //     this.msgBoxServ.showMessage("failed", ["Unable to fetch duplicate bill details. Please select Valid From-Date and To-Date"]);
  //   }
  // }

  // public GetDoctorsList() {
  //   this.BillingBLService.GetDoctorsList()
  //     .subscribe(res => {
  //       if (res.Status == 'OK') {
  //         if (res.Results.length) {
  //           this.doctorsList = res.Results;
  //         }
  //         else {
  //           console.log(res.ErrorMessage);
  //         }
  //       }
  //     },
  //       err => {
  //         this.msgBoxServ.showMessage('Failed', ["unable to get Doctors list.. check log for more details."]);
  //         console.log(err.ErrorMessage);
  //       });
  // }
}
