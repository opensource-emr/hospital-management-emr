import { Component, Directive, ViewChild } from '@angular/core';
import { DLService } from "../../shared/dl.service"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../shared/phrm-reports-grid-columns";

@Component({
    selector: 'phrm-expiry',
    templateUrl: "../../view/pharmacy-view/Report/PHRMExpiryReport.html" //"/PharmacyReport/PHRMExpiryReport"
})
export class PHRMExpiryReportComponent {

    /// Expiry  Report Columns variable
    PHRMExpiryReportColumns: Array<any> = null;
    /// Expiry Report Data variable 
    PHRMExpiryData: Array<any> = new Array<any>();
    ////Variable to Bind Item Name
  public ItemName: string = "";
  public selectedItem: any;
  public itemList: Array<any> = new Array<any>();

    constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService,
        public msgBoxServ: MessageboxService) {
      this.PHRMExpiryReportColumns = PHRMReportsGridColumns.PHRMExpiryReport;
      this.GetItemsListDetails();
    }


    gridExportOptions = {

        fileName: 'ExpiryReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  public GetItemsListDetails(): void {
    try {
      this.pharmacyBLService.GetStockDetailsList()
        .subscribe(res => this.CallBackGetItemTypeList(res));
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  CallBackGetItemTypeList(res) {
    try {
      if (res.Status == 'OK') {
        if (res.Results) {
          this.itemList = new Array<any>();
          this.itemList = res.Results;
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

    //////Function Call on Button Click of Report
    GetReportData() {
        this.pharmacyBLService.GetExpiryReport(this.ItemName)
            .subscribe(res => {
                if (res.Status == 'OK' && res.Results.length > 0) {

                    this.PHRMExpiryReportColumns = PHRMReportsGridColumns.PHRMExpiryReport;

                    this.PHRMExpiryData = res.Results;
                    for (var i = 0; i < this.PHRMExpiryData.length; i++) {
                        this.PHRMExpiryData[i].ExpiryDate = moment(this.PHRMExpiryData[i].ExpiryDate).format("YYYY-MM-DD");
                    }

                }
                if (res.Status == 'OK' && res.Results.length == 0) {
                    this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
                }

            });

    }

  myItemListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }


  onChangeItem($event) {
    try {
      if ($event.ItemName != null) {
        this.ItemName = this.selectedItem.ItemId;
      }
      else {
        this.ItemName = null;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  CheckProperSelectedItem() {
    try {
      if ((typeof this.selectedItem !== 'object') || (typeof this.selectedItem === "undefined") || (typeof this.selectedItem === null)) {
        this.selectedItem = null;
        this.ItemName = null;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

    ////on click grid export button we are catching in component an event.. 
    ////and in that event we are calling the server excel export....
    OnGridExport($event: GridEmitModel) {
        this.dlService.ReadExcel("/PharmacyReport/ExportToExcelPHRMExpiryReport?ItemName=" + this.ItemName)
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "ExpiryReport" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
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








