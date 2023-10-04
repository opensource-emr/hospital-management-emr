import { ChangeDetectorRef, Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import * as moment from 'moment';
import { CoreService } from '../../core/shared/core.service';
import { DLService } from '../../shared/dl.service';
import { DanpheChartsService } from '../../dashboards/shared/danphe-charts.service';
import { ActivateInventoryService } from '../../shared/activate-inventory/activate-inventory.service';
import { CommonFunctions } from '../../shared/common.functions';

@Component({
  templateUrl: "./inventory-dashboard.html"
})


export class InventoryDashboardComponent {

  public dsbStats: any = "";
  public currentDate: string = "";
  public showCountryMap: boolean = true;
  public activeInventoryId: number = null;
  public IsInvDashbordEnabled: boolean = false;
  FromDate: string = null;
  ToDate: string = null;
  InventoryDashboardStatisticsData: InventoryDashboardStatistics = new InventoryDashboardStatistics();
  totalDispatchValue: number = 0;
  totalStockValue: number = 0;
  constructor(public danpheCharts: DanpheChartsService, public dlService: DLService, public coreService: CoreService, public changeDetector: ChangeDetectorRef, private _activateInventoryService: ActivateInventoryService) {
    this.FromDate = moment().subtract(7, 'd').format("DD-MM-YYYY");
    this.ToDate = moment().format("DD-MM-YYYY");
    this.showCountryMap = this.coreService.showCountryMapOnLandingPage;
    this.activeInventoryId = _activateInventoryService.activeInventory.StoreId;
  }

  ngOnInit() {

    // this.LoadDsbStatistics();
    // this.LoadDepartmentAppts();
    // this.LoadMonthlyWiseAppts();
    // this.LoadSubcategoryAppts();
    this.GetParameter();
    this.LoadInventoryDashboardStatistics();
    this.LoadSubcategoryInventoryStockValue();
    this.LoadMonthlyWiseTransactions();
  }

  public GetParameter() {

    let param = this.coreService.Parameters.find(a => a.ParameterGroupName === 'Common' && a.ParameterName === 'ModulesDashboardDisplaySettings');

    if (param) {

      let obj = JSON.parse(param.ParameterValue);
      this.IsInvDashbordEnabled = obj ? obj.Inventory : false;
    }

  }
  ngAfterViewChecked() {
    this.showCountryMap = this.coreService.showCountryMapOnLandingPage;
  }
  LoadDsbStatistics() {
    this.dlService.Read("/Reporting/HomeInvDashboardStats?SourceStoreId=" + this.activeInventoryId)
      .map(res => res)
      .subscribe(res => {
        if (res.Results) {
          let parsedData = res.Results;
          if (parsedData && parsedData.length > 0) {
            this.dsbStats = parsedData[0];
            console.log(this.dsbStats);
          }
        }
        else {
          this.dsbStats = "";
        }
      });
  }
  LoadDepartmentAppts() {
    this.dlService.Read("/Reporting/DepartmentWiseConsumerItems?SourceStoreId=" + this.activeInventoryId)
      .map(res => res)
      .subscribe(res => {
        if (res.Results) {
          let dataToParse: Array<any> = res.Results;
          let formattedData = dataToParse.map(d => {
            return { department: d.Name, consumerstock: d.DispatchedQuantity };
          });

          this.danpheCharts.Inventory_Pie_Catdepartmentwiseconsumeritems("dvdepPieChart", formattedData);
        }

      });
  }
  LoadMonthlyWiseAppts() {
    this.dlService.Read("/Reporting/MonthlyWisePurchaseOrdervsGoodsReceiptValue?SourceStoreId=" + this.activeInventoryId)
      .map(res => res)
      .subscribe(res => {
        if (res.Results) {
          let dataToParse: Array<any> = res.Results;
          let formattedData = dataToParse.map(d => {
            return { monthdate: d.TxnDisplayDate, purchasevalue: d.PurchaseValue, goodsReceiptvalue: d.GoodsReceiptValue, goodsarrivalvalue: d.GoodsArrivalValue };
          });

          this.danpheCharts.Inventory_BarV_MonthlyWisePurchaseOrdervsGoodsReceiptValue("dvInvMthPurchaseVsConsumption", formattedData);
        }

      });
  }
  LoadSubcategoryAppts() {
    this.dlService.Read("/Reporting/SubCategoryWiseInventoryStockValue?SourceStoreId=" + this.activeInventoryId)
      .map(res => res)
      .subscribe(res => {
        if (res.Results) {
          let dataToParse: Array<any> = res.Results;
          let formattedData = dataToParse.map(d => {
            return { subcategoryname: d.SubCategoryName, stock: d.AvailableQuantity };
          });

          this.danpheCharts.Inventory_Pie_subcategorywiseinventorystockvalue("dvsubcategoryPieChart", formattedData);
        }

      });
  }


  // * Laod All Inventory Dashboard Statics | Rohit
  LoadInventoryDashboardStatistics() {
    this.dlService.Read(`/Reporting/InventoryDashboardStatistics?SourceStoreId=${this.activeInventoryId}`)
      .map(res => res)
      .subscribe(res => {
        if (res.Results) {
          let parsedData = res.Results;
          if (parsedData && parsedData.length > 0) {
            this.InventoryDashboardStatisticsData = parsedData[0];
          }
        }
        else {
          this.InventoryDashboardStatisticsData = new InventoryDashboardStatistics();
        }
      });
  }

  // * Get All Storewise Dispatch Value | Rohit
  GetAllStorewiseDispatchValue() {
    this.dlService.Read(`/Reporting/DepertmentwiseDispatchedValue?SourceStoreId=${this.activeInventoryId}&&FromDate=${this.FromDate}&ToDate=${this.ToDate}`)
      .map(res => res)
      .subscribe(res => {
        if (res.Results) {
          let dataToParse: Array<any> = res.Results;
          let formattedData = dataToParse.map(d => {
            return { department: d.Name, consumervalue: d.TotalDispatchValue };
          });
          this.danpheCharts.Inventory_Pie_ChartDepartmentwiseStockAndValue("dvdepPieChart", formattedData);
          this.totalDispatchValue = CommonFunctions.parsePhrmAmount(dataToParse.reduce((a, b) => a + b.TotalDispatchValue, 0));
        }
      });
  }

  // * Get All SubCategory Wise Inventory Stock Value | Rohit
  LoadSubcategoryInventoryStockValue() {
    this.dlService.Read(`/Reporting/GetSubCategoryWiseInventoryStockValue?SourceStoreId=${this.activeInventoryId}`)
      .map(res => res)
      .subscribe(res => {
        if (res.Results) {
          let dataToParse: Array<any> = res.Results;
          let formattedData = dataToParse.map(d => {
            return { subcategoryname: d.SubCategoryName, stockvalue: d.TotalStockValue };
          });
          this.danpheCharts.Inventory_Pie_SubCategoryWiseStockValue("dvsubcategoryPieChart", formattedData);
          this.totalStockValue = CommonFunctions.parsePhrmAmount(dataToParse.reduce((a, b) => a + b.TotalStockValue, 0));
        }
      });
  }

  // * Get All Purchase Order, GoodReceipt and Dispatch Value | Rohit
  LoadMonthlyWiseTransactions() {
    this.dlService.Read("/Reporting/MonthlyWiseTransaction?SourceStoreId=" + this.activeInventoryId)
      .map(res => res)
      .subscribe(res => {
        if (res.Results) {
          let dataToParse: Array<any> = res.Results;
          let formattedData = dataToParse.map(d => {
            return { monthdate: d.TxnDisplayDate, purchasevalue: d.PurchaseValue, goodsReceiptvalue: d.GoodsReceiptValue, dispatchvalue: d.TotalDispatchValue };
          });

          this.danpheCharts.Inventory_MonthlyWiseTransaction("dvInvMthPurchaseVsConsumption", formattedData);
        }

      });
  }
  OnFromToDateChange($event) {
    if ($event) {
      this.FromDate = $event.fromDate;
      this.ToDate = $event.toDate;
      this.GetAllStorewiseDispatchValue();
    }

  }
}
export class InventoryDashboardStatistics {
  TotalPurchaseRequestQuantity: number = 0;
  TotalPurchaseRequestQuantityToday: number = 0;
  TotalPurchaseRequestQuantityYesterday: number = 0;
  TotalPurchaseOrderQuantity: number = 0;
  TotalPurchaseOrderQuantityToday: number = 0;
  TotalPurchaseOrderQuantityYesterday: number = 0;
  TotalGoodReceiptQuantity: number = 0;
  TotalGoodReceiptQuantityToday: number = 0;
  TotalGoodReceiptQuantityYesterday: number = 0;
  TotalDispatchQuantity: number = 0;
  TotalDispatchQuantityToday: number = 0;
  TotalDispatchQuantityYesterday: number = 0;
}

