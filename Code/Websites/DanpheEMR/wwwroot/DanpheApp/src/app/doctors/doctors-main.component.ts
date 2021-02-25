import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service"
import { CoreService } from '../core/shared/core.service';
import { MessageboxService } from '../shared/messagebox/messagebox.service';
//import { SessionStorageService } from 'ngx-webstorage';
@Component({
  templateUrl: "./doctors-main.html" // "/DoctorsView/DashboardMain"
})


export class DoctorsMainComponent {
  public messageOfDayOpenCount: number = null;
  public messageDetail: any;
  validRoutes: any;
  public currentRoute: string;
  public ShowDocNab: boolean = false;
  constructor(public securityService: SecurityService,
    public coreService: CoreService,
    //private sessionSt: SessionStorageService,
    public msgBoxServ: MessageboxService,
    public router: Router) {
    //get the chld routes of doctors/PatientOverviewMain from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Doctors");
    this.GetMessageOfTheDay();

    router.events.filter(event => event instanceof NavigationEnd)
      .subscribe(evnt => {
        this.currentRoute = this.router.url;
        console.log(`new child route ${this.currentRoute}`);
        if (this.currentRoute == "/Doctors/OutPatientDoctor/NewPatient" || this.currentRoute == "/Doctors/OutPatientDoctor/OPDRecord" || this.currentRoute == "/Doctors/InPatientDepartment") {
          this.ShowDocNab = true;
        } else {
          this.ShowDocNab = false;
        }
      });
  }

  GetMessageOfTheDay() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Information/Message').ParameterValue;
    //this.messageOfDayOpenCount = this.sessionSt.retrieve('messageOfDayOpenCount');
    if (paramValue && !this.messageOfDayOpenCount) {
      //this.messageDetail = paramValue;
      this.messageDetail = null;
    }
    else
      this.msgBoxServ.showMessage("error", ["Please enter parameter values for Information or Message"]);
  }
  CloseMessageOfTheDay() {
    //this.sessionSt.store('messageOfDayOpenCount',1)
    this.messageDetail = null;
  }
}  
