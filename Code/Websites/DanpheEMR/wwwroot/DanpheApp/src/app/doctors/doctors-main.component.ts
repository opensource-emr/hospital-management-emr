import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service"
import { CoreService } from '../core/shared/core.service';
import { MessageboxService } from '../shared/messagebox/messagebox.service';
import { DanpheCache, MasterType } from '../shared/danphe-cache-service-utility/cache-services';
//import { SessionStorageService } from 'ngx-webstorage';
@Component({
    templateUrl: "./doctors-main.html" // "/DoctorsView/DashboardMain"
})


export class DoctorsMainComponent {
  public messageOfDayOpenCount: number = null;
  public messageDetail: any;
  validRoutes: any;
  constructor(public securityService: SecurityService,
    public coreService: CoreService,
    //private sessionSt: SessionStorageService,
    public msgBoxServ: MessageboxService) {
      DanpheCache.GetData(MasterType.ICD, null);
      DanpheCache.GetData(MasterType.ProcedureBillItemPrices,null);
        //get the chld routes of doctors/PatientOverviewMain from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Doctors");
    this.GetMessageOfTheDay();
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
