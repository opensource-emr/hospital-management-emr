import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router'
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service"
import { CallbackService } from '../shared/callback.service';

@Component({
  templateUrl: './adt-main.html'
})

// App Component class
export class ADTMainComponent {

    validRoutes: any;
    public primaryNavItems : Array<any> = null;
    public secondaryNavItems:Array<any>=null;
    public currentCounter: number = null;
    constructor(public securityService: SecurityService,
      public callbackService: CallbackService,public router: Router) {
        //get the chld routes of ADTMain from valid routes available for this user.
        this.validRoutes = this.securityService.GetChildRoutes("ADTMain");
        this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
        this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1); 

        this.currentCounter = this.securityService.getLoggedInCounter().CounterId;
        if(this.currentCounter <1){
          this.callbackService.CallbackRoute = '/ADTMain/AdmissionSearchPatient';
          this.router.navigate(['/Billing/CounterActivate']);
        }
    }

}
