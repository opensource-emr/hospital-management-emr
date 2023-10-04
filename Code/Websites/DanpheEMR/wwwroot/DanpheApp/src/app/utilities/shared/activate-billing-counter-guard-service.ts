import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { RouteFromService } from "../../shared/routefrom.service";
import { ActivateBillingCounterService } from "./activate-billing-counter.service";

@Injectable()
export class ActivateBillingCounterGuardService<T> implements CanDeactivate<T>, CanActivate {
    constructor(
        private _activateBillingCounterService: ActivateBillingCounterService,
        private _routeBackService: RouteFromService,
        private _router: Router) {

    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        const selectedCounter = this._activateBillingCounterService.getActiveBillingCounter();
        this._routeBackService.RouteFrom = route.data.currentRoute;
        if (selectedCounter && selectedCounter.CounterId) {
            return true;
        }
        else {
            this._router.navigate(["/Utilities/ChangeBillingCounter"]);
            return false;
        }
    }
    canDeactivate() {
        this._activateBillingCounterService.removeActiveBillingCounter();
        return true;
    }
}