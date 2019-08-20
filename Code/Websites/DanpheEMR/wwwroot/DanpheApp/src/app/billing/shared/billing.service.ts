import { Injectable, Directive } from '@angular/core';
import { BillingTransaction } from '../shared/billing-transaction.model';
import { BillingReceiptModel } from "./billing-receipt.model";
import { CoreService } from "../../core/shared/core.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { InsuranceVM } from '../shared/patient-billing-context-vm';
@Injectable()
export class BillingService {
    public taxLabel: string = "";
    public taxName: string = "";
    public taxPercent: number = 0;
    public taxId: number = 0;
    public currencyUnit: string = "";
    public BillingType: string = "";//for: inpatient, outpatient, etc.. 
    public BillingFlow: string = "normal";//normal for normal billing and insurance for insurance billing
    public Insurance: InsuranceVM;
    public isInsuranceBilling: boolean= false;
    constructor(public coreService: CoreService, public msgBoxServ: MessageboxService) {
        //this.taxLabel = this.coreService.taxLabel;

        this.GetTaxDetails();
        this.GetCurrencyUnit();
        //this.taxLabel = this.coreService.Parameters.filter(a => a.ParameterName == 'TaxInfo')[0]["ParameterValue"]
    }
    public GetTaxDetails() {
        let taxInfo1 = this.coreService.Parameters.find(a => a.ParameterName == 'TaxInfo');
        if (taxInfo1) {
            let taxInfoStr = taxInfo1.ParameterValue;
            let taxInfo = JSON.parse(taxInfoStr);
            this.taxName = taxInfo.TaxName;
            this.taxLabel = taxInfo.TaxLabel;
            this.taxPercent = taxInfo.TaxPercent;
            this.taxId = taxInfo.TaxId;
        }

    }
    public GetCurrencyUnit() {
        var currParameter = this.coreService.Parameters.find(a => a.ParameterName == "Currency")
        if (currParameter)
            this.currencyUnit = JSON.parse(currParameter.ParameterValue).CurrencyUnit;
        else
            this.msgBoxServ.showMessage("error", ["Please set currency unit in parameters."]);
    }
    globalBillingTransaction: BillingTransaction = new BillingTransaction();
    //public model: BillingTransaction = new BillingTransaction();
    public CreateNewGlobalBillingTransaction(): BillingTransaction {
        this.globalBillingTransaction = new BillingTransaction();
        return this.globalBillingTransaction;
    }
    public getGlobalBillingTransaction(): BillingTransaction {
        return this.globalBillingTransaction;
    }


    globalBillingReceipt: BillingReceiptModel = new BillingReceiptModel();
    public GetGlobalBillingReceipt(): BillingReceiptModel {
        return this.globalBillingReceipt;
    }


    //sud: 21Aug'18-- whether or not to show DischargeBill--Configurable from parameter
    public ShowIPBillSeparately(): boolean {
        let ipBillDisplayJson = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == 'ShowIpReceiptSeparately');

        if (ipBillDisplayJson && ipBillDisplayJson.ParameterValue == 1) {
            return true;
        }
        else return false;
    }

    public ResetToNormalBilling() {
        this.BillingFlow = "normal";
        this.Insurance = null;
    }
}