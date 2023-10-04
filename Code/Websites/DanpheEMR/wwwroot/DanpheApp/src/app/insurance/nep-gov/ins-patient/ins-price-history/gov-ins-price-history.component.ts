import { Component, EventEmitter, Input, Output, Renderer2 } from "@angular/core";
import { CoreService } from "../../../../core/shared/core.service";
import { Patient } from "../../../../patients/shared/patient.model";
import { PatientService } from "../../../../patients/shared/patient.service";
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";
import { GovInsuranceBalanceAmountHistory } from "../../shared/ins-insurance-balance-amount-history.model";
import { GovInsuranceService } from "../../shared/ins-service";
import { GovInsuranceBlService } from "../../shared/insurance.bl.service";

@Component({
  selector: 'gov-insurance-balance-history',
  templateUrl: './gov-ins-price-history.component.html'
})

export class GovInsUpdateBalanceHistoryComponent {

  //   @Input("gov-insurance-detail")
  // public insuraceDetail: InsuranceVM = new InsuranceVM();
  @Input("patientId")
  public patientInfo: Patient;
  @Output("balance-History")
  balanceHistory: EventEmitter<Object> = new EventEmitter<Object>();
  //@Input("patient")
  // public patInfo: any;
  public showBalanceHistoryPage: boolean = false;
  public Balhistory: GovInsuranceBalanceAmountHistory = new GovInsuranceBalanceAmountHistory();

  constructor(
    public patientService: PatientService,
    public msgBoxServ: MessageboxService,
    public insuranceBlService: GovInsuranceBlService,
    public insuranceService: GovInsuranceService,
    public renderer: Renderer2, public coreService: CoreService) {

    this.GetInsBalanceHistory();
  }

  GetInsBalanceHistory() {
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
    if (res.Status == "OK" && res.Results != null) {
      this.showBalanceHistoryPage = true;
      this.Balhistory = res.Results
    } else {
      this.msgBoxServ.showMessage("error", ['There is no balance history found, Please try again']);
    }
  }
  Close() {
    this.showBalanceHistoryPage = false;
    this.balanceHistory.emit({ action: "balance-History", PatientId: this.Balhistory.PatientId });
    this.patientInfo = null;
  }
}