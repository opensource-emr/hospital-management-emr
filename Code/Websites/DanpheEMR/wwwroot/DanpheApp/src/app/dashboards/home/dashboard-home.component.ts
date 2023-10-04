import { ChangeDetectorRef, Component } from '@angular/core'
import { DanpheChartsService } from '../../dashboards/shared/danphe-charts.service';
import { DLService } from "../../shared/dl.service";
import * as moment from 'moment/moment';
import { Observable } from 'rxjs';
import { CoreService } from '../../core/shared/core.service'
@Component({
  selector: 'my-app',
  templateUrl: "./dashboard-home.html"
})


export class DashboardHomeComponent {

  public dsbStats: any = "";
  public currentDate: string = "";
  public showCountryMap:boolean=true;
  constructor(public danpheCharts: DanpheChartsService, public dlService: DLService,public coreService: CoreService,public changeDetector: ChangeDetectorRef) {
    this.currentDate = moment().format("DD-MM-YYYY");
    this.showCountryMap=this.coreService.showCountryMapOnLandingPage;
  }

  ngOnInit() {

    this.LoadDsbStatistics();
    this.LoadPatientMap();
    this.LoadDepartmentAppts();
  }
  ngAfterViewChecked() {
    this.showCountryMap=this.coreService.showCountryMapOnLandingPage;
  }
  LoadDsbStatistics() {
    this.dlService.Read("/Reporting/HomeDashboardStats")
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.JsonData) {
          let parsedData = JSON.parse(res.Results.JsonData);
          if (parsedData && parsedData.length > 0) {
            this.dsbStats = parsedData[0];
            console.log(this.dsbStats);
          }
        }
        else {
          this.dsbStats = "";
        }
      },
        err => {
          alert(err.ErrorMessage);

        });
  }

  LoadPatientMap() {
    this.dlService.Read("/Reporting/PatientZoneMap")
      .map(res => res)
      .subscribe(res => {
        //console.log("---start: PatientZoneMap-----");
        //console.log(res);
        //console.log("---end: PatientZoneMap-----");

        let dataToParse: Array<any> = JSON.parse(res.Results.JsonData);
        let mapAreas = dataToParse.map(d => {
          return { id: d.MapAreaCode, value: d.PatientCount };
        });
        this.danpheCharts.Home_Map_PatientDistributionByZone("dvZoneWisePatientMap", mapAreas);

        //this.danpheCharts.Billing_Mix_MonthlyBilling("dvMonthlyBilling", dataToParse);
        //"[{"MapAreaCode":"NP-BA","PatientCount":5},{"MapAreaCode":"NP-BH","PatientCount":2},{"MapAreaCode":"NP-DH","PatientCount":0},{"MapAreaCode":"NP-GA","PatientCount":2},{"MapAreaCode":"NP-JA","PatientCount":2018},{"MapAreaCode":"NP-KA","PatientCount":0},{"MapAreaCode":"NP-KO","PatientCount":802},{"MapAreaCode":"NP-LU","PatientCount":0},{"MapAreaCode":"NP-MA","PatientCount":401},{"MapAreaCode":"NP-ME","PatientCount":1},{"MapAreaCode":"NP-NA","PatientCount":2},{"MapAreaCode":"NP-RA","PatientCount":0},{"MapAreaCode":"NP-SA","PatientCount":0},{"MapAreaCode":"NP-SE","PatientCount":400}]"
        //console.log("----LoadPatientMap----");
        // console.log(res);
      },
        err => {
          alert(err.ErrorMessage);

        });
  }

  LoadDepartmentAppts() {
    this.dlService.Read("/Reporting/DepartmentAppointmentsTotal")
      .map(res => res)
      .subscribe(res => {
        //sud:25sept'19--below line was giving issue because it doesn't get JsonData everytime.
        if (res.Results && res.Results.JsonData) {
          let dataToParse: Array<any> = JSON.parse(res.Results.JsonData);
          let formattedData = dataToParse.map(d => {
            return { department: d.DepartmentName, apptCount: d.AppointmentCount };
          });

          this.danpheCharts.Home_Pie_DepartmentWiseAppointmentCount("dvPieChart", formattedData);
        }

      },
        err => {
          alert(err.ErrorMessage);

        });
  }

}
