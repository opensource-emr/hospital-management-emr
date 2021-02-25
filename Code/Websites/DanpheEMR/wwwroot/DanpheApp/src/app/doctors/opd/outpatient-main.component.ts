import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"
import { ENUM_TermsApplication } from '../../shared/shared-enums';
import { CoreService } from '../../core/shared/core.service'
@Component({
    templateUrl: "./outpatient-main.html"
})
export class OutPatientMainComponent {
    validRoutes: any[];
    constructor(public securityService: SecurityService, public coreService: CoreService) {
        this.validRoutes = this.securityService.GetChildRoutes("Doctors/OutPatientDoctor");
    }
}
