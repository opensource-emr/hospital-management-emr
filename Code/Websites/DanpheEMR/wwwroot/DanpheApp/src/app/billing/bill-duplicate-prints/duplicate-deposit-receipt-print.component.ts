import { Component } from '@angular/core';

import { BillingBLService } from '../shared/billing.bl.service';

import { BillingDeposit } from "../shared/billing-deposit.model";

import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';

import { MessageboxService } from '../../shared/messagebox/messagebox.service';

@Component({
    selector: 'duplicate-deposit',
    templateUrl: './duplicate-deposit-receipt-print.html'
})

// App Component class
export class DuplicateDepositReceiptComponent {

    public deposit: BillingDeposit;
    public showReceipt: boolean = false;
    public depositList;
    public duplicateBillGrid: Array<any> = null;

    constructor(
        public BillingBLService: BillingBLService,
        public msgBoxServ: MessageboxService) {
        this.duplicateBillGrid = GridColumnSettings.DuplicateDepositReceiptList;
        this.GetDepositList();
    }

    GetDepositList() {
        this.BillingBLService.GetDepositList()
            .subscribe(res => {
                this.depositList = res.Results;
            });
    }


    DuplicateReceiptGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "showDetails":
                {
                    this.deposit = $event.Data;
                    this.showReceipt = true;

                }
                break;
            default:
                break;
        }
    }
    ShowGridView() {
        this.GetDepositList();
        this.showReceipt = false;
        this.deposit = null;
    }

}