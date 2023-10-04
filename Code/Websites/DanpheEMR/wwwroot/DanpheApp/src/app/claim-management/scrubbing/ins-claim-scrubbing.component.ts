import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as _ from 'lodash';
import { UploadedFile } from '../../shared/DTOs/uploaded-files-DTO';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status, ENUM_ValidFileFormats } from '../../shared/shared-enums';
import { ClaimBillReviewDTO } from '../shared/DTOs/ClaimManagement_BillReview_DTO';
import { InsurancePendingClaim } from '../shared/DTOs/ClaimManagement_PendingClaims_DTO';
import { SubmittedClaimDTO } from '../shared/DTOs/ClaimManagement_SubmittedClaim_DTO';
import { ClaimManagementBLService } from '../shared/claim-management.bl.service';

@Component({
    selector: 'ins-claim-scrubbing',
    templateUrl: './ins-claim-scrubbing.component.html'
})
export class InsuranceClaimScrubbingComponent {

    @Input("Claim")
    public claimDetail: InsurancePendingClaim = new InsurancePendingClaim();
    @Output("CloseClaimScrubbingPopUp")
    PopUpCloseEmitter: EventEmitter<Object> = new EventEmitter<Object>();
    public invoiceList: Array<ClaimBillReviewDTO> = new Array<ClaimBillReviewDTO>();
    public showNewDocumentUploadPopUp: boolean = false;
    public uploadedDocuments: Array<UploadedFile> = new Array<UploadedFile>();
    public selectedDocument: UploadedFile = new UploadedFile();
    public totalAmount: number = 0;
    public nonClaimableAmount: number = 0;
    public claimableAmount: number = 0;
    public fileSrc: any;
    public claimForSubmission: SubmittedClaimDTO = new SubmittedClaimDTO();
    public loading: boolean = false;
    public selectedInvoiceIndex: number = -1;
    public showImageFilePreviewPopUp: boolean = false;
    public showNonImageFilePreviewPopUp: boolean = false;
    public showBillPreviewPage: boolean = false;
    public selectedInvoice: ClaimBillReviewDTO = new ClaimBillReviewDTO();
    public showClaimPreviewPage: boolean = false;
    public confirmationTitle: string = "Confirm !";
    public confirmationMessageForSaveAsDraft: string = "Are you sure you want to Save As Draft ?";
    public confirmationMessageForSubmitClaim: string = "Are you sure you want to Submit Claim ?";
    public confirmationMessageForRevertToBillReview: string = "Are you sure you want to Revert To Bill Review ?";
    constructor(
        private claimManagementBlService: ClaimManagementBLService,
        private messageBoxService: MessageboxService,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit() {
        this.GetInvoiceByClaimSubmissionId(this.claimDetail.ClaimSubmissionId);
        this.GetDocumentsByClaimCode(this.claimDetail.ClaimCode);
    }

    public GetInvoiceByClaimSubmissionId(claimSubmissionId: number): void {
        this.claimManagementBlService.GetInvoicesByClaimSubmissionId(claimSubmissionId)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    if (res.Results) {
                        this.invoiceList = res.Results;
                        this.nonClaimableAmount = 0;
                        this.claimableAmount = 0;
                        this.totalAmount = 0;
                        let nonClaimableInvoices = _.cloneDeep(this.invoiceList.filter(a => a.IsClaimable === false));
                        if (nonClaimableInvoices.length > 0) {
                            this.nonClaimableAmount += nonClaimableInvoices.reduce((a, b) => a + b.TotalAmount, 0);
                            this.totalAmount += nonClaimableInvoices.reduce((a, b) => a + b.TotalAmount, 0);
                        }
                        let claimableInvoices = _.cloneDeep(this.invoiceList.filter(a => a.IsClaimable === true));
                        if (claimableInvoices.length > 0) {
                            this.nonClaimableAmount += claimableInvoices.reduce((a, b) => a + b.NonClaimableAmount, 0);
                            this.totalAmount += claimableInvoices.reduce((a, b) => a + b.TotalAmount, 0);
                        }
                        this.claimableAmount = this.totalAmount - this.nonClaimableAmount;
                    }
                }
            },
                (err: DanpheHTTPResponse) => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Exception: ${err.ErrorMessage}`]);
                }
            );
    }

    public GetDocumentsByClaimCode(claimCode: number): void {
        this.claimManagementBlService.GetDocumentsByClaimCode(claimCode)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.uploadedDocuments = res.Results;
                }
            },
                (err: DanpheHTTPResponse) => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Exception: ${err.ErrorMessage}`]);
                }
            );
    }

    public CloseClaimScrubbingPopUp(): void {
        this.PopUpCloseEmitter.emit();
    }

    public OpenNewDocumentUploadPopUp(): void {
        this.showNewDocumentUploadPopUp = true;
    }

    public CloseNewDocumentUploadPopUp(): void {
        this.showNewDocumentUploadPopUp = false;
    }

    public GetUploadedDocument($event): void {
        if ($event) {
            $event.forEach(file => {
                this.uploadedDocuments.push(file);
            });
        }
        this.showNewDocumentUploadPopUp = false;
    }

    public RemoveDocument(index: number): void {
        this.uploadedDocuments.splice(index, 1);
    }

    public PreviewFile(index: number, file: UploadedFile): void {
        if (file.FileId === 0) {
            this.selectedDocument = this.uploadedDocuments[index];
            this.DocumentPreview(this.selectedDocument);
        }
        else if (file.FileId > 0) {
            this.claimManagementBlService.GetDocumentForPreviewByFileId(file.FileId)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                        this.selectedDocument = res.Results;
                        this.DocumentPreview(this.selectedDocument);
                    }
                },
                    (err: DanpheHTTPResponse) => {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Exception: ${err.ErrorMessage}`]);
                    }
                );
        }
    }

    public CloseFilePreviewPopUp(): void {
        this.showNonImageFilePreviewPopUp = false;
        this.showImageFilePreviewPopUp = false;
    }

    public SubmitClaim(): void {
        if (this.claimDetail.ClaimedAmount > 0 && this.claimDetail.ClaimedAmount <= this.claimableAmount) {
            this.loading = true;
            this.claimDetail.TotalBillAmount = this.totalAmount;
            this.claimDetail.NonClaimableAmount = this.nonClaimableAmount;
            this.claimForSubmission.files = this.uploadedDocuments;
            this.claimForSubmission.claim = this.claimDetail;
            const isValid = this.CheckUploadedFilesValidation(this.claimForSubmission.files);
            if (isValid) {
                this.claimManagementBlService.SubmitClaim(this.claimForSubmission)
                    .finally(() => { this.loading = false; })
                    .subscribe((res: DanpheHTTPResponse) => {
                        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Insurance claim successfully submitted.`]);
                            this.CloseClaimScrubbingPopUp();
                        }
                        else {
                            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Unable to submit claim.`]);
                        }
                    },
                        (err: DanpheHTTPResponse) => {
                            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Exception: ${err.ErrorMessage}`]);
                        }
                    );
            }
            else {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Duplicate Files.`]);
                this.loading = false;
            }
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`Claimed Amount is Invalid. It must be greater than 0 and less than Claimable Amount`]);
            this.loading = false;
        }
    }

    public SetInvoiceClaimable(index: number): void {
        this.claimManagementBlService.UpdateClaimableStatusOfClaimedInvoice(this.invoiceList[index], true)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.GetInvoiceByClaimSubmissionId(this.claimDetail.ClaimSubmissionId);
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Invoice is successfully updated as Claimable.`]);
                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Unable to update claimable status of this invoice.`]);
                }
            },
                (err: DanpheHTTPResponse) => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Exception: ${err.ErrorMessage}`]);
                }
            );
    }

    public SetInvoiceNonClaimable(index: number): void {
        this.claimManagementBlService.UpdateClaimableStatusOfClaimedInvoice(this.invoiceList[index], false)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.GetInvoiceByClaimSubmissionId(this.claimDetail.ClaimSubmissionId);
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Invoice is successfully updated as Non-Claimable.`]);
                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Unable to update claimable status of this invoice.`]);
                }
            },
                (err: DanpheHTTPResponse) => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Exception: ${err.ErrorMessage}`]);
                }
            );
    }

    public RevertInvoiceBackToBillReview(): void {
        if (this.selectedInvoiceIndex >= 0) {
            this.claimManagementBlService.RevertInvoiceBackToBillReview(this.invoiceList[this.selectedInvoiceIndex])
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Invoice is successfully reverted back to bill review page.`]);
                        this.GetInvoiceByClaimSubmissionId(this.claimDetail.ClaimSubmissionId);;
                    }
                    else {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Unable to update revert invoice to bill review.`]);
                    }
                },
                    (err: DanpheHTTPResponse) => {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Exception: ${err.ErrorMessage}`]);
                    }
                );
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`Invalid Invoice Index Position Is Selected`]);
        }
    }

    public SaveClaimAsDraft(): void {
        this.loading = true;
        this.claimDetail.TotalBillAmount = this.totalAmount;
        this.claimDetail.NonClaimableAmount = this.nonClaimableAmount;
        this.claimForSubmission.files = this.uploadedDocuments;
        this.claimForSubmission.claim = this.claimDetail;
        const isValid = this.CheckUploadedFilesValidation(this.claimForSubmission.files);
        if (isValid) {
            this.claimManagementBlService.SaveClaimAsDraft(this.claimForSubmission)
                .finally(() => { this.loading = false; })
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Insurance claim successfully Saved As Draft.`]);
                        this.GetDocumentsByClaimCode(this.claimDetail.ClaimCode);
                    }
                    else {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Unable to save claim in draft.`]);
                    }
                },
                    (err: DanpheHTTPResponse) => {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Exception: ${err.ErrorMessage}`]);
                    }
                );
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Duplicate Files.`]);
            this.loading = false;
        }
    }

    public CloseBillPreviewPage(event): void {
        this.selectedInvoice = new ClaimBillReviewDTO();
        this.GetInvoiceByClaimSubmissionId(this.claimDetail.ClaimSubmissionId);
        this.showBillPreviewPage = false;
    }

    public OpenBillPreviewPage(index: number): void {
        this.selectedInvoice = this.invoiceList[index];
        this.selectedInvoice.PatientName = this.claimDetail.PatientName;
        this.selectedInvoice.HospitalNo = this.claimDetail.HospitalNo;
        this.selectedInvoice.AgeSex = this.claimDetail.AgeSex;
        this.showBillPreviewPage = true;
    }

    public ClaimPreview(): void {
        this.showClaimPreviewPage = true;
    }

    public CloseClaimPreviewPage(event): void {
        this.showClaimPreviewPage = false;
    }

    public DocumentPreview(selectedDocument: UploadedFile) {
        const indx = this.selectedDocument.BinaryData.indexOf(',');
        const binaryString = window.atob(this.selectedDocument.BinaryData.substring(indx + 1));
        const bytes = new Uint8Array(binaryString.length);
        const arrayBuffer = bytes.map((byte, i) => binaryString.charCodeAt(i));
        const blob = new Blob([arrayBuffer], { type: this.selectedDocument.FileExtension });
        this.fileSrc = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));

        if (this.selectedDocument.FileExtension === ENUM_ValidFileFormats.jpegImage || this.selectedDocument.FileExtension === ENUM_ValidFileFormats.jpgImage) {
            this.showImageFilePreviewPopUp = true;
        }
        else {
            this.showNonImageFilePreviewPopUp = true;
        }
    }

    public CheckUploadedFilesValidation(files: UploadedFile[]): boolean {
        const filenames: string[] = files.map(file => file.FileDisplayName); // Extract the filenames

        // Check if there are any duplicate filenames
        const duplicateFilenames = filenames.filter((filename, index) => filenames.indexOf(filename) !== index);
        return duplicateFilenames.length === 0;
    }

    public HandleConfirmForSaveAsDraft(): void {
        this.loading = true;
        this.SaveClaimAsDraft();
    }

    public HandleCancel(): void {
        this.loading = false;
    }

    public HandleConfirmForSubmitClaim(): void {
        this.loading = true;
        this.SubmitClaim();
    }

    public HandleConfirmForRevertToBillReview(index: number): void {
        this.selectedInvoiceIndex = index;
        this.RevertInvoiceBackToBillReview();
    }

}
