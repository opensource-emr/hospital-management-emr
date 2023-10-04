import { Component } from "@angular/core";
import * as moment from "moment";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_PharmacyPurchaseOrderVerificationStatus } from "../../../shared/shared-enums";
import { VerificationBLService } from "../../shared/verification.bl.service";
import { VerificationService } from "../../shared/verification.service";
import { PharmacyVerificationGridColumn } from "../shared/pharmacy-verification-grid-column";
import { PurchaseOrderVerification_DTO } from "../shared/purchase-order-verification.dto";

@Component({
    selector: 'pharmacy-verification-purchase-order-list',
    templateUrl: './pharmacy-verification-purchase-order-list.component.html'
})
export class PharmacyVerificationPurchaseOrderListComponent {
    public VerificationStatus: string = "pending";
    PurchaseOrderGridColumn: any;
    PurchaseOrderGridDataFiltered: PurchaseOrderVerification_DTO[] = [];
    public dateRange: string = null;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    fromDate: string = null;
    toDate: string = null;
    loading: boolean = false;
    PurchaseOrderGridData: PurchaseOrderVerification_DTO[] = [];
    showPharmacyPurchaseOrderVerificationPage: boolean = false;
    PurchaseOrderId: number = 0;
    IsVerificationAllowed: boolean = false;
    CurrentVerificationLevel: number = 0;
    CurrentVerificationLevelCount: number = 0;
    MaxVerificationLevel: number = 0;


    constructor(public messageBoxService: MessageboxService, public verificationBLService: VerificationBLService, public verificationService: VerificationService) {
        this.dateRange = 'last1Week';
        this.PurchaseOrderGridColumn = PharmacyVerificationGridColumn.PurchaseOrderList;
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('PODate', false));
    }

    ngOnInit(): void {
    }


    public LoadPurchaseOrderListByStatus(): void {
        this.PurchaseOrderGridDataFiltered = new Array<PurchaseOrderVerification_DTO>();
        if (this.VerificationStatus == ENUM_PharmacyPurchaseOrderVerificationStatus.pending) {
            this.PurchaseOrderGridDataFiltered = this.PurchaseOrderGridData.filter(s => s.CurrentVerificationLevelCount < s.MaxVerificationLevel && s.IsVerificationAllowed == true);
        } else if (this.VerificationStatus == ENUM_PharmacyPurchaseOrderVerificationStatus.approved) {
            this.PurchaseOrderGridDataFiltered = this.PurchaseOrderGridData.filter(s => s.VerificationStatus == "approved");
        } else if (this.VerificationStatus == ENUM_PharmacyPurchaseOrderVerificationStatus.rejected) {
            this.PurchaseOrderGridDataFiltered = this.PurchaseOrderGridData.filter(s => s.VerificationStatus == "rejected");
        } else {
            this.PurchaseOrderGridDataFiltered = this.PurchaseOrderGridData;
        }
    }

    onDateChange($event): void {
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
        if (this.fromDate != null && this.toDate != null) {
            if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
                this.GetPharmacyPurchaseOrdersBasedOnUser();
            } else {
                this.messageBoxService.showMessage('failed', ['Please enter valid From date and To date']);
            }
        }
    }


    PurchaseOrderGridAction($event: GridEmitModel) {
        switch ($event.Action) {
            case "verify": {
                this.PurchaseOrderId = $event.Data.PurchaseOrderId;
                this.IsVerificationAllowed = $event.Data.IsVerificationAllowed;
                this.CurrentVerificationLevel = $event.Data.CurrentVerificationLevel;
                this.CurrentVerificationLevelCount = $event.Data.CurrentVerificationLevelCount;
                this.MaxVerificationLevel = $event.Data.MaxVerificationLevel;
                this.showPharmacyPurchaseOrderVerificationPage = true;
                break;
            }
            default:
                break;
        }
    }

    GetPharmacyPurchaseOrdersBasedOnUser() {
        this.verificationBLService.GetPharmacyPurchaseOrdersBasedOnUser(this.fromDate, this.toDate)
            .finally(() => this.loading = false)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.PurchaseOrderGridData = res.Results;
                    this.PurchaseOrderGridDataFiltered = res.Results;
                    this.LoadPurchaseOrderListByStatus();
                }
            })
    }

    ClosePharmacyPurchaseOrderVerificationPage() {
        this.showPharmacyPurchaseOrderVerificationPage = false;
        this.GetPharmacyPurchaseOrdersBasedOnUser();
    }
}