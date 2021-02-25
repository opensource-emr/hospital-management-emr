import { CanActivate, UrlTree, RouterStateSnapshot, ActivatedRouteSnapshot, Router, CanDeactivate } from "@angular/router";
import { Observable } from "rxjs";
import { SecurityService } from "../../security/shared/security.service";
import { Injectable } from "@angular/core";

@Injectable()
export class WardSelectionGuardService<T> implements CanDeactivate<T>, CanActivate {
    constructor(private _securityService: SecurityService,
        private _router: Router) {
    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        const wardSelected = this._securityService.getActiveWard();
        if (wardSelected && wardSelected.WardId > 0) {
            return true;
        }
        else {
            this._router.navigate(["/Nursing/InPatient/ActivateWard"]);
            return false;
        }
    }

    canDeactivate() {
        this._securityService.setActiveWard(null);
        return true;
    }
}