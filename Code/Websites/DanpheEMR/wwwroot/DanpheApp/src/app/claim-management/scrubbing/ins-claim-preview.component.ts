import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as moment from 'moment';
import { SecurityService } from '../../security/shared/security.service';
import { User } from '../../security/shared/user.model';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_DateFormats, ENUM_MessageBox_Status } from '../../shared/shared-enums';
import { ClaimDetails_DTO } from '../shared/DTOs/claim-preview-detail.dto';
import { ClaimManagementBLService } from '../shared/claim-management.bl.service';

@Component({
    selector: 'ins-claim-preview',
    templateUrl: './ins-claim-preview.component.html',
    styleUrls: ['./ins-claim-preview.component.css']
})
export class InsuranceClaimsPreviewComponent {
    @Input("show-claim-preview-page")
    public showBillPreviewPage: boolean = false;
    @Input("claim-submission-id")
    public claimSubmissionId: number = 0;
    @Output("hide-claim-preview-page")
    public hideClaimPreviewPage: EventEmitter<boolean> = new EventEmitter<boolean>();
    public claimDetails: ClaimDetails_DTO = new ClaimDetails_DTO();
    public showClaimPreviewPage: boolean = false;
    public invoiceDisplaySettings: any = { ShowHeader: true, ShowQR: true, ShowHospLogo: true, ShowPriceCategory: false };
    public patientQRCodeInfo: string = ``;
    public billSubTotalAmount: number = 0;
    public billDiscountAmount: number = 0;
    public billTotalAmount: number = 0;
    public pharmacySubTotalAmount: number = 0;
    public pharmacyDiscountAmount: number = 0;
    public pharmacyTotalAmount: number = 0;
    public dateToday: string = ``;
    public currentUser: User = new User();
    public isClaimDetailsFound: boolean = false;
    @Input("claimed-amount")
    public ClaimedAmount: number = 0;
    constructor(
        private securityService: SecurityService,
        private claimManagementBlService: ClaimManagementBLService,
        private messageBoxService: MessageboxService
    ) {
        this.currentUser = this.securityService.GetLoggedInUser();
    }

    ngOnInit() {
        this.dateToday = moment().format(ENUM_DateFormats.Year_Month_Day);
        (async () => {
            try {
                await this.GetClaimDetailsForPreview(this.claimSubmissionId);
                this.BillingTotalCalculation();
                this.PharmacyTotalCalculation();
            } catch (err) {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error: ${err.ErrorMessage}`]);
            }
        })();

    }

    public CloseClaimPreviewPopUp(): void {
        this.showClaimPreviewPage = false;
        this.hideClaimPreviewPage.emit(true);
    }


    public async GetClaimDetailsForPreview(claimSubmissionId: number): Promise<void> {
        try {
            const res: DanpheHTTPResponse = await this.claimManagementBlService.ClaimDetailsForPreview(claimSubmissionId).toPromise();
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                if (res.Results) {
                    this.claimDetails = res.Results;
                    if (this.ClaimedAmount > 0) {
                        this.claimDetails.HeaderDetails[0].ClaimedAmount = this.ClaimedAmount;
                    }
                    this.isClaimDetailsFound = true;
                } else {
                    this.claimDetails = new ClaimDetails_DTO();
                }
            }
        } catch (err) {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error : ${err.ErrorMessage}`]);
        }
    }

    public BillingTotalCalculation(): void {
        this.billSubTotalAmount = this.claimDetails.BillingDetails.reduce((subTotal, bill) => subTotal + bill.SubTotalAmount, 0);
        this.billDiscountAmount = this.claimDetails.BillingDetails.reduce((discount, bill) => discount + bill.DiscountAmount, 0);
        this.billTotalAmount = this.claimDetails.BillingDetails.reduce((total, bill) => total + bill.TotalAmount, 0);
    }

    public PharmacyTotalCalculation(): void {
        this.pharmacySubTotalAmount = this.claimDetails.PharmacyDetails.reduce((subTotal, phrm) => subTotal + phrm.SubTotalAmount, 0);
        this.pharmacyDiscountAmount = this.claimDetails.PharmacyDetails.reduce((discount, phrm) => discount + phrm.DiscountAmount, 0);
        this.pharmacyTotalAmount = this.claimDetails.PharmacyDetails.reduce((total, phrm) => total + phrm.TotalAmount, 0);
    }
}
