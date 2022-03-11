import { Component, Input, Output, Injector, ChangeDetectorRef, Inject } from "@angular/core";
import { EventEmitter, OnInit } from "@angular/core"
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { BillingService } from "../../shared/billing.service";
import { BillingBLService } from "../../shared/billing.bl.service";
import { BillSettlementModel, CashDiscountReturnInfoVM, DepositInfoVM,  PatientInfoVM, SalesInfoVM, SalesReturnInfoVM, SettlementInfoVM } from "../../shared/bill-settlement.model";
import { CommonFunctions } from "../../../shared/common.functions";

@Component({
    selector: 'bil-print-settlement-slip',
    templateUrl: './bil-print-settlement-slip.html'
})
export class BIL_Print_SettlementSlip_Component {
    @Input("settlementId")
    public settlementId: number = 0;
    @Input("showReceipt")
    public showReceipt: boolean;
    public localDate: string;
    //public currencyUnit: string;
    public totalCrAmount: number = 0;

    @Output("close-receipt")
    public receiptClosed: EventEmitter<boolean> = new EventEmitter<boolean>();

    public settlementDetails:any = {};
    public PatientInfo: PatientInfoVM = new PatientInfoVM();
    public SalesInfo:SalesInfoVM[] = [];
    public SalesReturnInfo:SalesReturnInfoVM[] = [];
    public CashDiscountReturnInfo:CashDiscountReturnInfoVM[] = [];
    // public DepositReturnInfo:DepositReturnInfoVM[] = [];
    public DepositInfo:DepositInfoVM[] = [];
    public SettlementInfo:SettlementInfoVM = new SettlementInfoVM();;
    public SalesTotal:number = 0;
    public SalesReturnTotal:number = 0;
    public NetAmount:number = 0;
    public CashDiscount:number = 0;
    public PaidAmount:number = 0;
    public PayableAmount:number = 0;

    constructor(public msgBoxService: MessageboxService,
        public billingService: BillingService,
        public nepaliCalendarServ: NepaliCalendarService,
        public billingBLService: BillingBLService) {

    }

    ngOnInit() {
        //this.currencyUnit = this.billingService.currencyUnit;
        // if (this.settlementInfo) {
        //     this.localDate = this.GetLocalDate(this.settlementInfo.CreatedOn);
        //     if (this.settlementInfo.BillingTransactions) {
        //         this.settlementInfo.BillingTransactions.forEach(bil => {
        //             this.totalCrAmount += bil.TotalAmount;
        //         });
        //         this.totalCrAmount = CommonFunctions.parseAmount(this.totalCrAmount);
        //     }
        // }
        if(this.settlementId){

            this.billingBLService.GetSettlementInfoBySettlmentId(this.settlementId).subscribe(
                res =>{
                    this.settlementDetails = res.Results;
                    this.PatientInfo = this.settlementDetails.PatientInfo;
                    this.SettlementInfo = this.settlementDetails.SettlementInfo;
                    this.SalesInfo = this.settlementDetails.SalesInfo;
                    this.SalesReturnInfo = this.settlementDetails.SalesReturn;
                    this.CashDiscountReturnInfo = this.settlementDetails.CashDiscountReturn;
                    // this.DepositReturnInfo = this.settlementDetails.DepositReturn;
                    this.DepositInfo = this.settlementDetails.DepositInfo;
                    this.localDate = this.GetLocalDate(this.SettlementInfo.SettlementDate);
                    this.CalculateTotals();

                }
            )
        }
    }

    CalculateTotals(){
        if(this.SalesInfo && this.SalesInfo.length){
            this.SalesInfo.forEach(a =>{
                this.SalesTotal += a.Amount;
            });
        }
        if(this.SalesReturnInfo && this.SalesReturnInfo.length){
            this.SalesReturnInfo.forEach(b =>{
                this.SalesReturnTotal += b.Amount;
            });
        }

        this.NetAmount = this.SalesTotal - this.SalesReturnTotal;
        this.CashDiscount = this.SettlementInfo.CashDiscountGiven? this.SettlementInfo.CashDiscountGiven : 0;
        this.PayableAmount = Number((this.NetAmount - this.CashDiscount).toFixed(4));
        if(this.DepositInfo && this.DepositInfo.length){
            this.DepositInfo.forEach(a=>{
                if((a.DepositType) == "Deposit Deducted"){
                    this.PaidAmount = Number((this.NetAmount - a.Amount - this.CashDiscount).toFixed(4));
                }
            })
        }else{
            this.PaidAmount = Number((this.NetAmount - this.CashDiscount).toFixed(4));
        }
    }

    GetLocalDate(engDate: string): string {
        let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
        return npDate + " BS";
    }
    print() {
        let popupWinindow;
        var printContents = document.getElementById("dv_settlement_printpage").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body>' + printContents + '</body></html>');
        popupWinindow.document.close();

        let tmr = setTimeout(function () {
            popupWinindow.print();
            popupWinindow.close();
        }, 300);

        this.billingBLService.UpdateSettlementPrintCount(this.SettlementInfo.SettlementId)
            .subscribe(res => {

            });
    }

    CloseReceipt() {
        this.showReceipt = false;
        this.settlementDetails = {};
        this.receiptClosed.emit(true);

    }
}