import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { DanpheChartsService } from '../../dashboards/shared/danphe-charts.service';
import { DLService } from "../../shared/dl.service";

@Component({
    templateUrl: "./lab-dashboard.html"
})

export class LabDashboardComponent {

    public stats:any="" ; // = new Object();

    constructor(
        public danpheCharts: DanpheChartsService,
        public dlService: DLService) {
    }
    ngOnInit() {
        this.LoadDashboard();
    }
    //it will call sp and load graphs for dashboard
    LoadDashboard() {
        this.dlService.Read("/Reporting/LabDashboard")
            .map(res => res)
            .subscribe(res => {
                if (res.Status == "OK") {
                    let dashboardStats = JSON.parse(res.Results.JsonData);
                    this.stats = dashboardStats.LabelData[0];
                    let dataLabTrends = dashboardStats.TestTrendsData;
                    let dataLabCompleted = dashboardStats.TestCompletedData;
                    this.danpheCharts.Lab_Bar_TestTrends("dvLabTestTrends", dataLabTrends);
                    this.danpheCharts.Lab_Bar_TestCompleted("dvLabTestCompleted", dataLabCompleted);
                }
            },
            err => {
                alert(err.ErrorMessage);
            });
    }
}