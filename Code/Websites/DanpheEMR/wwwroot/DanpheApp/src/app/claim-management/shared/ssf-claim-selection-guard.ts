import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { ENUM_Scheme_ApiIntegrationNames } from "../../shared/shared-enums";
import { ClaimManagementService } from "./claim-management.service";

@Injectable()
export class SsfClaimSelectionGuardService<T> implements CanActivate {

    constructor(private claimManagementService: ClaimManagementService,
        private _router: Router) {
    }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        const insuranceSelected = this.claimManagementService.getActiveInsuranceProvider();
        if (insuranceSelected && insuranceSelected.OrganizationId > 0) {
            const OrganizationId = insuranceSelected.OrganizationId;
            const SsfApiIntegrationName = ENUM_Scheme_ApiIntegrationNames.SSF;
            try {
                const apiIntegrationName = await this.claimManagementService.getRespectiveApiIntegrationName(OrganizationId);
                if (apiIntegrationName === SsfApiIntegrationName) {
                    this.claimManagementService.setActiveInsuranceProvider(null);
                    return true;
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            this._router.navigate(['/ClaimManagement/SelectInsuranceProvider']);
        }
        return false;
    }

    canDeactivate() {
        this.claimManagementService.setActiveInsuranceProvider(null);
        return true;
    }

}