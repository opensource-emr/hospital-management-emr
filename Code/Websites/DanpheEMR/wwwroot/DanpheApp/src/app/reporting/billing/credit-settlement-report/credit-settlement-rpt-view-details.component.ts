import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonFunctions } from "../../../shared/common.functions";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ReportingService } from "../../shared/reporting-service";

@Component({
    selector: 'credit-settlement-rpt-view-details',
    templateUrl: "./credit-settlement-rpt-view-details.html"
  })
  
  // App Component class
  export class CreditSettlementReportViewDetails {

      @Input("showCreditSettlementDetail")
      public showCreditSettlementDetail:boolean = false;
      @Input("SettlementDetail")
      public SettlementDetail:any = null;
      @Output("SettlementViewDetailCallBack")
      public settlementViewDetailCallBack:EventEmitter<object> = new EventEmitter<object>();

      @Input("FromDate")
      public fromDate:any = null;
      @Input("ToDate")
      public toDate:any = null;

      public Age:any = null;
      public TotalReceivable:number = 0;
      public NetReceivable:number = 0;

      public TotalReturn:number = 0;
      public NetReturnAmount:number = 0;

      public PatientInfo:any = {};
      public Settlements:any[] = [];
      public ReturnedSettlements:any[] = [];
      public CashDiscount:number = 0;
      public DiscountReceived:number = 0;


      constructor(
        public dlService: DLService, 
        public msgBoxServ: MessageboxService,
        public reportServ:ReportingService
      ){

      }
      
      ngOnInit(){
        if(this.showCreditSettlementDetail){
            this.Load();
        }
      }

      public Load(){
        this.dlService.Read("/BillingReports/CreditSettlementViewDetail?FromDate=" + this.fromDate + "&ToDate=" + this.toDate + "&PatientId="+this.SettlementDetail.PatientId)
            .map(res => res)
            .subscribe(res => this.Success(res),
            res => this.Error(res));

      }

      public Success(res){
        if(res.Status == "OK"){
        this.PatientInfo = res.Results.PatientInfo;
        this.Settlements = res.Results.Settlements;
        this.ReturnedSettlements = res.Results.ReturnedSettlement;
        this.CashDiscount = res.Results.CashDiscount[0].CashDiscount;
        this.CalculateAge();
        this.CalculateTotals();
        }else{
          this.msgBoxServ.showMessage("err",[res.ErrorMessage]);
        }
      }
      public Error(err){
        this.msgBoxServ.showMessage("error", [err]);
      }
    
      public CloseSettlementDetails(){
        this.settlementViewDetailCallBack.emit({"close":true});
      }

      public CalculateAge(){
        this.Age = CommonFunctions.GetFormattedAge(this.PatientInfo.DateOfBirth);
      }

      public CalculateTotals(){
        if(this.Settlements && this.Settlements.length){
          this.Settlements.forEach(a => {
            this.TotalReceivable += a.Receivable;
            });
            this.NetReceivable = this.TotalReceivable - this.CashDiscount;
        }
       
        if(this.ReturnedSettlements && this.ReturnedSettlements.length){
          this.ReturnedSettlements.forEach(b =>{
            this.TotalReturn += b.ReturnTotalAmount;
            this.DiscountReceived += b.DiscountReturnAmount;
          })
          this.NetReturnAmount = this.TotalReturn - this.DiscountReceived;
        }
        
      }

  }