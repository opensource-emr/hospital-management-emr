import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { InsuranceClaimPayment } from '../../shared/DTOs/ClaimManagement_ClaimPayment_DTO';
import { InsurancePendingClaim } from '../../shared/DTOs/ClaimManagement_PendingClaims_DTO';
import { ClaimManagementBLService } from '../../shared/claim-management.bl.service';

@Component({
  selector: 'view-payment',
  templateUrl: './view-payment.component.html',
  styleUrls: ['./view-payment.component.css']
})
export class ViewPaymentComponent implements OnInit {
  @Input("Claim")
  public claimDetail: InsurancePendingClaim = new InsurancePendingClaim();

  @Output("CloseViewPaymentPopUp")
  public PopUpCloseEmitter: EventEmitter<Object> = new EventEmitter<Object>();
  public insurancePayments: Array<InsuranceClaimPayment> = new Array<InsuranceClaimPayment>();
  public totalReceivedAmount: number = 0;
  public totalServiceCommissionAmount: number = 0;
  public totalPendingAmount: number = 0;
  public confirmationTitle: string = "Confirm !";
  public confirmationMessageForConcludeClaim: string = "Are you sure you want to Conclude Claim ?";
  public confirmationMessageForSendToClaimScrubbing: string = "Are you sure you want to Send To Claim Scrubbing ?";
  public loading: boolean = false;

  constructor(
    private claimManagementBLService: ClaimManagementBLService,
    private messageBoxService: MessageboxService
  ) { }

  ngOnInit() {
    this.GetEarlierPayments();
  }

  public CloseViewPaymentPopUp(): void {
    this.PopUpCloseEmitter.emit();
  }

  public GetEarlierPayments(): void {
    this.claimManagementBLService.GetInsurancePayments(this.claimDetail.ClaimSubmissionId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          if (res.Results && res.Results.length > 0) {
            this.insurancePayments = res.Results;
            let payments = _.cloneDeep(this.insurancePayments);
            this.totalReceivedAmount = payments.reduce((a, b) => a + b.ReceivedAmount, 0);
            this.totalServiceCommissionAmount = payments.reduce((a, b) => a + b.ServiceCommission, 0);
            this.totalPendingAmount = this.claimDetail.ApprovedAmount - this.totalReceivedAmount;
          }
          else {
            this.totalReceivedAmount = 0;
            this.totalServiceCommissionAmount = 0;
            this.totalPendingAmount = this.claimDetail.ApprovedAmount - this.totalReceivedAmount;
          }
        }
      },
        (err: DanpheHTTPResponse) => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error : ${err.ErrorMessage}`]);
        }
      );
  }

  public ConcludeClaim(): void {
    this.claimManagementBLService.ConcludeClaim(this.claimDetail.ClaimSubmissionId)
      .finally(() => {
        this.PopUpCloseEmitter.emit();
        this.loading = false;
      })
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          if (res.Results) {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Claim is successfully concluded.`]);
          }
          else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`Unable to conclude claim.`]);
          }
        }
      },
        (err: DanpheHTTPResponse) => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error : ${err.ErrorMessage}`]);
        }
      );
  }

  public RevertClaimBackToClaimScrubbing(): void {
    this.claimManagementBLService.RevertClaimBackToClaimScrubbing(this.claimDetail.ClaimSubmissionId)
      .finally(() => {
        this.PopUpCloseEmitter.emit();
        this.loading = false;
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

  public HandleConfirmForConcludeClaim(): void {
    this.loading = true;
    this.ConcludeClaim();
  }

  public HandleCancelForConcludeClaim(): void {
    this.loading = false;
  }

  public HandleConfirmForSendToClaimScrubbing(): void {
    this.RevertClaimBackToClaimScrubbing();
  }

  public HandleCancelForSendToClaimScrubbing(): void {
    this.loading = false;
  }

}
