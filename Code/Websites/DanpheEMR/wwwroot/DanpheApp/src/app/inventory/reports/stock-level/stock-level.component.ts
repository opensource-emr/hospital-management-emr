import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { StockLevelReport } from '../shared/stock-level-report.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';
import { InventoryReportsDLService } from '../shared/inventory-reports.dl.service';
import { ReportingService } from "../../../reporting/shared/reporting-service";

import * as moment from 'moment/moment';
import { InventoryBLService } from '../../shared/inventory.bl.service';
import { PHRMStoreModel } from '../../../pharmacy/shared/phrm-store.model';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { CommonFunctions } from '../../../shared/common.functions';
@Component({
  //selector: 'my-app',
  templateUrl: "../../../view/inventory-view/Reports/StockLevel.html"  //"/InventoryReports/StockLevel"

})
export class StockLevelComponent implements OnInit {

  public ItemName: string = null;
  public value: string = 'a';
  public CurrentStockLevel: StockLevelReport = new StockLevelReport();
  public ItemList: any[] = [];
  //public fromDate: string = null;
  //public toDate: string = null;
  public ItemId: number = 0;
  public filteredStockLevelReport: Array<any> = new Array<any>();

  StockLevelReportColumns: Array<any> = null;
  StockLevelReportData: Array<any> = new Array<any>();
  Totalvalue: any;

  public storeList: Array<PHRMStoreModel> = new Array<PHRMStoreModel>();
  SelectedStores: Array<any> = new Array<any>();
  public preSelectedStores:Array<any>= new Array<any>();
  selectedIds: string = "";
  public showStoreList:boolean=false;
  public DetailsView: boolean = false;
  public grdetails: Array<any> = new Array<any>();
  public itemDetails = {ItemName:'', ItemCode:'',ItemType:''};
  public selectedGRCategory:string="Consumables & Capital Goods";
  public summary ={ TotalQuantity:0,TotalStockValue:0 };
  public storeNames:string="";
  constructor(public inventoryBLService: InventoryReportsBLService,
    public inventoryDLService: InventoryReportsDLService,
    public inventoryService: InventoryBLService,
    public reportServ: ReportingService,
    public msgBoxServ: MessageboxService,public changedDetector:ChangeDetectorRef) {
    //this.fromDate = moment().format('YYYY-MM-DD');
    //this.toDate = moment().format('YYYY-MM-DD');
    this.showStoreList=false;
    this.ShowStoreList();
  }

  ngOnInit() {
    // this.LoadItemList();
    //this.ShowStockLevelReport();
  }

  gridExportOptions = {
    fileName: 'CurrentStockLevelList' + moment().format('YYYY-MM-DD') + '.xls',
    // displayColumns: ['Date', 'Patient_Name', 'AppointmentType', 'Doctor_Name', 'AppointmentStatus']
  };

  //used to format display item in ng-autocomplete
  public myListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }

  LoadItemList(): void {
    this.inventoryService.GetItemList()
      .subscribe(
        res =>
          this.CallBackGetItemList(res));
  }
  ShowStoreList() {
    this.inventoryBLService.ShowVendorList()
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {    
          this.changedDetector.detectChanges();      
          this.storeList = res.Results;
          if(this.storeList.length >0){
            var preselectedStore=this.storeList.filter(s=> s.Name=="Main Store");
            if(preselectedStore.length >0){
              this.preSelectedStores.push(preselectedStore[0]); 
              this.SelectedStores =this.preSelectedStores;
              this.selectedIds = this.SelectedStores.map(({ StoreId }) => StoreId).toString();       
              this.storeNames = this.SelectedStores.map(({ Name }) => Name).toString();       
            }
          }
          this.showStoreList=true;          
          this.ShowStockLevelReport();                 
        }
      },
        err => this.Error(err));
  }
  onChange($event) {
    let x = $event;
    this.SelectedStores = $event;
    this.selectedIds = this.SelectedStores.map(({ StoreId }) => StoreId).toString();
    this.storeNames = this.SelectedStores.map(({ Name }) => Name).toString();   
    this.filteredStockLevelReport = new Array<StockLevelReport>();
    this.summary.TotalQuantity = 0;
    this.summary.TotalStockValue = 0;  

  }
  CallBackGetItemList(res) {
    if (res.Status == 'OK') {
      this.ItemList = [];
      if (res && res.Results) {
        res.Results.forEach(a => {
          this.ItemList.push({
            "ItemId": a.ItemId, "ItemName": a.ItemName, StandardRate: a.StandardRate, VAT: a.VAT
          });
        });

      }

    }
    else {
      err => {
        this.msgBoxServ.showMessage("failed", ['failed to get Item.. please check log for details.']);

      }
    }
  }
  SelectItemFromSearchBox(Item) {
    this.CurrentStockLevel.ItemId = Item.ItemId;
  }

  ShowStockLevelReport() {
    this.StockLevelReportData=  new Array<StockLevelReport>();
    if (this.selectedIds != "") {
      this.inventoryBLService.ShowStockLevelReportDataByItemId(this.selectedIds)
        .map(res => res)
        .subscribe(res => this.Success(res),
          res => this.Error(res));
    }
    else {
      this.msgBoxServ.showMessage("Warn", ['Please select Store']);
    }

  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }
  Success(res) {
    if (res.Status == "OK") {
      var value = null;
      this.StockLevelReportColumns = this.reportServ.reportGridCols.CurrentStockLevelReport;
      this.StockLevelReportData = res.Results;
      this.filteredStockLevelReport = this.StockLevelReportData;      
      var category =  this.selectedGRCategory;
      this.filteredStockLevelReport = (category !="Consumables & Capital Goods") ? this.StockLevelReportData.filter(s => s.ItemType == category) : this.StockLevelReportData;     

      if (this.filteredStockLevelReport.length > 0) {
        this.Totalvalue = this.filteredStockLevelReport.map(c => c.StockValue).reduce((sum, current) => sum + current);
        let grandTotal =CommonFunctions.getGrandTotalData(this.filteredStockLevelReport);
        this.summary.TotalQuantity = grandTotal[0].AvailableQuantity;
        this.summary.TotalStockValue = grandTotal[0].StockValue;
      }
      else {
        this.msgBoxServ.showMessage("notice-message", ['Data is Not Available '])
      }

    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }

  LoadStockLevelReportByStatus(value: string) {
    this.filteredStockLevelReport = new Array<StockLevelReport>();
    this.selectedGRCategory ="";
    if (this.value == 'b') {
      this.selectedGRCategory = "Capital Goods";
      this.filteredStockLevelReport = this.StockLevelReportData.filter(s => s.ItemType == 'Capital Goods');
      if (this.filteredStockLevelReport.length > 0) {
        this.Totalvalue = this.filteredStockLevelReport.map(c => c.TotalValue).reduce((sum, current) => sum + current);
      }
    }
    if (this.value == 'c') {
      this.selectedGRCategory = "Consumables";
      this.filteredStockLevelReport = this.StockLevelReportData.filter(s => s.ItemType == 'Consumables');
      if (this.filteredStockLevelReport.length > 0) {
        this.Totalvalue = this.filteredStockLevelReport.map(c => c.TotalValue).reduce((sum, current) => sum + current);
      }
    }
    if (this.value == 'a') {
      this.selectedGRCategory = "Consumables & Capital Goods";
      this.filteredStockLevelReport = this.StockLevelReportData;
      if (this.filteredStockLevelReport.length > 0) {
        this.Totalvalue = this.filteredStockLevelReport.map(c => c.TotalValue).reduce((sum, current) => sum + current);
      }
    }
    let grandTotal =CommonFunctions.getGrandTotalData(this.filteredStockLevelReport);
    this.summary.TotalQuantity = grandTotal[0].AvailableQuantity;
    this.summary.TotalStockValue = grandTotal[0].StockValue;
  }
  //loadReport() {
  //  if (this.fromDate && this.toDate) {
  //    this.filteredStockLevelReport = [];
  //    this.StockLevelReportData.forEach(rep => {
  //      let selrepDate = moment(rep.CreatedOn).format('YYYY-MM-DD');
  //      let isGreaterThanFrom = selrepDate >= moment(this.fromDate).format('YYYY-MM-DD');
  //      let isSmallerThanTo = selrepDate <= moment(this.toDate).format('YYYY-MM-DD')
  //      if (isGreaterThanFrom && isSmallerThanTo) {
  //        this.filteredStockLevelReport.push(rep);
  //      }
  //    });
  //    if (!this.filteredStockLevelReport.length) {
  //      this.msgBoxServ.showMessage("Note:", ["There are no stock available for this date"]);
  //    }
  //  }
  //  else {
  //    this.filteredStockLevelReport = this.StockLevelReportData;
  //  }

  //}
  StockLevelGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        this.DetailsView = true;
        this.itemDetails.ItemName = $event.Data.ItemName;
        this.itemDetails.ItemCode = $event.Data.Code;
        this.itemDetails.ItemType = $event.Data.ItemType;
        this.GetItemDetails($event.Data.StoreIds,$event.Data.ItemId);
        break;
      }
      default:
        break;
    }
  }
  ClosePopup() {
    this.DetailsView = false;
  }
  GetItemDetails(selectedIds,itemId) {
    if (itemId > 0 || itemId != null) {
      this.inventoryBLService.GetItemDetailsByIds(selectedIds,itemId)
        .map(res => res)
        .subscribe(res => {
          if (res.Status == "OK") {
            console.log(res.Results)
            this.grdetails = res.Results;
          }
        },
          err => this.Error(err));
    }
  }
}
