import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SecurityService } from '../security/shared/security.service';
import { CreditOrganization_DTO } from './shared/DTOs/credit-organization.dto';
import { ClaimManagementService } from './shared/claim-management.service';

@Component({
  selector: 'claim-management',
  templateUrl: './claim-management-main.component.html'
})

export class ClaimManagementMainComponent {
  public isOrganizationActivated: boolean = false;
  public activeOrganization: CreditOrganization_DTO = new CreditOrganization_DTO;
  public subscriptionList: Subscription = new Subscription;
  public validRoutes: any;
  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;
  public isSSF: boolean = false;

  constructor(
    private claimManagementService: ClaimManagementService,
    private router: Router,
    private securityService: SecurityService
  ) {

    this.validRoutes = this.securityService.GetChildRoutes("ClaimManagement");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);

    this.subscriptionList.add(
      this.claimManagementService.getIsOrganizationSelected().subscribe((res: boolean) => {
        if (res === true) {
          this.isOrganizationActivated = true;
        } else {
          this.isOrganizationActivated = false;
        }
      })
    );

    this.subscriptionList.add(
      this.claimManagementService.getSelectedOrganization().subscribe((res: CreditOrganization_DTO) => {
        if (res) {
          this.activeOrganization = res;
        } else {
          this.activeOrganization = null;
        }
      })
    );
  }

  ngOnInit() {
  }

  public DeactivateOrganization(): void {
    this.claimManagementService.removeActiveInsuranceProvider();
    this.router.navigate(["/ClaimManagement/SelectInsuranceProvider"]);
  }

  ngOnDestroy() {
    this.subscriptionList.unsubscribe();
    this.claimManagementService.removeActiveInsuranceProvider();
  }
}
