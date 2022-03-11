import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs/Rx";
import { SecurityService } from "../../security/shared/security.service";

@Injectable()
export class LabSelectionGuardService<T> implements CanDeactivate<T>, CanActivate {
    constructor(private securityService: SecurityService,
        private router: Router) {

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        const labSelected = this.securityService.getActiveLab();
        if (labSelected && labSelected.LabTypeId > 0) {
            return true;
        } else {
            this.router.navigate(["/Lab/LabTypeSelection"]);
            return false;
        }
    }

    canDeactivate() {
        this.securityService.setActiveLab(null);
        return true;
    }

}