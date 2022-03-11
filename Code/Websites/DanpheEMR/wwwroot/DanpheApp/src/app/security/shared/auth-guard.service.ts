import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { User } from './user.model';
import { SecurityService } from './security.service';
import { CoreService } from '../../core/shared/core.service';
@Injectable()
export class AuthGuardService implements CanActivate {

  public loggedInUser: User = new User();
  constructor(public _router: Router, public securityServ: SecurityService, public coreService: CoreService) {
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.coreService.loading = false;
    // state.url return current routing url like '/Billing/Transaction'.
    let url: string = state.url;
    this.loggedInUser = this.securityServ.GetLoggedInUser();
    this.coreService.currSelectedSecRoute = null; 
    if (this.loggedInUser.UserName != null) {
      if (this.securityServ.checkIsAuthorizedURL(url)) {
        return true;
      } else {
        this._router.navigate(['/UnAuthorized']);// We are navigating unauthorized user.
        return false;
      }
    }

  }
} 
