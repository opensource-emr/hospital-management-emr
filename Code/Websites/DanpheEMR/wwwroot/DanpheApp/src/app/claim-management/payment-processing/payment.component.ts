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
  selector: 'claim-payment',
  templateUrl: './payment.component.html'
})
export class PaymentProcessingComponent {
  public paymentPendingClaimList: Array<InsurancePendingClaim> = new Array<InsurancePendingClaim>();
  public creditOrganizationId: number = 0;
  public paymentPendingClaimListGridColumns: Array<any> = [];
  public showNewPaymentEntryPopUp: boolean = false;
  public selectedClaim: InsurancePendingClaim = new InsurancePendingClaim();
  public showApproveRejectClaimAmountPopUp: boolean = false;
  public showConcludeClaimPopUp: boolean = false;
  public showRevertBackToClaimScrubbingPopUp: boolean = false;
  public showClaimPreviewPage: boolean = false;
  public ClaimSubmissionId: number = 0;
  public confirmationTitle: string = "Confirm !";
  public confirmationMessage: string = "Are you sure you want to Save ?";
  public showViewPaymentEntryPopUp: boolean = false;
  public loading: boolean = false;
  constructor(
    private claimManagementBLService: ClaimManagementBLService,
    private messageBoxService: MessageboxService,
    public claimManagementService: ClaimManagementService,
    private router: Router
  ) {
    let activeCreditOrganization = claimManagementService.getActiveInsuranceProvider();
    if (activeCreditOrganization) {
      this.creditOrganizationId = activeCreditOrganization.OrganizationId;
    }
    else {
      this.router.navigate(["/ClaimManagement/SelectInsuranceProvider"])
    }
    this.paymentPendingClaimListGridColumns = GridColumnSettings.InsurancePaymentPendingClaimListGridColumnsSettings;
  }

  isSubmit: boolean = true;
  ngOnInit() {
    this.GetPaymentPendingClaims();
  }

  public GetPaymentPendingClaims(): void {
    this.claimManagementBLService.GetPaymentPendingClaims(this.creditOrganizationId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          if (res.Results && res.Results.length > 0) {
            this.paymentPendingClaimList = res.Results;
          }
          else {
            this.paymentPendingClaimList = [];
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`No Data Available In Given Date Range.`]);
          }
        }
      },
        (err: DanpheHTTPResponse) => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error : ${err.ErrorMessage}`]);
        }
      )
  }

  public PendingClaimGridActions($event: GridEmitModel): void {

    switch ($event.Action) {

      case "approve-reject-amount":
        this.selectedClaim = $event.Data;
        this.selectedClaim.ApprovedAmount = (this.selectedClaim.ApprovedAmount + this.selectedClaim.RejectedAmount) > 0 ? this.selectedClaim.ApprovedAmount : this.selectedClaim.ClaimedAmount;
        this.showApproveRejectClaimAmountPopUp = true;
        break;

      case "new-payment":
        this.selectedClaim = $event.Data;
        this.showNewPaymentEntryPopUp = true;
        break;

      case "view-payments":
        this.selectedClaim = $event.Data;
        this.showViewPaymentEntryPopUp = true;
        break;

      case "claim-preview":
        if ($event.Data) {
          let data = $event.Data;
          this.ClaimSubmissionId = data.ClaimSubmissionId;
          this.showClaimPreviewPage = true;
        }

      default:
        break;
    }
  }

  public RevertClaimBackToClaimScrubbing(): void {
    this.claimManagementBLService.RevertClaimBackToClaimScrubbing(this.selectedClaim.ClaimSubmissionId)
      .finally(() => {
        this.showRevertBackToClaimScrubbingPopUp = false;
        this.GetPaymentPendingClaims();
      })
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          if (res.Results) {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Claim is successfully reverted back to claim scrubbing.`]);
          }
          else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`Unable to revert claim back to claim scrubbing.`]);
          }
        }
        else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
        }
      },
        (err: DanpheHTTPResponse) => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error : ${err.ErrorMessage}`]);
        }
      );
  }

  public CallBackNewPayment(): void {
    this.selectedClaim = new InsurancePendingClaim();
    this.GetPaymentPendingClaims();
    this.showNewPaymentEntryPopUp = false;
  }

  public CloseApproveRejectClaimAmountPopUp(): void {
    this.GetPaymentPendingClaims();
    this.showApproveRejectClaimAmountPopUp = false;
  }

  public ApproveRejectClaimAmount(): void {
    if ((this.selectedClaim.ApprovedAmount + this.selectedClaim.RejectedAmount) <= this.selectedClaim.ClaimedAmount) {
      if ((this.selectedClaim.ApprovedAmount) >= this.selectedClaim.TotalReceivedAmount) {
        this.claimManagementBLService.UpdateApprovedAndRejectedAmount(this.selectedClaim)
          .finally(() => {
            this.CloseApproveRejectClaimAmountPopUp();
            this.loading = false;
          })
          .subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
              if (res.Results) {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Claim Amount is successfully updated.`]);
              }
              else {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`Unable to update claim amounts.`]);
              }
            }
          },
            (err: DanpheHTTPResponse) => {
              this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error : ${err.ErrorMessage}`]);
            }
          );
      }
      else {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`Approved Amount can not be less than Already received Amount.`]);
        this.loading = false;
      }
    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`Approved Amount plus Rejected Amount can not be greater than Claimed Amount.`]);
      this.GetPaymentPendingClaims();
      this.loading = false;
    }
  }

  public CloseClaimPreviewPage(event): void {
    this.showClaimPreviewPage = false;
  }

  public HandleConfirm(): void {
    this.loading = true;
    this.ApproveRejectClaimAmount();
  }

  public HandleCancel(): void {
    this.loading = false;
  }

  public CallBackViewPayment(): void {
    this.selectedClaim = new InsurancePendingClaim();
    this.GetPaymentPendingClaims();
    this.showViewPaymentEntryPopUp = false;
  }

  public UpdateRejectedAmount() {
    let remainingAmount = (this.selectedClaim.ClaimedAmount - this.selectedClaim.ApprovedAmount);
    this.selectedClaim.RejectedAmount = remainingAmount >= 0 ? remainingAmount : 0;
  }
}
