import { Component, Input, Output, EventEmitter,Renderer2 } from "@angular/core";
import { Patient } from "../../../patients/shared/patient.model";
import { CoreService } from "../../../core/shared/core.service";
import { InsuranceService } from "../../shared/ins-service";
import { InsuranceBlService } from "../../shared/insurance.bl.service";
import * as moment from 'moment/moment';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { InsuranceBalanceAmountHistory } from "../../shared/ins-insurance-balance-amount-history.model";
import { PatientService } from "../../../patients/shared/patient.service";

@Component({
    selector: 'gov-insurance-balance-history',
    templateUrl: './ins-price-history.component.html'
  })

  export class InsUpdateBalanceHistoryComponent {
   
  //   @Input("gov-insurance-detail")
  // public insuraceDetail: InsuranceVM = new InsuranceVM();
    @Input("patientId")
    public patientInfo: Patient;
    @Output("balance-History")
    balanceHistory: EventEmitter<Object> = new EventEmitter<Object>();
    //@Input("patient")
    // public patInfo: any;
    public showBalanceHistoryPage: boolean = false;
    public Balhistory :InsuranceBalanceAmountHistory = new InsuranceBalanceAmountHistory();
    
    constructor(
      public patientService: PatientService,
        public msgBoxServ: MessageboxService,
        public insuranceBlService: InsuranceBlService,
        public insuranceService: InsuranceService,
        public renderer: Renderer2, public coreService:CoreService) {
         
         this.GetInsBalanceHistory();
        }
       
      GetInsBalanceHistory(){
        this.insuranceBlService.GetInsBalanceHistory(this.insuranceService.patientId)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.CallBackBalanceHistory(res);
           // this.Balhistory = res.Results;
          }
          else {
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
            console.log(res.ErrorMessage);
          }
        });  
      }
      CallBackBalanceHistory(res): void {
        if (res.Status == "OK" && res.Results != null ) {
          this.showBalanceHistoryPage=true;
          this.Balhistory = res.Results
        } else {
          this.msgBoxServ.showMessage("error", ['There is no balance history found, Please try again']);
        }
      }
      Close() {
         this.showBalanceHistoryPage=false;
        this.balanceHistory.emit({ action: "balance-History", PatientId: this.Balhistory.PatientId});
        this.patientInfo = null;
      }
  }