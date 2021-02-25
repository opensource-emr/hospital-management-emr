import { ChangeDetectorRef, Component } from "@angular/core";
import { InventoryReportsBLService } from "../shared/inventory-reports.bl.service";
import { PHRMStoreModel } from '../../../pharmacy/shared/phrm-store.model';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { InventoryBLService } from "../../shared/inventory.bl.service";
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import * as moment from 'moment/moment';
import { CommonFunctions } from '../../../shared/common.functions';
import * as _ from 'lodash';
import { CoreService } from "../../../core/shared/core.service";
import { DLService } from "../../../shared/dl.service";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
@Component({
  selector: 'substore-dispatch-consumption',
  templateUrl: "../../../view/inventory-view/Reports/SubstoreConsumptionDispatch.html"
})

export class SubstoreConsumptionAndDispatchComponent {
  public showStoreList: boolean = true;
  public fromDate: string = null;
  public toDate: string = null;
  public preSelectedStores: Array<any> = new Array<any>();
  public storeList: Array<PHRMStoreModel> = new Array<PHRMStoreModel>();
  public SelectedStores: Array<any> = new Array<any>();
  public selectedIds: string = "";
  public itemId: string = "";
  public storeNames: string = "";
  public SubstoreDispConReportColumns: Array<any> = null;
  public SubstoreDispConReportData: Array<any> = new Array<any>();
  public filteredReportData: Array<any> = new Array<any>();
  public DetailsView: boolean = false;
  public ItemLevelDetailsColumn: Array<any> = null;
  public itemDetails = { ItemName: '', ItemCode: '', ItemType: '' };
  public ItemLevelData: Array<any> = new Array<any>();
  public totalDispatchValue: any;
  public totalConsumptionValue: any;
  public disQty: any;
  public conQty: any;
  public itemDispatchValue: any;
  public itemConsumedValue: any;
  public reportHeaderHtml: string = '';
  public dlService: DLService = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(public inventoryBLService: InventoryReportsBLService,
    public changedDetector: ChangeDetectorRef,
    public inventoryService: InventoryBLService,
    public reportServ: ReportingService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    _dlService: DLService,) {
    this.dlService = _dlService;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('TransactionDate', false));
    this.ShowStoreList();
  }

  Load() {
    if(this.selectedIds.length == 51){
      this.storeNames = "All Store";
    }
    this.inventoryBLService.GetDispatchAndConsumptionDetails(this.selectedIds, this.fromDate, this.toDate)
      .subscribe(res => {
        if (res) {
          this.Success(res);
        } else {
          this.Error(res);
        }
      });
  }

  Success(res) {
    this.reportHeaderHtml = "Substore Dispatch and Consumption Report from " + this.fromDate +" " +"to: " + this.toDate;
    if (res.Status = "OK" && res.Results.length >0) {
      this.SubstoreDispConReportColumns = this.reportServ.reportGridCols.SubstoreDispachNConsumptionReportCol;
      this.SubstoreDispConReportData = res.Results;
      this.filteredReportData = this.SubstoreDispConReportData;
      let grandTotal = CommonFunctions.getGrandTotalData(this.filteredReportData);
      this.totalDispatchValue = "Rs." + CommonFunctions.parseAmount(grandTotal[0].DispatchValue);
      this.totalConsumptionValue = "Rs." + CommonFunctions.parseAmount(grandTotal[0].ConsumptionValue);
      this.summary.TotalDispatchValue = this.totalDispatchValue;
      this.summary.TotalConsumptionValue = this.totalConsumptionValue;

    }else{
      this.msgBoxServ.showMessage("message", ["No data for selected dates"]);
    }
  }

  ShowStoreList() {
    this.inventoryBLService.ShowVendorList()
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.changedDetector.detectChanges();
          this.storeList = res.Results.filter(a => a.StoreId != 1);
          if (this.storeList.length > 0) {
            var preselectedStore = this.storeList.map(({ StoreId }) => StoreId).toString();
            if (preselectedStore.length > 0) {
              this.preSelectedStores.push(preselectedStore);
              this.selectedIds = preselectedStore;
              this.storeNames = this.SelectedStores.map(({ Name }) => Name).toString();
            }
          }
          this.showStoreList = true;
          // this.ShowStockLevelReport();                 
        }
      },
        err => this.Error(err));
  }

  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }

  onChange($event) {
    let x = $event;
    this.SelectedStores = $event;
    this.selectedIds = this.SelectedStores.map(({ StoreId }) => StoreId).toString();
    this.storeNames = this.SelectedStores.map(({ Name }) => Name).toString();
  }

  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
  }

  gridExportOptions = {
    fileName: 'SubStoreDispatchAndConsumptionReport' + moment().format('YYYY-MM-DD') + '.xls',
    displayColumns: ['SubCategoryName', 'ItemName', 'Unit', 'DispatchQuantity', 'ConsumptionQuantity', 'DispatchValue', 'ConsumptionValue']
  };

  public summary = new SummaryFields();

  SubStoreDispConGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        this.itemId = $event.Data.ItemId;
        this.itemDetails.ItemName = $event.Data.ItemName;
        this.itemDetails.ItemCode = $event.Data.Code;
        this.itemDetails.ItemType = $event.Data.ItemType;
        this.ItemLevelDetailsColumn = this.reportServ.reportGridCols.SubstoreDispConItemLevelDetails;
        let date = new Date();
        this.inventoryBLService.GetDetailsforDispConItems(this.selectedIds, this.itemId, this.fromDate, this.toDate)
          .subscribe(res => {
            if (res) {
              this.DetailsView = true;
              this.ItemLevelData = res.Results;
              if (this.ItemLevelData.length > 0) {
                let grandTotal = CommonFunctions.getGrandTotalData(this.ItemLevelData);
                this.itemDispatchValue =  grandTotal[0].DispatchValue;
                this.itemConsumedValue = grandTotal[0].ConsumptionValue;
                this.disQty = grandTotal[0].DispatchQuantity;
                this.conQty = grandTotal[0].ConsumptionQuantity;
              } else {
                this.DetailsView = false;
                this.msgBoxServ.showMessage("error", ["Data not available"]);
              }
            } else {
              this.Error(res);
            }
          });
        break;
      }
      default:
        break;
    }
  }

  ClosePopup() {
    this.DetailsView = false;
  }


  OnGridExport($event: GridEmitModel) {
    let jsonStrSummary = JSON.stringify(this.summary);//this.summary
    let summaryHeader = "Report Summary";
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelSubstoreDispConSummaryReport?FromDate="
        + this.fromDate + "&ToDate=" + this.toDate+ "&StoreIds=" +this.selectedIds+
        "&SummaryData=" + jsonStrSummary+"&SummaryHeader=" + summaryHeader)
        .map(res => res)
        .subscribe(data => {
            let blob = data;
            let a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "SubStoreDispatchAndConsumptionReport" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
            document.body.appendChild(a);
            a.click();
        },
            res => this.Error(res));
}
}

export class SummaryFields {
  TotalDispatchValue: number = 0;
  TotalConsumptionValue: number = 0;
}