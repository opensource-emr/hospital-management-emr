import { Component } from '@angular/core';

import { BillingBLService } from '../../shared/billing.bl.service';

import { BillingDeposit } from "../../shared/billing-deposit.model";

import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';

import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { BillingReceiptModel } from '../../shared/billing-receipt.model';
import { APIsByType } from '../../../shared/search.service';
import { CoreService } from '../../../core/shared/core.service';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: './duplicate-provisional-list.html'
})

// App Component class
export class BIL_DuplicatePrint_ProvisionalListComponent {

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
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('LastBillDate', true));

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
          this.showReceipt = true;
          //this.GetByReceiptNoFiscalYear(data.ProvisionalReceiptNo, data.FiscalYearId);
        }
        break;
      default:
        break;
    }
  }

  CloseProvisionalSlip() {
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

  DuplicatePrintCallBack(data){
    if(data.Close == "close"){
      this.showReceipt = false;
    }
  }
}
