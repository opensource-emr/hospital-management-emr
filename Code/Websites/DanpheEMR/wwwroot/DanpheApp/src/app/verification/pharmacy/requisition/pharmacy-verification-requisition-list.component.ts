import { Component } from "@angular/core";
import * as moment from "moment";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status, ENUM_PharmacyRequisitionVerificationStatus } from "../../../shared/shared-enums";
import { VerificationBLService } from "../../shared/verification.bl.service";
import { PharmacyRequisitionVerification_DTO } from "../shared/pharmacy-requisition-verification.dto";
import { PharmacyVerificationGridColumn } from "../shared/pharmacy-verification-grid-column";


@Component({
    selector: 'pharmacy-verification-requisition-list',
    templateUrl: './pharmacy-verification-requisition-list.component.html'
})
export class PharmacyVerificationRequisitionListComponent {
    RequisitionList: PharmacyRequisitionVerification_DTO[] = [];
    RequisitionFilteredList: PharmacyRequisitionVerification_DTO[] = [];
    VerificationStatus: string = 'pending';
    RequisitionColumns: any;
    NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    dateRange: string = null;
    fromDate: string = null;
    toDate: string = null;
    showPharmacyRequisitionVerificationPage: boolean = false;
    RequisitionId: number = 0;
    IsVerificationAllowed: boolean = false;
    CurrentVerificationLevel: number = 0;
    CurrentVerificationLevelCount: number = 0;
    MaxVerificationLevel: number = 0;


    constructor(public messageBoxService: MessageboxService, public verificationBLService: VerificationBLService) {
        this.RequisitionColumns = PharmacyVerificationGridColumn.RequisitionList;
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('RequisitionDate', false));
        this.dateRange = 'last1Week';



    }

    ngOnInit() {

    }


    public LoadRequisiitonListByStatus(): void {
        this.RequisitionFilteredList = new Array<PharmacyRequisitionVerification_DTO>();
        if (this.VerificationStatus === ENUM_PharmacyRequisitionVerificationStatus.pending) {
            this.RequisitionFilteredList = this.RequisitionList.filter(s => s.CurrentVerificationLevelCount < s.MaxVerificationLevel && s.IsVerificationAllowed == true && s.VerificationStatus === ENUM_PharmacyRequisitionVerificationStatus.pending);
        } else if (this.VerificationStatus == ENUM_PharmacyRequisitionVerificationStatus.approved) {
            this.RequisitionFilteredList = this.RequisitionList.filter(s => s.VerificationStatus == "approved");
        } else if (this.VerificationStatus == ENUM_PharmacyRequisitionVerificationStatus.rejected) {
            this.RequisitionFilteredList = this.RequisitionList.filter(s => s.VerificationStatus == "rejected");
        } else {
            this.RequisitionFilteredList = this.RequisitionList;
        }
    }

    onDateChange($event): void {
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
        if (this.fromDate != null && this.toDate != null) {
            if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
                this.GetPharmacyRequisitionsBasedOnUser(this.fromDate, this.toDate);
            } else {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Please enter valid From date and To date']);
            }
        }
    }


    GetPharmacyRequisitionsBasedOnUser(fromDate: string, toDate: string) {
        this.verificationBLService.GetPharmacyRequisitionsBasedOnUser(fromDate, toDate).subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.RequisitionList = res.Results;
                this.LoadRequisiitonListByStatus();
            }
            else {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get requisition list']);
            }
        }, err => {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get request list' + err.ErrorMessage]);
        })
    }

    RequisitionGridAction($event) {
        switch ($event.Action) {
            case "verify": {

                this.RequisitionId = $event.Data.RequisitionId;
                this.IsVerificationAllowed = $event.Data.IsVerificationAllowed;
                this.CurrentVerificationLevel = $event.Data.CurrentVerificationLevel;
                this.CurrentVerificationLevelCount = $event.Data.CurrentVerificationLevelCount;
                this.MaxVerificationLevel = $event.Data.MaxVerificationLevel;
                this.showPharmacyRequisitionVerificationPage = true;
                break;
            }
            default:
                break;
        }
    }

    ClosePharmacyRequisitionVerificationPage() {
        this.showPharmacyRequisitionVerificationPage = false;
        this.GetPharmacyRequisitionsBasedOnUser(this.fromDate, this.toDate);
    }


}

