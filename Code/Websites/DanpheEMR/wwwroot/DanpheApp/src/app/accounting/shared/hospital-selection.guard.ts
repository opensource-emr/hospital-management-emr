import { CanActivate, UrlTree, RouterStateSnapshot, ActivatedRouteSnapshot, Router, CanDeactivate } from "@angular/router";
import { Observable } from "rxjs";
import { SecurityService } from "../../security/shared/security.service";
import { Injectable } from "@angular/core";

@Injectable()
export class AccHospitalSelectionGuardService<T> implements CanActivate {
    constructor(private _securityService: SecurityService,
        private _router: Router) {
    }
    // this._router.navigate(['/Accounting/Transaction/VoucherEntry']);
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        const accHospitalSelected = this._securityService.AccHospitalInfo;
        if (accHospitalSelected && accHospitalSelected.ActiveHospitalId > 0) {
            return true;
        }
        else {
            this._router.navigate(['/Accounting/Transaction/ActivateHospital']);
            return false;
        }
    }
}