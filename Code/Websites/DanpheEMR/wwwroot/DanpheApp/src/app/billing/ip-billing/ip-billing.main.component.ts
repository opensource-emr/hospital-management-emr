import { Component } from "@angular/core";
//Remove below imports and move the dl calling logic to bl/dl later on.
import { Router } from "@angular/router";
import { PatientService } from '../../patients/shared/patient.service';
import { SecurityService } from "../../security/shared/security.service";
import { CallbackService } from "../../shared/callback.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../shared/danphe-grid/NepaliColGridSettingsModel";
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant";
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { DLService } from "../../shared/dl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";


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
    public messageBoxService: MessageboxService) {
    this.currentCounter = this.securityService.getLoggedInCounter().CounterId;
    if (this.currentCounter < 1) {
      this.callbackService.CallbackRoute = '/Billing/InpatBilling';
    } else {
      this.LoadInpatientList();
      this.ipPatientGridColumns = GridColumnSettings.IpBillPatientSearch;
      this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('AdmittedDate', true));
    }
  }

  LoadInpatientList() {
    this.dlService.Read("/api/IpBilling/AdmittedPatients")
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
          this.messageBoxService.showMessage("failed", ["Unable to get ip-patient list."]);
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
            this.callbackService.CallbackRoute = '/Billing/InpatBilling';
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
