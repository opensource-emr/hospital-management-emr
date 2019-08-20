import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { DanpheChartsService } from '../../dashboards/shared/danphe-charts.service';

@Component({
    templateUrl: "./inventory-dashboard.html"
})


export class InventoryDashboardComponent {

    constructor(public danpheCharts: DanpheChartsService) {

    }

    ngOnInit() {

        this.danpheCharts.Inventory_BarH_TrendingItems("dvInvTrendingItemsByConsumption");
        this.danpheCharts.Inventory_Pie_CatWiseCurrStockValue("dvInvCatWiseCurrStockValue");
        this.danpheCharts.Inventory_BarV_PurchaseVsConsumption("dvInvMthPurchaseVsConsumption");

    }
}