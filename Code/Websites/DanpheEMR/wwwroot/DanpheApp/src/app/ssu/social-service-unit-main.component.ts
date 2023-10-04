import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { SecurityService } from "../security/shared/security.service"
@Component({
    templateUrl: "./social-service-unit-main.html"
})

export class SocialServiceUnitMainComponent {
    validRoutes: any;
    public primaryNavItems : Array<any> = null;
    public secondaryNavItems:Array<any>=null;
    constructor(public securityService: SecurityService) {
       
    }
}


