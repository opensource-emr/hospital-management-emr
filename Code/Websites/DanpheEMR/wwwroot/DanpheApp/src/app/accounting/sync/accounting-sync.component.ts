import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { SecurityService } from "../../security/shared/security.service";
@Component({
    templateUrl: './accounting-sync-main.html',
})
export class AccountingSyncComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        //this.validRoutes = this.securityService.GetChildRoutes("Accounting/Sync");
    }
}