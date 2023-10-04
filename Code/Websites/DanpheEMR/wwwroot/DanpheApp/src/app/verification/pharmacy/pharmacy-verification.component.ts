import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { SecurityService } from "../../security/shared/security.service";

@Component({
    selector: "pharmacy-verification",
    templateUrl: "./pharmacy-verification.component.html"
})
export class PharmacyVerificationComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService, public router: Router) {
        this.validRoutes = this.securityService.GetChildRoutes(
            "Verification/Pharmacy"
        );
    }

    ngOnInit() {
        this.router.navigate(["Verification/Pharmacy/PurchaseOrder"]);
    }
}