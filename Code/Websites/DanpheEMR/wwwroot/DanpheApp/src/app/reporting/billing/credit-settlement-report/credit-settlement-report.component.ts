import { Component } from "@angular/core";
import * as moment from "moment";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { ReportingService } from "../../shared/reporting-service";

@Component({
    selector: 'my-app',
    templateUrl: "./credit-settlement-report.html"
  })
  
  // App Component class
  export class RPT_BIL_CreditSettlementReport {
      public TodayDate: string = null;
      public toDate: string = null;
      public fromDate: string = null;
      public loading:boolean = false;
      public dateRange: string = "";

      public creditSettlementReportColumns: Array<any> = null;
      public creditSettlementReportData: Array<any> = new Array<any>();
      public SettlementDetail:any = null;
     
    //   public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

      public showCreditSettlementDetails:boolean = false;
      gridExportOptions = {
        fileName: 'creditSettlementReport' + moment().format('YYYY-MM-DD') + '.xls'
      };

      constructor(
          public dlService: DLService, 
          public msgBoxServ: MessageboxService,
          public reportServ:ReportingService
      )
      { 
        this.fromDate = this.toDate = this.TodayDate = moment().format('DD-MM-YYYY');
      }
      
      ngOnInit(){

      }

      public LoadReport(){
        
        this.dlService.Read("/BillingReports/CreditSettlementReport?FromDate=" + this.fromDate + "&ToDate=" + this.toDate)
            .map(res => res)
            .finally(() => { this.loading = false; })
            .subscribe(res => this.Success(res),
            res => this.Error(res));
      }

      Success(res:any){
        if (res.Status == "OK") {
            this.creditSettlementReportColumns = this.reportServ.reportGridCols.BillCreditSettlementReportColumns;
            this.creditSettlementReportData = res.Results;

          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          }
      }

      Error(err:any){
        this.msgBoxServ.showMessage("error", [err]);
      }

      public CreditSettlementReportGridActions(event:GridEmitModel){
        if(event){
            switch(event.Action){
                case "credit-settlement-view":{
                    this.showCreditSettlementDetails = true;
                    this.SettlementDetail = event.Data;
                    break;
                }
            }
        }
      }
      public OnFromToDateChange(event:any){
            this.fromDate = event ? event.fromDate : this.fromDate;
            this.toDate = event ? event.toDate : this.toDate;
            this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;        
      }

      public SettlementViewDetailCallBack(event:any){
        if(event){
            if(event.close == true){
                this.showCreditSettlementDetails = false;
            }
        }
      }

  }