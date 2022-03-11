import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { SecurityService } from "../security/shared/security.service"
import { CoreService } from '../core/shared/core.service';
import { MessageboxService } from '../shared/messagebox/messagebox.service';


@Component({
  selector: 'my-app',
  templateUrl: "./queue-management-main.html"
})

export class QueueManagementMainComponent {
  validRoutes: any;
  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;


  constructor(public securityService: SecurityService, public router: Router,
    public coreService: CoreService,
    public msgBoxServ: MessageboxService) {
    this.validRoutes = this.securityService.GetChildRoutes("QueueManagement");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);
  }
}

