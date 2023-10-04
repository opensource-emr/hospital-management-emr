import { Component } from "@angular/core";
import { SecurityService } from "../../security/shared/security.service";


@Component({
    templateUrl: "./accounting-reports-main.html"
})
export class AccountingReportsComponent {
    validRoutes : any;
    constructor(public securityService: SecurityService) {
        this.validRoutes = this.securityService.GetChildRoutes("Accounting/Reports");

    }
}