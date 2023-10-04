import { Component } from "@angular/core";
import { SecurityService } from "../../security/shared/security.service";

@Component({
    templateUrl: "./bank-reconciliation-main.component.html"
})
export class BankReconciliationMainComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        this.validRoutes = this.securityService.GetChildRoutes("Accounting/BankReconciliation");
    }
}