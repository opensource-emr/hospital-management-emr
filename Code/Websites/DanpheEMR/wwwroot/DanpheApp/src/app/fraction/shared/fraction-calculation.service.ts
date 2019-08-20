import { Injectable, Directive } from '@angular/core';
import { FractionCalculationEndPoint } from './fraction-calculation.endpoint';
import { FractionCalculationModel } from './fraction-calculation.model';
import { BillingTransactionItem } from '../../billing/shared/billing-transaction-item.model';

@Injectable()
export class FractionCalculationService {

    public _BillTxnId: number = 0;
    public _BillItemPriceId: number = 0;
    public _billingTransactionItem: BillingTransactionItem = new BillingTransactionItem();
    public _doctorPercent: number = 0;

    get DoctorPercent(): number {
        return this._doctorPercent;
    }
    set DoctorPercent(doctorPercent: number){
        this._doctorPercent = doctorPercent;
    }

    get BillTransactionItem(): BillingTransactionItem {
        return this._billingTransactionItem;
    }
    set BillTransactionItem(billTransactionItem: BillingTransactionItem){
        this._billingTransactionItem = billTransactionItem;
    }

    get BillTxnId(): number {
        return this._BillTxnId;
    }
    set BillTxnId(BillTxnId: number) {
        this._BillTxnId = BillTxnId;
    }

    get BillItemPriceId(): number {
        return this._BillItemPriceId;
    }
    set BillItemPriceId(BillItemPriceId: number) {
        this._BillItemPriceId = BillItemPriceId;
    }

    constructor(public FractionCalculationEndpoint: FractionCalculationEndPoint) {

    }

    public GetFractionApplicableTxnItemList() {
        return this.FractionCalculationEndpoint.GetFractionApplicableTxnItemList()
            .map(res => { return res });
    }

    public GetFractionCalculationList() {
        return this.FractionCalculationEndpoint.GetFractionCalculationList()
            .map(res => { return res });
    }

    public AddFractionCalculation(CurrentFractionCalculation: Array<FractionCalculationModel>) {
        return this.FractionCalculationEndpoint.AddFractionCalculation(CurrentFractionCalculation)
            .map(res => { return res });
    }

    public UpdateFractionCalculation(id: number,CurrentFractionCalculation: FractionCalculationModel) {
        return this.FractionCalculationEndpoint.UpdateFractionCalculation(id, CurrentFractionCalculation)
            .map(res => { return res });
    }

    public GetFractionCalculation(id: number) {
        return this.FractionCalculationEndpoint.GetFractionCalculation(id)
            .map(res => { return res });
    }
    public GetFractionReportByItemList(){
        return this.FractionCalculationEndpoint.GetFractionReportByItemList()
        .map(res=> {return res});
    }
    public GetFractionReportByDoctorList(FromDate: string, ToDate: string){
        return this.FractionCalculationEndpoint.GetFractionReportByDoctorList(FromDate, ToDate)
        .map(res=> {return res});
    }
}