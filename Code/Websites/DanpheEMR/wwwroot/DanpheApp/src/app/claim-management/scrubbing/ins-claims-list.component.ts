import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DanpheHTTPResponse } from '../../shared/common-models';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from '../../shared/shared-enums';
import { InsurancePendingClaim } from '../shared/DTOs/ClaimManagement_PendingClaims_DTO';
import { ClaimManagementBLService } from '../shared/claim-management.bl.service';
import { ClaimManagementService } from '../shared/claim-management.service';

@Component({
  selector: 'ins-bill-claims-list',
  templateUrl: './ins-claims-list.component.html'
})
export class InsuranceClaimsListComponent {
  public claimSubmissionPendingList: Array<InsurancePendingClaim> = new Array<InsurancePendingClaim>();
  public creditOrganizationId: number = 0;
  public pendingClaimListGridColumns: Array<any> = [];
  public showClaimScrubbingPopUp: boolean = false;
  public selectedClaim: InsurancePendingClaim = new InsurancePendingClaim();
  constructor(
    private claimManagementBLService: ClaimManagementBLService,
    private messageBoxService: MessageboxService,
    private claimManagementService: ClaimManagementService,
    private router: Router
  ) {
    let activeCreditOrganization = claimManagementService.getActiveInsuranceProvider();
    if (activeCreditOrganization) {
      this.creditOrganizationId = activeCreditOrganization.OrganizationId;
    }
    else {
      this.router.navigate(["/ClaimManagement/SelectInsuranceProvider"])
    }
    this.pendingClaimListGridColumns = GridColumnSettings.InsurancePendingClaimGridSettings;
  }

  ngOnInit() {
    this.GetPendingClaims();
  }

  public GetPendingClaims(): void {
    this.claimManagementBLService.GetClaimSubmissionPendingList(this.creditOrganizationId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          if (res.Results && res.Results.length > 0) {
            let claimSubmissionPendingListFiltered = new Array<InsurancePendingClaim>();
            claimSubmissionPendingListFiltered = res.Results.filter(item => item.TotalBillAmount !== 0);
            this.claimSubmissionPendingList = claimSubmissionPendingListFiltered;
          }
          else {
            this.claimSubmissionPendingList = [];
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`No Data Available In Given Date Range.`]);
          }
        }
      },
        (err: DanpheHTTPResponse) => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error : ${err.ErrorMessage}`]);
        })
  }

  public PendingClaimGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "claim-review": {
        this.selectedClaim = $event.Data;
        this.showClaimScrubbingPopUp = true;
        break;
      }
      default:
        break;
    }
  }

  public CallBackClaimScrubbing(): void {
    this.selectedClaim = new InsurancePendingClaim();
    this.GetPendingClaims();
    this.showClaimScrubbingPopUp = false;
  }
}
