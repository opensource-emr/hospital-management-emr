import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_MessageBox_Status, ENUM_Scheme_ApiIntegrationNames } from '../../shared/shared-enums';
import { CreditOrganization_DTO } from '../shared/DTOs/credit-organization.dto';
import { ClaimManagementBLService } from '../shared/claim-management.bl.service';
import { ClaimManagementService } from '../shared/claim-management.service';

@Component({
  selector: 'ins-provider-select',
  templateUrl: './ins-provider-selection.component.html'
})

export class InsuranceProviderSelectionComponent {
  public CreditOrganization: Array<CreditOrganization_DTO> = [];

  constructor(
    private claimManagementBLService: ClaimManagementBLService,
    private router: Router,
    private claimManagementService: ClaimManagementService,
    private messageBoxService: MessageboxService
  ) {
    this.GetInsuranceApplicableCreditOrganizations();
    this.claimManagementService.removeActiveInsuranceProvider();
    this.claimManagementService.setIsOrganizationSelected(false);
    this.claimManagementService.setSelectedOrganization(null);
  }

  ngOnInit() {
  }
  public GetInsuranceApplicableCreditOrganizations(): void {
    try {
      this.claimManagementBLService.GetInsuranceApplicableCreditOrganizations()
        .subscribe((res: DanpheHTTPResponse) => {

          if (res.Results && res.Results.length) {
            this.CreditOrganization = res.Results;
          }
          else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed  to get Insurance Applicable Credit Organization list"]);
          }
        });
    }
    catch (exception) {
    }
  }

  public async onOrganizationSelect(org) {
    this.claimManagementService.setActiveInsuranceProvider(org);
    this.claimManagementService.setIsOrganizationSelected(true);
    this.claimManagementService.setSelectedOrganization(org);
    if (org) {
      const schemeApiIntegrationName = await this.claimManagementService.getRespectiveApiIntegrationName(org.OrganizationId);
      if (schemeApiIntegrationName === ENUM_Scheme_ApiIntegrationNames.SSF) {
        this.router.navigate(["/ClaimManagement/SSFClaim"]);
      } else {
        this.router.navigate(["/ClaimManagement/BillReview"]);
      }
    }
  }

}

