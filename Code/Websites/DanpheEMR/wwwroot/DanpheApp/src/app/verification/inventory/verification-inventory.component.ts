import { Component, OnInit } from "@angular/core";
import { SecurityService } from "../../security/shared/security.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-verification-inventory",
  templateUrl: "./verification-inventory.component.html"
})
export class VerificationInventoryComponent implements OnInit {
  validRoutes: any;
  constructor(public securityService: SecurityService, public router: Router) {
    this.validRoutes = this.securityService.GetChildRoutes(
      "Verification/Inventory"
    );
  }

  ngOnInit() {
    this.router.navigate(["Verification/Inventory/Requisition"]);
  }
}
