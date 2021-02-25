import { Component } from '@angular/core';

import { SecurityService } from '../../security/shared/security.service';

@Component({
    templateUrl: './setting-main.component.html'
})
export class SettingMainComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        this.validRoutes = this.securityService.GetChildRoutes('Incentive/Setting');
    }
}
