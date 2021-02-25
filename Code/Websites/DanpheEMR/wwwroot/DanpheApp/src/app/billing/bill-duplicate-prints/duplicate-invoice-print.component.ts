import { Component } from '@angular/core';

import { BillingBLService } from '../shared/billing.bl.service';

import { BillingReceiptModel } from "../shared/billing-receipt.model";
import { BillingTransaction } from '../shared/billing-transaction.model';

import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';

import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { BillingService } from '../shared/billing.service';
import * as moment from 'moment/moment';
import { APIsByType } from '../../shared/search.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { DanpheLoadingInterceptor } from '../../shared/danphe-loader-intercepter/danphe-loading.services';
import { CoreService } from '../../core/shared/core.service';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../shared/danphe-grid/NepaliColGridSettingsModel';
import { ENUM_InvoiceType } from '../../shared/shared-enums';
@Component({
  selector: 'duplicate-invoice',
  templateUrl: './duplicate-invoice-print.html',
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: DanpheLoadingInterceptor,
    multi: true,
  }]
})

// App Component class
export class DuplicateInvoicePrintComponent {

  public invoice: BillingReceiptModel;
  public showReceipt: boolean = false;
  public transactionList: Array<BillingTransaction> = new Array<BillingTransaction>();
  public duplicateBillPrintGridColumns: Array<any> = null;
  public doctorsList: Array<any> = [];
  public showCustomDate: boolean = true;
  public showNormalReceipt: boolean = true;//sud: 20Aug'18--for DischargeReceipt
  public showInpatientReceipt: boolean = false; //sud: 20Aug'18--for DischargeReceipt

  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = null;
  previousInvoiceNo: any;
  nextInvoiceNo: any;
  public patGirdDataApi: string = "";
  searchText:string='';
  public enableServerSideSearch: boolean = false;

  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(
    public BillingBLService: BillingBLService,
    public msgBoxServ: MessageboxService, public billingService: BillingService, public coreService: CoreService) {
    this.dateRange = "last1Week";
    this.duplicateBillPrintGridColumns = GridColumnSettings.DuplicateInvoiceList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('TransactionDate',false));
    // this.GetInvoiceListForDuplicatebill(this.fromDate,this.toDate);
    this.GetDoctorsList();
    this.patGirdDataApi = APIsByType.BillingDuplicatePrint;
    this.getParamter();
    //this.GetInvoiceListForDuplicatebill();
  }
  // onDateChange($event) {
  //     this.fromDate = $event.fromDate;
  //     this.toDate = $event.toDate;
  //     if (this.fromDate != null && this.toDate != null) {
  //         this.GetInvoiceListForDuplicatebill(this.fromDate, this.toDate)
  //     }
  // }
  GetInvoiceListForDuplicatebill() {
    this.BillingBLService.GetInvoiceDetailsForDuplicatebill(this.fromDate, this.toDate)
      .subscribe(res => {
        this.transactionList = res.Results;
      });
  }

  getParamter(){
    let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "ServerSideSearchComponent").ParameterValue;
    var data= JSON.parse(parameterData);
    this.enableServerSideSearch = data["BillingDuplicatePrint"];
  }
  serverSearchTxt(searchTxt) {
    this.searchText = searchTxt;
    //this.GetInvoiceListForDuplicatebill(this.searchText);
}
  DuplicateBillPrintGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "showDetails":
        {
          var data = $event.Data;
          this.GetInvoiceByInvoiceNumNFiscalYear(data.InvoiceNumber, data.FiscalYearId, data.IsInsuranceBilling);
          this.previousInvoiceNo = data.InvoiceNumber - 1;
          this.nextInvoiceNo = data.InvoiceNumber + 1;
        }
        break;
      default:
        break;
    }
  }
  //showing Previous Invoice
  ShowPreviousInvoice() {
    var previousInvoiceInfo = this.transactionList.find(a => a.InvoiceNumber == this.previousInvoiceNo);
    if (previousInvoiceInfo) {
      this.GetInvoiceByInvoiceNumNFiscalYear(previousInvoiceInfo.InvoiceNumber, previousInvoiceInfo.FiscalYearId, previousInvoiceInfo.IsInsuranceBilling);
      this.previousInvoiceNo = previousInvoiceInfo.InvoiceNumber - 1;
      this.nextInvoiceNo = previousInvoiceInfo.InvoiceNumber + 1;
    } else {
      this.msgBoxServ.showMessage("failed", ["Unable to fetch duplicate bill details. Please select Valid From-Date and To-Date"]);
    }

  }

  //showing next invoice
  ShowNextInvoice() {
    var nextInvoiceInfo = this.transactionList.find(a => a.InvoiceNumber == this.nextInvoiceNo);
    if (nextInvoiceInfo) {
      this.GetInvoiceByInvoiceNumNFiscalYear(nextInvoiceInfo.InvoiceNumber, nextInvoiceInfo.FiscalYearId, nextInvoiceInfo.IsInsuranceBilling);
      this.nextInvoiceNo = nextInvoiceInfo.InvoiceNumber + 1;
      this.previousInvoiceNo = nextInvoiceInfo.InvoiceNumber - 1;
    } else {
      this.msgBoxServ.showMessage("failed", ["Unable to fetch duplicate bill details. Please select Valid From-Date and To-Date"]);
    }
  }

  GetInvoiceByInvoiceNumNFiscalYear(invoiceNo: number, fiscalYrId: number, isInsuranceBilling: boolean) {
    let getVisitInfo = false;
    this.BillingBLService.GetInvoiceByReceiptNo(invoiceNo, fiscalYrId, getVisitInfo, isInsuranceBilling)
      .subscribe(res => {
        if (res.Status == "OK") {

          this.invoice = BillingReceiptModel.GetReceiptForDuplicate(res.Results);



          if (isInsuranceBilling) {
            this.billingService.BillingFlow = 'insurance';
          }

          //start: sud: 20Aug'18 for Discharge Receipt <needs revision>
          if (this.invoice.ReceiptType == "ip-receipt" && this.billingService.ShowIPBillSeparately()) {
            this.showInpatientReceipt = true;
            this.showNormalReceipt = false;
            //if (this.invoice.tran InvoiceType != ENUM_InvoiceType.inpatientPartial) {
            //  this.showInpatientReceipt = true;
            //  this.showNormalReceipt = false;
            //}
            //else {
            //  this.showIPReceipt = false;
            //  this.showNormalReceipt = true;
            //}
          }
          else {
            this.showInpatientReceipt = false;
            this.showNormalReceipt = true;
          }
          //start: sud: 20Aug'18 <needs revision>
          for (let i = 0; i < this.invoice.BillingItems.length; i++) {
            if (this.invoice.BillingItems[i].RequestedBy) {
              //sometimes, when employee is InActive (disabled), we don't get that employee object in the list.
              let requestingDoctor = this.doctorsList.find(a => a.EmployeeId == this.invoice.BillingItems[i].RequestedBy);
              if (requestingDoctor) {
                this.invoice.BillingItems[i].RequestedByName = requestingDoctor.FullName;
              }
            }

          }

          //start: sud: 19Jul'19 -- for Insurance Txn Date--
          if (this.invoice.IsInsuranceBilling && this.ShowInsTransactionDate()) {
            //If instransactiondate is not found then set it back to BillingDate.
            this.invoice.BillingDate = this.invoice.InsTransactionDate || this.invoice.BillingDate;
          }
          //end: sud: 19Jul'19 -- for Insurance Txn Date--



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


  //start: sud: 19Jul'19 -- for Insurance Txn Date--
  ShowInsTransactionDate(): boolean {
    let retValue: boolean = false;

    //getting emergency name from the parameterized data
    let txnParam = this.coreService.Parameters.find(p => p.ParameterGroupName.toLowerCase() == "billing" && p.ParameterName.toLowerCase() == "showinstransactiondate");
    //let hospNameParam = this.coreService.Parameters.find(p => p.ParameterGroupName.toLowerCase() == "common" && p.ParameterName.toLowerCase() == "hospitalname");

    if (txnParam && txnParam.ParameterValue && txnParam.ParameterValue.toLowerCase() == "true") {
      retValue = true;
    }
    else {
      retValue = false;
    }

    return retValue;
  }
  //end: sud: 19Jul'19 -- for Insurance Txn Date--

  ShowGridView() {
    this.showReceipt = false;
    this.invoice = null;
  }

  public GetDoctorsList() {
    this.BillingBLService.GetDoctorsList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.doctorsList = res.Results;
          }
          else {
            console.log(res.ErrorMessage);
          }
        }
      },
        err => {
          this.msgBoxServ.showMessage('Failed', ["unable to get Doctors list.. check log for more details."]);
          console.log(err.ErrorMessage);
        });
  }

  onGridDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetInvoiceListForDuplicatebill()
      } else {
        this.msgBoxServ.showMessage("failed", ['Please enter valid From date and To date']);
      }
    }
  }

}
