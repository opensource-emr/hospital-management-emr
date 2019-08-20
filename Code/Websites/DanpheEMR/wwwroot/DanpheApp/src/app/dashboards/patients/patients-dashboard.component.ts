import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { DanpheChartsService } from '../../dashboards/shared/danphe-charts.service';
import { DLService } from "../../shared/dl.service";


@Component({
    templateUrl: "./patients-dashboard.html"
})


export class PatientsDashboardComponent {

    constructor(public danpheCharts: DanpheChartsService, public dlService: DLService) {

    }

    ngOnInit() {



        this.LoadGenderWisePieChart();
        this.LoadPatientAgeRangeNGender();
    }

    LoadGenderWisePieChart() {
        this.dlService.Read("/Reporting/PatientGenderWise")
            .map(res => res)
            .subscribe(res => {
                console.log("---start: patient gender wise-----");
                console.log(res);
                console.log("---end: patient gender wise-----");
                if (res.Results && res.Results.JsonData) {
                    let dataToParse = JSON.parse(res.Results.JsonData);
                    this.danpheCharts.Patient_Pie_GenderWise("dvPatientsGenderWise", dataToParse);
                }
            },
            err => {
                alert(err.ErrorMessage);

            });

    }

    LoadPatientAgeRangeNGender() {
        this.dlService.Read("/Reporting/PatientAgeRangeNGenderWise")
            .map(res => res)
            .subscribe(res => {
                console.log("---start: patient age wise-----");
                console.log(res);
                console.log("---end: patient age wise-----");
                if (res.Results && res.Results.JsonData) {
                    let dataToParse = JSON.parse(res.Results.JsonData);
                    this.danpheCharts.Patient_Bar_AgeWise("dvPatientsAgeWise", dataToParse);
                }
            },
            err => {
                alert(err.ErrorMessage);

            });

    }
}