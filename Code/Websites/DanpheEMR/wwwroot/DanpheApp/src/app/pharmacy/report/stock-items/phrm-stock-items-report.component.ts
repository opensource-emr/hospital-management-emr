import { Component, Directive, ViewChild } from '@angular/core';

import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";
import { CommonFunctions } from '../../../shared/common.functions';

@Component({
  templateUrl: "./phrm-stock-items-report.html"
})
export class PHRMStockItemsReportComponent {

  ///Stock Items Report Columns variable
  PHRMStockItemsReportColumns: Array<any> = null;
  ///Stock Items Report Data variable
  PHRMStockItemsReportData: Array<any> = new Array<any>();
  ////Item Name to Bind
  public ItemName: string = "";
  public itemList: Array<any> = new Array<any>();
  public selectedItem: any;
  public itemId: number = 0;
  public summary: any = { tot_Quantity: 0, tot_TotalAmount: 0 };

  public selectedLocation: number = 1;
  public pharmacy:string = "pharmacy";
  
  constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService,
    public msgBoxServ: MessageboxService) {
    this.PHRMStockItemsReportColumns = PHRMReportsGridColumns.PHRMStockItemsReport;
    this.GetItemsListDetails();
    this.GetReportData();
  }


  //////Export data grid options for excel file
  gridExportOptions = {
    fileName: 'StockItemsReport_' + moment().format('YYYY-MM-DD') + '.xls',
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
          this.itemList = this.itemList.reduce((acc, curr) => {
            if (!acc.find(item => item.ItemId == curr.ItemId)){ acc.push(curr); }
            return acc;
          }, []);
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
  onChangeItem($event) {
    try {
      if ($event.ItemId > 0) {
        this.itemId = this.selectedItem.ItemId;
      }
      else {
        this.itemId = 0;
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
        this.itemId = 0;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  myItemListFormatter(data: any): string {
    let html = data["ItemName"];//+ " |B.No.|" + data["BatchNo"] + " |M.R.P|" + data["MRP"];
    return html;
  }

  //////Function Call on Button Click of Report
  GetReportData() {
    this.pharmacyBLService.GetStockItemsReport(this.itemId, this.selectedLocation)
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results.length > 0) {
          ////Assign report Column from GridConstant to PHRMStockItemsReportColumns
          this.PHRMStockItemsReportColumns = PHRMReportsGridColumns.PHRMStockItemsReport;
          ////Assign  Result to PHRMStockItemsReportData
          this.PHRMStockItemsReportData = res.Results;
          this.PHRMStockItemsReportData.map(a => {
            a.ExpiryDate = moment(a.ExpiryDate).format("YYYY-MM-DD");
          })
          this.InitializeVariables();
          this.calculation();
        }
        if (res.Status == 'OK' && res.Results.length == 0) {
          this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
        }

      });

  }
  InitializeVariables() {
    //initializing every variable to zero
    this.summary.tot_Quantity = 0;
    this.summary.tot_TotalAmount = 0;
  }
  calculation() {
    this.PHRMStockItemsReportData.forEach(SumVariable => {
      this.summary.tot_Quantity += SumVariable.AvailableQuantity;
      this.summary.tot_TotalAmount += SumVariable.TotalAmount;

    });
    this.summary.tot_Quantity = CommonFunctions.parseAmount(this.summary.tot_Quantity);
    this.summary.tot_TotalAmount = CommonFunctions.parseAmount(this.summary.tot_TotalAmount);

  }






  ////on click grid export button we are catching in component an event.. 
  ////and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    let jsonStrSummary = JSON.stringify(this.summary);
    let summaryHeader = "Stock Items Report";
    this.dlService.ReadExcel("/PharmacyReport/ExportToExcelPHRMStockItemsReport?ItemId=" + this.itemId 
      + "&SummaryData=" + jsonStrSummary + "&SummaryHeader=" + summaryHeader)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "StockItemsReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
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






