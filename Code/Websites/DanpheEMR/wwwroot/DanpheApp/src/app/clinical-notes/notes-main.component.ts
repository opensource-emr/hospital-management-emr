import { Component } from "@angular/core";
import { SecurityService } from "../security/shared/security.service";
import { CoreService } from "../core/shared/core.service";
import { VisitService } from "../appointments/shared/visit.service";

@Component({
  templateUrl: "./notes-main.html",
})

export class NotesMainComponent {

  validRoutes: any;
  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;
  constructor(public securityService: SecurityService, public visitService: VisitService, public coreService: CoreService) {
      //get the chld routes of Clinical from valid routes available for this user.
      this.validRoutes = this.securityService.GetChildRoutes("Doctors/PatientOverviewMain/NotesSummary");
     this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
      this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);
  }


}
