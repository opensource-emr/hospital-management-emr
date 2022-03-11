import { Component } from '@angular/core';
import { SubstoreReportViewModel } from './substore-stock-report.model';
import { InventoryReportsBLService } from '../../shared/inventory-reports.bl.service';
import { Chart } from 'chart.js';
import { color } from 'html2canvas/dist/types/css/types/color';
import { CoreService } from '../../../../core/shared/core.service';

@Component({
  templateUrl: "./substore-stock.component.html"
})

export class SubstoreStockReportComponent {
  public loading: boolean = false;
  public FilterParameter: { Id: number; Name: string; isStore: boolean };
  public SearchSource: Array<{ Id: number; Name: string; isStore: boolean }> = [];
  public SubstoreStockReport: SubstoreReportViewModel;
  public myDoughnutChart;
  public myhorizontalChart;
  constructor(public inventoryBLService: InventoryReportsBLService, public coreService: CoreService) {
    this.Load(0, 0);
  }
  public Load(storeId, itemId) {
    this.loading = true;
    this.AssignFilterParameter(storeId, itemId);
    this.inventoryBLService.showSubstoreStockReport(storeId, itemId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.SubstoreStockReport = res.Results;
          if (storeId == 0 && itemId == 0) { this.FillSourceForSearch(); }
          this.CreateChart();
          this.loading = false;
        }
      });
  }
  private AssignFilterParameter(storeId: any, itemId: any) {
    if (storeId > 0) {
      this.FilterParameter = this.SearchSource.find(s => s.Id == storeId && s.isStore == true);
    }
    else {
      this.FilterParameter = this.SearchSource.find(s => s.Id == itemId && s.isStore == false);
    }
  }

  public FillSourceForSearch() {
    this.SearchSource = [];
    this.SubstoreStockReport.InventoryStoreTotal.forEach(a => { var Name = a.Name; var Id = a.StoreId; var isStore = true; this.SearchSource.push({ Name, Id, isStore }); })
    this.SubstoreStockReport.InventoryItemTotal.forEach(a => { var Name = a.ItemName; var Id = a.ItemId; var isStore = false; this.SearchSource.push({ Name, Id, isStore }); })
  }
  public Sort() {
    if (this.FilterParameter.isStore) {
      this.Load(this.FilterParameter.Id, 0)
    }
    else {
      this.Load(0, this.FilterParameter.Id);
    }
  }
  public ResetSort() {
    this.FilterParameter = null;
    this.Load(0, 0);
  }
  public CreateChart() {
    if (this.myDoughnutChart) { this.myDoughnutChart.destroy(); }
    if (this.myhorizontalChart) { this.myhorizontalChart.destroy(); }
    var DoughnutChartNameData = new Array<string>();
    var DoughnutChartQuantityData = new Array<number>();
    var BarChartNameData = new Array<string>();
    var BarChartQuantityData = new Array<number>();
    this.SubstoreStockReport.InventoryStoreTotal.forEach(a => {
      DoughnutChartNameData.push(a.Name);
      DoughnutChartQuantityData.push(a.TotalQuantity);
    })
    this.SubstoreStockReport.InventoryItemTotal.forEach(a => {
      BarChartNameData.push(a.ItemName);
      BarChartQuantityData.push(a.TotalQuantity);
    })
    this.myDoughnutChart = new Chart(document.getElementById("doughnut-for-Substore"), {
      type: 'doughnut',
      data: {
        labels: DoughnutChartNameData,
        datasets: [
          {
            label: "Quantity(Pcs)",
            backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
            data: DoughnutChartQuantityData
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: 'Stock Distribution in Store'
        }
      }
    });

    this.myhorizontalChart = new Chart(document.getElementById("bar-chart-horizontal-for-item"), {
      type: 'horizontalBar',
      data: {
        labels: BarChartNameData,
        datasets: [
          {
            label: "Quantity(Pcs)",
            backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
            data: BarChartQuantityData
          }
        ]
      },
      options: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Item Distribution'
        }
      }
    });
  }

  SearchListFormatter(data: any): string {
    return data["Name"];
  }
}
