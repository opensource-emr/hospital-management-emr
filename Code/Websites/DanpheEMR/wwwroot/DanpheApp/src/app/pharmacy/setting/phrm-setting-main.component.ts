import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"
import { ENUM_TermsApplication } from '../../shared/shared-enums';
import { CoreService } from '../../core/shared/core.service'
@Component({
    templateUrl: "./phrm-setting-main.html"
})
export class PHRMSettingMainComponent {
    validRoutes: any[];
    TermsApplicationId: number = ENUM_TermsApplication.Pharmacy;
    InvoiceLogoModule: string = "Pharmacy";
    constructor(public securityService: SecurityService, public coreService: CoreService) {
        this.validRoutes = this.securityService.GetChildRoutes("Pharmacy/Setting");
        this.showpacking();

    }
    showpacking() {
        let pkg = this.coreService.Parameters.find((p) => p.ParameterName == "PharmacyGRpacking" && p.ParameterGroupName == "Pharmacy").ParameterValue;
        if (pkg == "false")
            this.validRoutes = this.validRoutes.filter(a => a.UrlFullPath != 'Pharmacy/Setting/Packing' && a.RouterLink != 'Packing')
    }
}
