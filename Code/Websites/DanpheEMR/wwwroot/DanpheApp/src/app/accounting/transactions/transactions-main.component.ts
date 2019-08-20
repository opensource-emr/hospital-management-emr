import { Component } from "@angular/core";
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../../security/shared/security.service"



@Component({
    templateUrl: "./transactions-main.html"
})
export class TransactionsMainComponent {
    
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        //get the chld routes of ADTMain from valid routes available for this user.
        this.validRoutes = this.securityService.GetChildRoutes("Accounting/Transaction");
    }
}