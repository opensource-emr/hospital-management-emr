import { ChangeDetectorRef, Component, Directive, ViewChild } from '@angular/core';
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./supplierwise-purchase-report.html"
})
export class SupplierWisePurchaseReportComponent {

  /// Supplier Stock  Report Columns variable
  SupplierWisePurchaseReport: Array<any> = null;
  /// Supplier Stock Report Data variable
  SupplierWisePurchaseReportData: Array<any> = new Array<any>();
  ////Variable to Bind Supplier Name
  public supplierId: number;
  public selectedSupplier: any;
  public supplierList: Array<any> = new Array<any>();

  public fromDate: string = moment().format("YYYY-MM-HH");
  public toDate: string = moment().format("YYYY-MM-HH");
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  grandTotalVATAmount: number;
  grandTotalAmount: number;
  public footerContent = '';
  public dateRange: string = "";
  loading: boolean;


  constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService,
    public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef) {
    this.SupplierWisePurchaseReport = PHRMReportsGridColumns.SupplierWisePurchaseReport;
    this.GetSupplierListDetails();
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("GoodReceiptDate", false));
  }


  //////Export data grid options for excel file
  gridExportOptions = {
    fileName: 'SupplierWisePurchaseReport' + moment().format('YYYY-MM-DD') + '.xls',
  };

  public GetSupplierListDetails(): void {
    try {
      this.pharmacyBLService.GetSupplierList()
        .subscribe(res => this.CallBackGetSupplierTypeList(res));
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  CallBackGetSupplierTypeList(res) {
    try {
      if (res.Status == 'OK') {
        if (res.Results) {
          this.supplierList = new Array<any>();
          this.supplierList = res.Results;
          // this.SetFocusById('supplierName');
        }
      }
      else {
        err => {
          this.msgBoxServ.showMessage("failed", ['failed to get items..']);
        }
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }

  ////Function Call on Button Click of Report
  //Here, we are using same API of DateWisePurchase Report as both report returns the same data;--ramesh/rohit 
  GetReportData() {
    this.loading = true;
    this.pharmacyBLService.GetDateWisePurchaseReport(this.fromDate, this.toDate, this.supplierId)
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results.length > 0) {
          ////Assign report Column from GridConstant to PHRMSupplierStockReportColumns
          this.SupplierWisePurchaseReport = PHRMReportsGridColumns.SupplierWisePurchaseReport;
          ////Assign  Result to PHRMSupplierStockReportData
          this.SupplierWisePurchaseReportData = res.Results;
          this.grandTotalVATAmount = this.SupplierWisePurchaseReportData.reduce((a, b) => a + b.VATAmount, 0);
          this.grandTotalAmount = this.SupplierWisePurchaseReportData.reduce((a, b) => a + b.TotalAmount, 0);
          for (var i = 0; i < this.SupplierWisePurchaseReportData.length; i++) {
            this.SupplierWisePurchaseReportData[i].ExpiryDate = moment(this.SupplierWisePurchaseReportData[i].ExpiryDate).format("YYYY-MM-DD");
          }
          this.changeDetector.detectChanges();
          this.footerContent = document.getElementById("print_summary").innerHTML;

        }
        if (res.Status == 'OK' && res.Results.length == 0) {
          this.SupplierWisePurchaseReportData = null;
          this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
        }
        this.loading = false;

      });
  }

  mySupplierListFormatter(data: any): string {
    let html = data["SupplierName"];
    return html;
  }


  onChangeSupplier($event) {
    try {
      if ($event.SupplierId != null) {
        this.supplierId = $event.SupplierId;
      }
      else {
        this.supplierId = null;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  CheckProperSelectedSupplier() {
    try {
      if ((typeof this.selectedSupplier !== 'object') || (typeof this.selectedSupplier === "undefined") || (typeof this.selectedSupplier === null)) {
        this.selectedSupplier = null;
        this.supplierId = null;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }
  SetFocusById(id: string) {
    var Timer = setTimeout(() => {
      if (document.getElementById(id)) {
        let nextEl = <HTMLInputElement>document.getElementById(id);
        nextEl.focus();
        nextEl.select();
        clearTimeout(Timer);
      }
    }, 100)
  }
}






