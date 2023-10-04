import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from '../../shared/shared-enums';
import { ClaimBillReviewDTO } from '../shared/DTOs/ClaimManagement_BillReview_DTO';
import { ClaimManagementBLService } from '../shared/claim-management.bl.service';
import { ClaimManagementService } from '../shared/claim-management.service';

@Component({
  selector: 'ins-bill-list',
  templateUrl: './ins-bill-list.component.html'
})
export class InsuranceBillListComponent {
  public fromDate: string = "";
  public toDate: string = "";
  public creditOrganizationId: number = 0;
  public billReviewListFiltered: Array<ClaimBillReviewDTO> = new Array<ClaimBillReviewDTO>();
  public billReviewListAll: Array<ClaimBillReviewDTO> = new Array<ClaimBillReviewDTO>();
  public billListForClaimCodeAssignment: Array<ClaimBillReviewDTO> = new Array<ClaimBillReviewDTO>();
  public billForClaimScrubbing: Array<ClaimBillReviewDTO> = new Array<ClaimBillReviewDTO>();
  public loading: boolean = false;
  public searchString: string = null;
  public page: number = 1;
  public isSomeNonClaimableInvoice: boolean = false;
  public showSendToClaimScrubbing: boolean = false;
  public showNonClaimableInvoice: boolean = false;
  public showSetClaimCodePopUp: boolean = false;
  public showBillPreviewPopUp: boolean = false;
  public isSomeClaimableInvoice: boolean = false;
  public selectAll: boolean = false;
  public newClaimCode: number = 0;
  public isClaimCodeValid: boolean = false;
  public showBillPreviewPage: boolean = false;
  public selectedBill: ClaimBillReviewDTO = new ClaimBillReviewDTO;
  public confirmationTitle: string = "Confirm !";
  public confirmationMessageForClaimScrubbing: string = "Are you sure you want to send selected invoices for Claim Scrubbing?";
  public confirmationMessageForSetClaimable: string = "Are you sure you want to set selected invoices Claimable?";
  public confirmationMessageForSetNonClaimable: string = "Are you sure you want to set selected invoices Non-Claimable?";

  constructor(
    private claimManagementBLService: ClaimManagementBLService,
    private messageBoxService: MessageboxService,
    private claimManagementService: ClaimManagementService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
  ) {
    let activeCreditOrganization = claimManagementService.getActiveInsuranceProvider();
    if (activeCreditOrganization) {
      this.creditOrganizationId = activeCreditOrganization.OrganizationId;
    }
    else {
      this.router.navigate(["/ClaimManagement/SelectInsuranceProvider"])
    }

  }

  ngOnInit() {

  }

  public GetBillReviewList(): void {
    this.billReviewListFiltered = new Array<ClaimBillReviewDTO>();
    this.loading = true;
    this.claimManagementBLService.GetBillReviewList(this.fromDate, this.toDate, this.creditOrganizationId)
      .finally(() => { this.loading = false; })
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          if (res.Results && res.Results.length > 0) {
            this.billReviewListFiltered = this.billReviewListAll = res.Results;
            if (!this.showNonClaimableInvoice) {
              this.billReviewListFiltered = this.billReviewListAll.filter(a => a.IsClaimable === true);
            }
            if (this.selectAll) {
              this.billReviewListFiltered.filter(a => a.IsClaimable === true).forEach(bil => { bil.IsSelected = true });
            }
          }
          else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`No Data Available In Given Date Range.`]);
          }
        }
      },
        (err: DanpheHTTPResponse) => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error : ${err.ErrorMessage}`]);
        })
  }

  public OnFromToDateChange($event): void {
    if ($event) {
      this.fromDate = $event.fromDate;
      this.toDate = $event.toDate;
    }
  }

  public CheckValidationForClaimScrubbing(): void {
    let selectedItems = this.billReviewListFiltered.filter(a => a.IsClaimable === true && a.IsSelected === true);
    if (selectedItems && selectedItems.length > 0) {
      let item = selectedItems.find(a => a.IsSelected === true);
      if (selectedItems.every(a => (a.IsSelected === true && a.PatientId === item.PatientId && a.SchemeId === item.SchemeId && a.MemberNo === item.MemberNo && a.ClaimCode === item.ClaimCode))) {
        this.claimManagementBLService.CheckClaimCode(item.ClaimCode)
          .subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
              if (res.Results) {
                this.billForClaimScrubbing = selectedItems;
                this.SendClaimScrubbing();
              }
              else {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`Sorry, this claim code is already being used. Please assign new claim code to the selected invoices.`])
                this.loading = false;;
              }
            }
          });
      }
      else {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`PatientName, SchemeName, MemberNo and ClaimCode should be same for the selected invoices in order to send it for claim scrubbing.`]);
        this.loading = false;
      }
    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`Please select at least one Claimable invoice from the list.`])
      this.loading = false;;
    }
  }

  public SendClaimScrubbing(): void {
    if (this.billForClaimScrubbing.length > 0) {
      this.claimManagementBLService.SendBillForClaimScrubbing(this.billForClaimScrubbing)
        .finally(() => {
          this.billForClaimScrubbing = [];
          this.GetBillReviewList();
        })
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Invoices successfully send for claim scrubbing.`]);
          }
          else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Unable to send invoices for claim scrubbing.`]);
          }
        },
          (err: DanpheHTTPResponse) => {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Exception: ${err.ErrorMessage}`]);
          });
    }
  }

  public OpenSetClaimCodePopUp(): void {
    let selectedItems = this.billReviewListFiltered.filter(a => a.IsClaimable === true && a.IsSelected === true);
    if (selectedItems && selectedItems.length > 0) {
      let item = selectedItems.find(a => a.IsSelected === true);
      if (selectedItems.every(a => (a.IsSelected === true && a.PatientId === item.PatientId && a.SchemeId === item.SchemeId))) {
        this.billListForClaimCodeAssignment = selectedItems;
        this.showSetClaimCodePopUp = true;
      }
      else {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`PatientName and SchemeName should be same for the selected invoices in order to assign claim code.`]);
      }
    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`Please select at least one Claimable invoice from the list.`]);
    }
  }

  public CloseSetClaimCodePopUp(): void {
    this.showSetClaimCodePopUp = false;
    this.billListForClaimCodeAssignment = [];
    this.newClaimCode = 0;
    this.isClaimCodeValid = false;
  }

  public OpenShowBillPreviewPopUp(): void {
    this.showBillPreviewPopUp = true;
  }

  public SetInvoiceNonClaimable(): void {
    const selectedBills = this.billReviewListFiltered.filter(a => a.IsSelected === true);
    this.claimManagementBLService.UpdateClaimableStatus(selectedBills, false)
      .finally(() => {
        this.isSomeNonClaimableInvoice = false;
        this.loading = false;
      })
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Selected invoices is successfully set non-claimable.`]);
          this.GetBillReviewList();
        }
        else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [`Unable to update claimable status of the invoices.`]);
        }
      },
        (err: DanpheHTTPResponse) => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [`Exception ${err.ErrorMessage}`]);
        });
  }

  public HandleShowNonClaimableInvoiceCheckbox(event): void {
    if (event && event.currentTarget.checked) {
      this.billReviewListFiltered = this.billReviewListAll;
    }
    else {
      this.billReviewListFiltered = this.billReviewListAll.filter(a => a.IsClaimable === true);
    }
  }

  public HandleSelectAllCheckBox(event): void {
    if (event && event.currentTarget.checked) {
      this.billReviewListFiltered.forEach(bil => { bil.IsSelected = true });
    }
    else {
      this.billReviewListFiltered.forEach(bil => { bil.IsSelected = false });
    }
  }

  public CheckClaimCode(): void {
    if (this.newClaimCode > 0 && this.newClaimCode.toString().length <= 14) {
      let patientInfo = this.billListForClaimCodeAssignment.length > 0 ? this.billListForClaimCodeAssignment[0] : false;
      if (patientInfo) {
        this.claimManagementBLService.CheckClaimCode(this.newClaimCode).subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
            if (res.Results) {
              this.isClaimCodeValid = true;
            }
            else {
              this.isClaimCodeValid = false;
              this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`This ClaimCode is alredy used.`]);
            }
          }
        },
          (err: DanpheHTTPResponse) => {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [`Exception : ${err.ErrorMessage}`]);
          });
      }
      else {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`New ClaimCode ${this.newClaimCode} is not valid.`]);
      }
    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`Invalid Claim Code, It must be number greater than 0, upto max 14 digit, Please Check It.`]);
    }
  }

  public ClaimCodeChange(): void {
    this.isClaimCodeValid = false;
  }

  public UpdateClaimCode(): void {
    if (this.isClaimCodeValid && this.billListForClaimCodeAssignment.length > 0) {
      this.claimManagementBLService.UpdateClaimableCode(this.billListForClaimCodeAssignment, this.newClaimCode).subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`ClaimCode successfully updated.`]);
          this.CloseSetClaimCodePopUp();
          this.GetBillReviewList();
        }
      },
        (err: DanpheHTTPResponse) => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Exception: ${err.ErrorMessage}`]);
        });
    }
  }

  public SelectInvoice(event, bill: ClaimBillReviewDTO): void {
    if (event && event.srcElement.localName === "a") {
      return;
    }
    let index = this.billReviewListFiltered.findIndex(a => a.CreditStatusId === bill.CreditStatusId && a.InvoiceRefId === bill.InvoiceRefId);
    if (index >= 0) {
      if (this.billReviewListFiltered[index].IsSelected) {
        this.billReviewListFiltered[index].IsSelected = false;
      }
      else {
        this.billReviewListFiltered[index].IsSelected = true;
      }
    }
  }

  public SetInvoiceClaimable(): void {
    const selectedBills = this.billReviewListFiltered.filter(a => a.IsSelected === true);
    this.claimManagementBLService.UpdateClaimableStatus(selectedBills, true)
      .finally(() => {
        this.isSomeClaimableInvoice = false;
        this.loading = false;
      })
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Selected invoices is successfully set claimable.`]);
          this.GetBillReviewList();
        }
        else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [`Unable to update claimable status of the invoices.`]);
        }
      },
        (err: DanpheHTTPResponse) => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [`Exception ${err.ErrorMessage}`]);
        });
  }

  public BillPreview(bill): void {
    this.showBillPreviewPage = true;
    this.selectedBill = bill;
    this.changeDetector.detectChanges();
  }

  public HideBillPreviewPage(data): void {
    if (data === true) {
      this.showBillPreviewPage = false;
      this.GetBillReviewList();
    }
  }

  public HandleConfirmForSendForClaimScrubbing(): void {
    this.loading = true;
    this.CheckValidationForClaimScrubbing();
  }

  public HandleCancelForSendForClaimScrubbing(): void {
    this.billForClaimScrubbing = [];
    this.loading = false;
  }

  public HandleConfirmForSetNonClaimable(): void {
    this.loading = true;
    if (this.billReviewListFiltered.some(a => a.IsSelected === true)) {
      this.isSomeNonClaimableInvoice = true;
    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`Please select at least one invoice from the list.`]);
      this.loading = false;
    }
    if (this.isSomeNonClaimableInvoice) {
      this.SetInvoiceNonClaimable();
    }
  }

  public HandleCancelForSetNonClaimable(): void {
  }

  public HandleConfirmForSetClaimable(): void {
    this.loading = true;
    if (this.billReviewListFiltered.some(a => a.IsSelected === true)) {
      this.isSomeClaimableInvoice = true;
    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`Please select at least one invoice from the list.`]);
      this.loading = false;
    }
    if (this.isSomeClaimableInvoice) {
      this.SetInvoiceClaimable();
    }
  }

  public HandleCancelForSetClaimable(): void {
  }

}
