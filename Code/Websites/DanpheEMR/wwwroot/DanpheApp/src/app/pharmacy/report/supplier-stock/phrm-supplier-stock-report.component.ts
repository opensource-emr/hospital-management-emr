import { ChangeDetectorRef, Component, Directive, ViewChild } from '@angular/core';
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./phrm-supplier-stock-report.html"
})
export class PHRMSupplierStockReportComponent {

  /// Supplier Stock  Report Columns variable
  PHRMSupplierStockReportColumns: Array<any> = [];
  /// Supplier Stock Report Data variable
  PHRMSupplierStockReportData: Array<any> = new Array<any>();
  ////Variable to Bind Supplier Name
  public supplierId: string = "";
  public selectedSupplier: any;
  public supplierList: Array<any> = new Array<any>();

  public fromDate: string = moment().format("YYYY-MM-HH");
  public toDate: string = moment().format("YYYY-MM-HH");
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  grandTotalVATAmount: number;
  grandTotalAmount: number;
  public footerContent = '';
  public dateRange: string = "";
  public loading: boolean = false;


  constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService,
    public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef) {
    this.PHRMSupplierStockReportColumns = PHRMReportsGridColumns.PHRMSupplierStockReport;
    this.GetSupplierListDetails();
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("GoodReceiptDate", false));
  }


  //////Export data grid options for excel file
  gridExportOptions = {
    fileName: 'SupplierStockReport_' + moment().format('YYYY-MM-DD') + '.xls',
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
          this.SetFocusById('supplierName');
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
  GetReportData() {
    if (this.supplierId == null || this.supplierId == "") {
      this.msgBoxServ.showMessage("Notice-message", ["Please select a supplier"]);
      return;
    }
    else {
      this.loading = true;
      this.PHRMSupplierStockReportData = [];
      this.pharmacyBLService.GetSupplierStockReport(this.fromDate, this.toDate, this.supplierId)
        .subscribe(res => {
          if (res.Status == 'OK' && res.Results.length > 0) {
            ////Assign  Result to PHRMSupplierStockReportData
            this.PHRMSupplierStockReportData = res.Results;
            this.grandTotalVATAmount = this.PHRMSupplierStockReportData.reduce((a, b) => a + b.VATAmount, 0);
            this.grandTotalAmount = this.PHRMSupplierStockReportData.reduce((a, b) => a + b.TotalAmount, 0);
            for (var i = 0; i < this.PHRMSupplierStockReportData.length; i++) {
              this.PHRMSupplierStockReportData[i].ExpiryDate = moment(this.PHRMSupplierStockReportData[i].ExpiryDate).format("YYYY-MM-DD");
            }
            this.changeDetector.detectChanges();
            this.footerContent = document.getElementById("print_summary").innerHTML;

          }
          else {
            this.msgBoxServ.showMessage("Notice-Message", ["No Data is Available for Selected Record"]);
          }
        },
          err => {
            console.log(err);
            this.msgBoxServ.showMessage("Failed", ["Failed to load data. Check console."])
          });
      this.loading = false;
    }
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

  ////on click grid export button we are catching in component an event.. 
  ////and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel(`/PharmacyReport/ExportToExcelPHRMSupplierStockReport?FromDate=${this.fromDate}&ToDate=${this.toDate}&SupplierId=${this.supplierId}`)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "SupplierStockReport" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },

        res => this.ErrorMsg(res));
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






