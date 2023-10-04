import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as moment from 'moment/moment';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";

@Component({
  selector: 'phrm-expiry',
  templateUrl: "./phrm-expiry-report.html",
  styleUrls: ['./phrm-expiry-report.component.css']

})
export class PHRMExpiryReportComponent implements OnInit {

  /// Expiry  Report Columns variable
  PHRMExpiryReportColumns: Array<any> = null;
  /// Expiry Report Data variable 
  PHRMExpiryData: Array<any> = new Array<any>();
  ////Variable to Bind Item Name
  public ItemId: number = null;
  public selectedItem: any;
  storeList: any;
  public selectedStore: any = null;
  storeDetails: any;
  StoreId: number;
  fromDate: string;
  toDate: string;
  allItemList: any[] = [];
  public dateRange: string = "";
  public loading: boolean = false;
  isNearlyExpired: boolean = false;
  isExpired: boolean = false;
  NewPHRMExpiryData: any[] = [];

  constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService, public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef) {
    this.PHRMExpiryReportColumns = PHRMReportsGridColumns.PHRMExpiryReport;
    this.fromDate = moment().format("YYYY-MM-DD");
    this.toDate = moment().format("YYYY-MM-DD");
    //this.toDate = moment().add(1,'M').format("YYYY-MM-DD");
    this.GetItemList();
    this.GetActiveStore();
  }
  ngOnInit() {

  }
  ngAfterViewChecked() {
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }
  GetItemList() {
    this.pharmacyBLService.GetItemList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.allItemList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("Notice-Message", ["Failed to load item data."]);
        }
      }, () => {
        this.msgBoxServ.showMessage("Failed", ["Failed to load item data."]);
      });
  }
  gridExportOptions = {

    fileName: 'ExpiryReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };
  GetActiveStore() {
    this.pharmacyBLService.GetActiveStore()
      .subscribe(res => {
        if (res.Status == "OK")
          this.storeList = res.Results;
      });
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
    if (this.checkDateValidation()) {
      this.loading = true;
      this.storeDetails = this.selectedStore;
      this.StoreId = this.storeDetails == undefined ? null : this.storeDetails.StoreId;
      this.pharmacyBLService.GetExpiryReport(this.ItemId, this.StoreId, this.fromDate, this.toDate).finally(() => {
        this.loading = false;
      }).subscribe(res => {
        if (res.Status == 'OK' && res.Results.length > 0) {
          this.PHRMExpiryData = res.Results;
          this.NewPHRMExpiryData = res.Results;
          this.isNearlyExpired = false;
          this.isExpired = false;
        }
        if (res.Status == 'OK' && res.Results.length == 0) {
          this.PHRMExpiryData = null;
          this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
        }
        this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
      });
    }

  }
  ShowNearlyExpiredItem() {
    this.isExpired = false;
    let date = new Date();
    let datenow = moment(date.setMonth(date.getMonth() + 0)).format('YYYY-MM-DD');
    let datethreemonth = moment(date.setMonth(date.getMonth() + 3)).format('YYYY-MM-DD');
    if (this.isNearlyExpired == true) {
      this.PHRMExpiryData = this.NewPHRMExpiryData.filter(a => moment(a.ExpiryDate).format('YYYY-MM-DD') < datethreemonth && moment(a.ExpiryDate).format('YYYY-MM-DD') > datenow);
    } else {
      this.PHRMExpiryData = this.NewPHRMExpiryData;
    }
  }
  ShowExpiredItem() {
    this.isNearlyExpired = false;
    let date = new Date();
    let datenow = moment(date.setMonth(date.getMonth() + 0)).format('YYYY-MM-DD');
    if (this.isExpired == true) {
      this.PHRMExpiryData = this.NewPHRMExpiryData.filter(a => moment(a.ExpiryDate).format('YYYY-MM-DD') <= datenow);
    } else {
      this.PHRMExpiryData = this.NewPHRMExpiryData;
    }
  }
  checkDateValidation() {
    if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
      return true;
    } else {
      this.msgBoxServ.showMessage('failed', ['Please enter valid From date and To date']);
      return false;
    }
  }

  myItemListFormatter(data: any): string {
    let html = data["GenericName"] + " | " + data["ItemName"];
    return html;
  }


  onChangeItem($event) {
    try {
      if ($event.ItemId != null) {
        this.ItemId = this.selectedItem.ItemId;
      }
      else {
        this.ItemId = null;
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
        this.ItemId = null;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  ////on click grid export button we are catching in component an event.. 
  ////and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/api/PharmacyReport/ExportToExcelPHRMExpiryReport?ItemId=" + this.ItemId + "&FromDate=" + this.fromDate + "&ToDate=" + this.toDate)
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
  refreshDate() {
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
    this.changeDetector.detectChanges();
  }
}








