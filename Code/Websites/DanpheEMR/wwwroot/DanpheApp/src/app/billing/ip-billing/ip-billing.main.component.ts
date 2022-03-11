import { Component } from "@angular/core";
//Remove below imports and move the dl calling logic to bl/dl later on.
import { DLService } from "../../shared/dl.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { PatientService } from '../../patients/shared/patient.service';
import { SecurityService } from "../../security/shared/security.service";
import { CallbackService } from "../../shared/callback.service";
import { Router } from "@angular/router";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../shared/danphe-grid/NepaliColGridSettingsModel";


@Component({
  templateUrl: './ip-billing.main.html'
})
export class IpBillMainComponent {
  public showPatientContext: boolean = false;
  public allInpatList: Array<any> = [];

  public selPatId: number = 0;
  public selVisitId: number = 0;
  public ipPatientGridColumns: Array<any> = null;
  public currentCounter: number = null;

  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(public dlService: DLService,
    public securityService: SecurityService,
    public callbackService: CallbackService,
    public patientService: PatientService,
    public router: Router,
    public msgBoxServ: MessageboxService) {
    this.currentCounter = this.securityService.getLoggedInCounter().CounterId;
    if (this.currentCounter < 1) {
      this.callbackService.CallbackRoute = '/Billing/InpatBilling'
      this.router.navigate(['/Billing/CounterActivate']);
    } else {
      this.LoadInpatientList();
      this.ipPatientGridColumns = GridColumnSettings.IpBillPatientSearch;
      this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('AdmittedDate', true));
    }
  }

  LoadInpatientList() {
    this.dlService.Read("/api/IpBilling?reqType=list-ip-patients")
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.allInpatList = res.Results;
          //ward/bed search wasnot working from grid so combining the columns as one to fill the grid data..
          if (this.allInpatList && this.allInpatList.length > 0) {
            this.allInpatList.forEach(ipInfo => {
              //below column will be added in all rows and also used as fieldName in grid-column-settings.
              ipInfo["WardBedInfo"] = ipInfo.BedInformation.Ward + "/" + ipInfo.BedInformation.BedCode;
            });
          }
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get ip-patient list."]);
          console.log(res.ErrorMessage);
        }
      });
  }


  OnSummaryWindowClosed($event) {
    this.showPatientContext = false;
    this.selPatId = this.selVisitId = 0;
    //Reload the summary after single patient context is closed.
    this.LoadInpatientList();
  }
  ShowPatientProvisionalItems(row): void {
    //patient mapping later used in receipt print
    var patient = this.patientService.CreateNewGlobal();
    patient.ShortName = row.PatientName;
    patient.PatientCode = row.PatientNo;
    patient.DateOfBirth = row.DateOfBirth;
    patient.PhoneNumber = row.PhoneNumber;
    patient.Gender = row.Gender;
  }
  IpBillingGridAction($event: GridEmitModel) {
    var selPat = $event.Data;
    switch ($event.Action) {
      case "view-summary":
        {
          if (this.securityService.getLoggedInCounter().CounterId < 1) {
            this.callbackService.CallbackRoute = '/Billing/InpatBilling'
            this.router.navigate(['/Billing/CounterActivate']);
          }
          this.selPatId = selPat.PatientId;
          this.selVisitId = selPat.VisitId;
          this.ShowPatientProvisionalItems(selPat);

          //assign necessary values of patient here..
          this.showPatientContext = true;

        }
        break;
      default:
        break;
    }
  }
}
