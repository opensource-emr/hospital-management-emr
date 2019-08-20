import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router';
import { SecurityService } from "../../security/shared/security.service"

@Component({
    selector: 'settlement-main-page',
    templateUrl: './settlements.main.html'
})

export class SettlementsMainComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        //get the chld routes of Settlements from valid routes available for this user.
        this.validRoutes = this.securityService.GetChildRoutes("Billing/Settlements");
    }
}