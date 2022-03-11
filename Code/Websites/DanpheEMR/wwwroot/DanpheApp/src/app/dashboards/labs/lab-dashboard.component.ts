import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { SecurityService } from '../../security/shared/security.service';
import { DanpheChartsService } from '../../dashboards/shared/danphe-charts.service';
import { DLService } from "../../shared/dl.service";
import { CoreService } from '../../core/shared/core.service';

@Component({
    templateUrl: "./lab-dashboard.html"
})

export class LabDashboardComponent {

    public stats:any="" ; // = new Object();
    public testname: string = null;
    public covidDetails= [];

    constructor(
        public danpheCharts: DanpheChartsService,
        public dlService: DLService,
        public securityService: SecurityService,
        public coreService: CoreService) {       
        var name = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() == 'common' && a.ParameterName == 'CovidTestName');
        if (name) {
            var paramValue = JSON.parse(name.ParameterValue);
            this.testname = paramValue.DisplayName;
        }    
        this.LoadCovidTestDetails();
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

    LoadCovidTestDetails(){
        this.dlService.Read("/Reporting/CovidDetailsForLab?testName=" + this.testname)
        .map(res => res)
        .subscribe(res => {
            if(res.Status == "OK"){
                this.covidDetails = res.Results;
            }else {
                console.log("hello")
            }
        },
        err => {
            alert(err.ErrorMessage);
        });
    }
}