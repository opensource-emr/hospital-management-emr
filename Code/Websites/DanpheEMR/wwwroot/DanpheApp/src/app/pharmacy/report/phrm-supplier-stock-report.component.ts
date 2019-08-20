import { Component, Directive, ViewChild } from '@angular/core';
import { DLService } from "../../shared/dl.service"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../shared/phrm-reports-grid-columns";

@Component({
    selector: 'my-app',
    templateUrl: "../../view/pharmacy-view/Report/PHRMSupplierStock.html" // "/PharmacyReport/PHRMSupplierStock"
})
export class PHRMSupplierStockReportComponent {

    /// Supplier Stock  Report Columns variable
    PHRMSupplierStockReportColumns: Array<any> = null;
    /// Supplier Stock Report Data variable
    PHRMSupplierStockReportData: Array<any> = new Array<any>();
    ////Variable to Bind Supplier Name
  public SupplierName: string = "";
  public selectedSupplier: any;
  public supplierList: Array<any> = new Array<any>();

    constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService,
        public msgBoxServ: MessageboxService) {
      this.PHRMSupplierStockReportColumns = PHRMReportsGridColumns.PHRMSupplierStockReport;
      this.GetSupplierListDetails();
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
        this.pharmacyBLService.GetSupplierStockReport(this.SupplierName)
            .subscribe(res => {
                if (res.Status == 'OK' && res.Results.length > 0) {
                    ////Assign report Column from GridConstant to PHRMSupplierStockReportColumns
                    this.PHRMSupplierStockReportColumns = PHRMReportsGridColumns.PHRMSupplierStockReport;
                    ////Assign  Result to PHRMSupplierStockReportData
                    this.PHRMSupplierStockReportData = res.Results;
                    for (var i = 0; i < this.PHRMSupplierStockReportData.length; i++)
                    {
                        this.PHRMSupplierStockReportData[i].ExpiryDate = moment(this.PHRMSupplierStockReportData[i].ExpiryDate).format("YYYY-MM-DD");
                    }

                }
                if (res.Status == 'OK' && res.Results.length == 0) {
                    this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
                }

            });

    }

  mySupplierListFormatter(data: any): string {
    let html = data["SupplierName"];
    return html;
  }


  onChangeSupplier($event) {
    try {
      if ($event.SupplierName != null) {
        this.SupplierName = this.selectedSupplier.SupplierId;
      }
      else {
        this.SupplierName = null;
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
        this.SupplierName = null;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

    ////on click grid export button we are catching in component an event.. 
    ////and in that event we are calling the server excel export....
    OnGridExport($event: GridEmitModel) {
        this.dlService.ReadExcel("/PharmacyReport/ExportToExcelPHRMSupplierStockReport?SupplierName=" + this.SupplierName)
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
}






