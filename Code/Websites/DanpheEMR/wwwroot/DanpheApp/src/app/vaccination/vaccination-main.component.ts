import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { SecurityService } from "../security/shared/security.service"
import { CoreService } from '../core/shared/core.service';
import { MessageboxService } from '../shared/messagebox/messagebox.service';


@Component({
  selector: 'my-app',
  templateUrl: "./vaccination-main.html"
})

// App Component class
export class VaccinationMainComponent {
  validRoutes: any;
  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;


  constructor(public securityService: SecurityService, public router: Router,
    public coreService: CoreService,
    public msgBoxServ: MessageboxService) {
    //get the chld routes of Maternity from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Vaccination");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);
  }
}

