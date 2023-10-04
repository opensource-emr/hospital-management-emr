import { Component } from '@angular/core'
import { SecurityService } from "../../security/shared/security.service"
import { CoreService } from '../../core/shared/core.service';
@Component({
    templateUrl: './accounting-settings-main.html',
})
export class AccountingSettingsComponent {
    public validRoutes: any;
    public primaryNavItems: Array<any>=null;
    public secondaryNavItems: Array<any>=null;
    public IsReverseTransfer = false;
    constructor(public securityService: SecurityService,   public coreService: CoreService) {
        this.IsReverseTransfer = this.CheckReverseTransfer();
        this.validRoutes = this.securityService.GetChildRoutes("Accounting/Settings");
        if(!this.IsReverseTransfer) this.validRoutes = this.validRoutes.filter(r=>r.RouterLink !='ReverseTransaction');
        this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
        this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1); 
    }
    CheckReverseTransfer(){
        return this.coreService.CheckReverseTransfer();
    }
}