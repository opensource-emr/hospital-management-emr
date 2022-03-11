import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, RouterStateSnapshot, ActivatedRouteSnapshot, Router, CanDeactivate } from "@angular/router";
import { Observable } from 'rxjs';
import { RouteFromService } from '../routefrom.service';
import { ActivateInventoryService } from './activate-inventory.service';

@Injectable()
export class ActivateInventoryGuardService<T> implements CanDeactivate<T>, CanActivate {
  constructor(private _activateInventoryService: ActivateInventoryService, private _routeBackService: RouteFromService, private _router: Router) {
    // this.currentModule = ; // assign module
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const selectedDispensary = this._activateInventoryService.activeInventory;
    this._routeBackService.RouteFrom = route.data.currentRoute;
    if (selectedDispensary && selectedDispensary.StoreId > 0) {
      return true;
    }
    else {
      this._router.navigate(["/ActivateInventory"]);
      return false;
    }
  }

  canDeactivate() {
    this._activateInventoryService.activeInventory = null;
    return true;
  }
}
