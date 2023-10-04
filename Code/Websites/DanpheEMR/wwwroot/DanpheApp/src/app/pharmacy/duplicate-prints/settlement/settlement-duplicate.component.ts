
import { Component, ChangeDetectorRef } from '@angular/core'
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';
import { PHRMInvoiceModel } from '../../shared/phrm-invoice.model';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { Router } from '@angular/router';
import { PatientService } from '../../../patients/shared/patient.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { RouteFromService } from '../../../shared/routefrom.service';
import { SecurityService } from '../../../security/shared/security.service';
import { CallbackService } from '../../../shared/callback.service';
import { PharmacyService } from '../../shared/pharmacy.service';
import { PHRMSettlementModel } from '../../shared/pharmacy-settlementModel';

@Component({
    templateUrl: './settlement-duplicate.html'
})
export class PHRMSettlementDuplicateComponent {

    public allPHRMSettlementsDuplicate: Array<PHRMInvoiceModel> = [];   //this contains settlemet
    public PHRMSettlementDuplicateGridCols: Array<any> = null;
    public showGrid: boolean = true;
    public showReceipt: boolean = false;            //to show hide settlement grid+action panel   OR  SettlementReceipt
    public setlmntToDisplay = new PHRMSettlementModel();

    constructor(public pharmacyBLService: PharmacyBLService,
        public securityService: SecurityService,
        public msgBoxServ: MessageboxService
    ) {
        this.PHRMSettlementDuplicateGridCols = GridColumnSettings.PHRMSettlementDuplicate;
        this.GetPHRMSettlementDuplicatePrints();
    }

    // get pharmacy settlement duplicate records.
    GetPHRMSettlementDuplicatePrints() {
        this.allPHRMSettlementsDuplicate = [];
        this.pharmacyBLService.GetPHRMSettlementDuplicatePrints()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                    this.allPHRMSettlementsDuplicate = res.Results;
                }
            });
    }
    PHRMSettlementGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "showDetails":
                {
                    var data = $event.Data;
                    this.GetSettlementsDetails(data);
                }
                break;
            default:
                break;
        }
    }
    GetSettlementsDetails(settlementData) {
        this.pharmacyBLService.GetPHRMSettlementDuplicateDetails(settlementData.SettlementId)
            .subscribe((res: DanpheHTTPResponse) => {
                this.setlmntToDisplay = res.Results;
                this.setlmntToDisplay.BillingUser = this.securityService.GetLoggedInUser().UserName;
                this.showReceipt = true;
            },
                err => {
                    this.msgBoxServ.showMessage("failed", [err.ErrorMessage]);
                }
            );
    }
    BackToGrid() {
        this.showReceipt = false;
    }
}