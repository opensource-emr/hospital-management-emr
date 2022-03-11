import { Component, ChangeDetectorRef } from "@angular/core";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { FractionCalculationService } from "../../shared/fraction-calculation.service";
import { DesignationService } from '../../shared/Designation.service';
import { BillingTransactionItem } from "../../../billing/shared/billing-transaction-item.model";
import { Router } from "@angular/router";
import { FractionPercentService } from "../../shared/Fraction-Percent.service";
import { RouteFromService } from '../../../shared/routefrom.service';
//import { Listener } from "ag-grid";
import { SecurityService } from "../../../security/shared/security.service";
import { count } from "rxjs/operator/count";
import { identifierModuleUrl } from "@angular/compiler";
import * as moment from 'moment/moment';
import { FractionCalculationViewModel } from "../../shared/fraction-calculation.viewmodel";
import { FractionPercentModel } from "../../shared/fraction-percent.model";
import { CoreService } from "../../../core/shared/core.service";

@Component({
    selector: 'fraction-applicable-list',
    templateUrl: './calculate-details.component.html',
})
export class CalculateDetailsComponent {

    public calculationDetails: Array<FractionCalculationViewModel> = new Array<FractionCalculationViewModel>();
    public billingTransactionItem: BillingTransactionItem = new BillingTransactionItem();
    public billPriceItemId: number=0;
    public billTxnId: number = 0;
    public doctorAmount: number = 0;
    public billAmount: number = 0;
    public hospitalAmount: number=0;
    public fractionPercent: FractionPercentModel = new FractionPercentModel();

    constructor(
        public fractionCalculationService: FractionCalculationService,
        public securityService: SecurityService,
        public DesignationService: DesignationService,
        public fractionPercentService: FractionPercentService,
        public routeFromService: RouteFromService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService,
        public router: Router,
        public coreService: CoreService
    ) {
        if (!this.fractionCalculationService.BillTxnId) {
            this.msgBoxServ.showMessage("failed", ["Please select one bill item."]);
            this.router.navigate(['/Fraction/Calculation/ApplicableList']);
        }
        this.billPriceItemId = this.fractionCalculationService.BillItemPriceId;
        this.billTxnId = this.fractionCalculationService.BillTxnId;
        this.billingTransactionItem = this.fractionCalculationService.BillTransactionItem;
        this.billAmount = this.fractionCalculationService.BillTransactionItem.TotalAmount;
        this.getFractionCalculationDetails(this.billTxnId);
        this.getFractionPercentage();

    }
    public getFractionPercentage() {
        this.fractionPercentService.GetFractionPercentByBillPriceId(this.billPriceItemId)
            .subscribe(res => {
                this.fractionPercent = res.Results;
                this.doctorAmount = this.fractionPercent.DoctorPercent * this.billAmount / 100;
                this.hospitalAmount = this.fractionPercent.HospitalPercent * this.billAmount / 100;
            });
    }
    public getFractionCalculationDetails(billTxnId) {
        this.fractionCalculationService.GetFractionCalculation(billTxnId)
            .subscribe(res => {
                this.calculationDetails = res.Results;                
            });
    }

    logError(err: any) {
        console.log(err);
        this.msgBoxServ.showMessage("error", [err]);
    } 
}