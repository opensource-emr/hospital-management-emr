import { Component } from '@angular/core';

import { BillingBLService } from '../shared/billing.bl.service';
import { BillingDeposit } from "../shared/billing-deposit.model";
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { BillSettlementModel } from "../shared/bill-settlement.model";
import { DanpheHTTPResponse } from "../../shared/common-models";

@Component({
    selector: 'duplicate-credit-settlement',
    templateUrl: './duplicate-credit-settlement-receipt-print.html'
})

// App Component class
export class DuplicateCreditSettlementReceiptComponent {
    public settlementInfo: BillSettlementModel;
    public showReceipt: boolean = false;
    public settlMntList: Array<BillSettlementModel> = [];
    public settlmntGridCols: any;

    constructor(
        public billingBLService: BillingBLService,
        public msgBoxServ: MessageboxService) {
        this.settlmntGridCols = GridColumnSettings.SettlementDuplicateColumns;
        this.GetSettlementsList();
    }

    GetSettlementsList() {
        this.billingBLService.GetAllSettlements()
            .subscribe(res => {
                this.settlMntList = res.Results;
            });
    }


    DuplicateReceiptGridActions($event) {
        switch ($event.Action) {
            case "showDetails":
                {
                    let settlmntId = $event.Data.SettlementId;

                    this.billingBLService.GetSettlementInfoBySettlmentId(settlmntId)
                        .subscribe((res: DanpheHTTPResponse) => {

                            this.settlementInfo = res.Results;
                            this.settlementInfo.Patient.CountrySubDivisionName = this.settlementInfo.Patient.CountrySubDivision.CountrySubDivisionName;
                            this.showReceipt = true;
                        });

                }
                break;
            default:
                break;
        }
    }
    ShowGridView() {
        this.GetSettlementsList();
        this.showReceipt = false;
        this.settlementInfo = null;
    }

}