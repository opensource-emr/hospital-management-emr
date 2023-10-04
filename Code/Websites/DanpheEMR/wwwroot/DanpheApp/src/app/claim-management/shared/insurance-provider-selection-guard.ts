import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { ClaimManagementService } from "./claim-management.service";

@Injectable()
export class InsuranceSelectionGuardService<T> implements CanActivate {

  constructor(private claimManagementService: ClaimManagementService,
    private _router: Router) {
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const insuranceSelected = this.claimManagementService.getActiveInsuranceProvider();
    if (insuranceSelected && insuranceSelected.OrganizationId > 0) {
      return true;
    }
    else {
      this._router.navigate(['/ClaimManagement/SelectInsuranceProvider']);
      return false;
    }
  }
  canDeactivate() {
    this.claimManagementService.setActiveInsuranceProvider(null);
    return true;
  }

}
