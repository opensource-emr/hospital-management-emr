import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"
import { CoreService } from '../../core/shared/core.service';
@Component({
    templateUrl: './accounting-settings-main.html',
})
export class AccountingSettingsComponent {
    validRoutes: any;
    public IsReverseTransfer = false;
    constructor(public securityService: SecurityService,   public coreService: CoreService) {
        this.IsReverseTransfer = this.CheckReverseTransfer();
        this.validRoutes = this.securityService.GetChildRoutes("Accounting/Settings");
    }
    CheckReverseTransfer(){
        return this.coreService.CheckReverseTransfer();
    }
}