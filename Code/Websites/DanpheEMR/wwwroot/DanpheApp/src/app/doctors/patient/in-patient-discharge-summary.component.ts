import { Component } from "@angular/core";
import { PatientService } from "../../patients/shared/patient.service";
import { Router } from "@angular/router";
import { VisitService } from "../../appointments/shared/visit.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { DoctorsBLService } from "../shared/doctors.bl.service";
import { Patient } from "../../patients/shared/patient.model";
import { ADT_BLService } from "../../adt/shared/adt.bl.service";

@Component({
  templateUrl: "./in-patient-discharge-summary.html"
})

export class InPatientDischargeSummaryComponent {

  public currentPatient: Patient = null;
  public patientId: number = null;
  public patientVisitId: number = null;
  public showDischargeSummaryView: boolean = false;
  public showDischargeSummaryAdd: boolean = false;
  public selectedPatient: any;

  constructor
    (public patientservice: PatientService,
      public router: Router,
      public visitservice: VisitService,
      public msgBoxServ: MessageboxService,
      public doctorsBLService: DoctorsBLService,
      public adtBlService: ADT_BLService) {
    this.currentPatient = new Patient();
    this.patientVisitId = this.visitservice.globalVisit.PatientVisitId;
    this.patientId = this.visitservice.globalVisit.PatientId;
    this.GetPatientPlusBedInfo();
  }

  public GetPatientPlusBedInfo() {
    this.adtBlService.GetPatientPlusBedInfo(this.patientId, this.patientVisitId).subscribe(res => {
      if (res.Status == "OK" && res.Results.length != 0) {
        this.selectedPatient = res.Results[0];
        var selectedPatient = res.Results[0];

        if (selectedPatient) {
          if (!selectedPatient.IsSubmitted) { // if (IsSubmitted==false)            
            this.showDischargeSummaryView = false;
            this.showDischargeSummaryAdd = true;
          }
          else { // else, discharge Summary has been submitted

            this.showDischargeSummaryAdd = false;
            this.showDischargeSummaryView = true;
            this.msgBoxServ.showMessage("Warning", ["Discharge note is already Finalized !! You can only view it !"]);
          }
        }
      }
    });
  }

  public CallbackFromViewPage(data) {
    this.showDischargeSummaryView = false
    this.showDischargeSummaryAdd = true;

  }

  public CallBackFromAddEdit(data) {
    this.showDischargeSummaryView = true
    this.showDischargeSummaryAdd = false;
  }

}
