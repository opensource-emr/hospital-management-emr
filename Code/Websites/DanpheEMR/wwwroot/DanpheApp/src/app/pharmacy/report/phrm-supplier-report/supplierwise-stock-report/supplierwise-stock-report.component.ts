import { ChangeDetectorRef, Component } from "@angular/core";
import * as moment from "moment";
import { DispensaryService } from "../../../../dispensary/shared/dispensary.service";
import { GridEmitModel } from "../../../../shared/danphe-grid/grid-emit.model";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { DLService } from "../../../../shared/dl.service";
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";
import { PharmacyBLService } from "../../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../../shared/phrm-reports-grid-columns";

@Component({
  templateUrl: "./supplierwise-stock-report.component.html"
})
export class SupplierWiseStockReportComponent {
  SupplierWiseStockReportColumns: Array<any> = [];
  PHRMSupplierStockReportData: Array<any> = new Array<any>();
  public supplierId: number = null;
  public selectedSupplier: any;
  public supplierList: Array<any> = new Array<any>();
  public storeList: Array<any> = [];
  public itemList: Array<any> = new Array<any>();
  public selectedStore: any = null;
  public selectedItem: any;
  public itemId: number = null;
  public fromDate: string = moment().format("YYYY-MM-HH");
  public toDate: string = moment().format("YYYY-MM-HH");
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public footerContent = '';
  public dateRange: string = "";
  public loading: boolean = false;
  storeId: number;


  constructor(public pharmacyBLService: PharmacyBLService, private _dispensaryService: DispensaryService,
    public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef) {
    this.SupplierWiseStockReportColumns = PHRMReportsGridColumns.SupplierWiseStockReport;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("ExpiryDate", false));
    this.GetSupplierListDetails();
    this.GetAllPharmacyStores();
    this.getOnlyItemNameList();
  }



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
  GetAllPharmacyStores() {
    this._dispensaryService.GetAllPharmacyStores()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.storeList = res.Results;
        }
      })
  }
  public getOnlyItemNameList(): void {
    try {
      this.pharmacyBLService.getOnlyItemNameList()
        .subscribe(res => {
          this.itemList = res.Results;
        });
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  myItemListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }

  onChangeItem($event) {
    try {
      if ($event.ItemId > 0) {
        this.itemId = this.selectedItem.ItemId;
      }
      else {
        this.itemId = null;
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
        this.itemId = null;
      }
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
    this.loading = true;
    this.PHRMSupplierStockReportData = [];
    this.storeId = this.selectedStore ? this.selectedStore.StoreId : null;
    this.pharmacyBLService.getSupplierWiseStockReport(this.fromDate, this.toDate, this.itemId, this.storeId, this.supplierId)
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results.length > 0) {
          this.PHRMSupplierStockReportData = res.Results;
          this.changeDetector.detectChanges();
          //this.footerContent = document.getElementById("print_summary").innerHTML;
        }
        else if (res.Status == 'OK' && res.Results.length == 0) {
          this.msgBoxServ.showMessage("Notice-Message", ["No Data is Available for Selected Record"]);
        }
        else {
          console.log(res.ErrorMessage)
          this.msgBoxServ.showMessage("Failed", ["Cannot load data. Check console for details. "]);
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
  OnGridExport($event: GridEmitModel) {
  }
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }
}






