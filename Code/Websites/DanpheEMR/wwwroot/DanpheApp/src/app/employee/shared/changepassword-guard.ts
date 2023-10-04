import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { SecurityService } from '../../security/shared/security.service';

//canDeactivate() gets called when user leaves a route, canActivate() gets called when route enters.

@Injectable()
export class ChangePasswordGuard<T> implements CanDeactivate<T> {

    constructor(public securityService: SecurityService) {
    }

    canDeactivate() {
        let currUser = this.securityService.GetLoggedInUser()
        if (currUser.NeedsPasswordUpdate) {
            return false;
        }
        else {
            return true;
        }
    }


}



