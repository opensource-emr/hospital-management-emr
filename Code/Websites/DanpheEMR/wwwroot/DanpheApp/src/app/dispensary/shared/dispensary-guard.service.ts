import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, RouterStateSnapshot, ActivatedRouteSnapshot, Router, CanDeactivate } from "@angular/router";
import { Observable } from 'rxjs';
import { SecurityService } from '../../security/shared/security.service';
import { DispensaryService } from './dispensary.service';

@Injectable()
export class DispensaryGuardService<T> implements CanDeactivate<T>, CanActivate {
  constructor(private _dispensaryService: DispensaryService,
    private _router: Router) {
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const selectedDispensary = this._dispensaryService.activeDispensary;
    if (selectedDispensary && selectedDispensary.StoreId > 0) {
      return true;
    }
    else {
      this._router.navigate(["/Dispensary/ActivateDispensary"]);
      return false;
    }
  }

  canDeactivate() {
    this._dispensaryService.activeDispensary = null;
    return true;
  }
}
