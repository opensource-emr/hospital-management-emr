import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service";
import { CoreService } from '../core/shared/core.service';
import { MedicalRecordService } from './shared/medical-record.service';

@Component({
  selector: 'my-app',
  templateUrl: "./medical-records-main.html"   
})

// App Component class
export class MedicalRecordsMainComponent {
  validRoutes: any;
  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;

  constructor(public securityService: SecurityService, public mrService:MedicalRecordService,
    public coreService: CoreService) {
    //get the chld routes of Lab from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Medical-records");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);
    this.mrService.GetICDList();
  }

  
}
