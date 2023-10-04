import { Component } from '@angular/core';
import { SecurityService } from "../../security/shared/security.service";

@Component({
    templateUrl: "./lis-main.html"
})


export class LISMainComponent {
    public validRoutes: any;
    constructor(public securityService: SecurityService) {
        this.validRoutes = this.securityService.GetChildRoutes("Lab/Lis");
    }
}
