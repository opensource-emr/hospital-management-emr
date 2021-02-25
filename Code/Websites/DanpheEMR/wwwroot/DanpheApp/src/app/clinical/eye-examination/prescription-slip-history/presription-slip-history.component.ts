import { Component, ChangeDetectorRef } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router'
import { SecurityService } from "../../../security/shared/security.service"
import { VisitService } from '../../../appointments/shared/visit.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PatientService } from '../../../patients/shared/patient.service';
import { PrescriptionSlipBLService } from '../prescription-slip/shared/prescription-slip.bl.service'
import * as moment from 'moment/moment';

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { Patient } from '../../../patients/shared/patient.model';
import { Visit } from '../../../appointments/shared/visit.model';
import { CoreService } from '../../../core/shared/core.service';
import { PrescriptionSlipModel } from "../prescription-slip/shared/PrescriptionSlip.model";
@Component({
  templateUrl: "./prescription-slip-history.html"
})
export class PrescriptionSlipHistoryComponent {
  public date: string = null;
  public doctorsignature: string = null;
  public fullname: string = null;
  public age: string = "";
  public Patid: number = 0;
  public pat: Patient = new Patient();
  public patVisit: Visit = new Visit();
  public hospitalName: string = null;
  public PrescriptionReceipt: boolean = false;

  public PrescriptionHistoryList: Array<PrescriptionSlipModel> = new Array<PrescriptionSlipModel>();
  public PrescriptionDataList: Array<PrescriptionSlipModel> = new Array<PrescriptionSlipModel>();
  public PrescriptionHistoryColumn: Array<any> = null;
  public PrescriptionSlipMaster: PrescriptionSlipModel = new PrescriptionSlipModel();

  constructor(public visitService: VisitService,
    public msgBoxServ: MessageboxService,
    public patientService: PatientService,
    public prescriptionslipService: PrescriptionSlipBLService,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService,
    public router: Router) {

    this.PrescriptionHistoryColumn = GridColumnSettings.PrescriptionSlipList;

    this.pat = this.patientService.globalPatient;
    console.log(this.pat);
    this.patVisit = this.visitService.globalVisit;
    this.pat.DateOfBirth = moment(this.patientService.globalPatient.DateOfBirth).format("YYYY-MM-DD");
    this.date = moment().format("YYYY-MM-DD,h:mm:ss a");
    this.hospitalName = this.coreService.GetHospitalName();
    this.GetPatientHistory();
  }

  GetPatientHistory() {
    this.prescriptionslipService.GetPrescriptionHistoryByPatientId(this.pat.PatientId)
      .subscribe(res => {
        this.PrescriptionHistoryList = res.Results;
     
      })
  }
  Close() {
    this.PrescriptionReceipt = false ;
  }

  print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=1600,height=900,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" /></head><body onload="window.print()">' + printContents + '</body></html>');

    popupWinindow.document.close();

  }

  //grid actions for eye history list
  PrescriptionGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view-detail":
        {
          var MasterId = $event.Data.Id;
          this.prescriptionslipService.MasterId = MasterId;
          this.router.navigate(['/Doctors/PatientOverviewMain/Clinical/EyeExamination/PrescriptionslipHistory']);
          //for prescription slip history
          this.PrescriptionSlipMaster.PatientId = this.pat.PatientId;
          this.PrescriptionSlipMaster.VisitId = this.patVisit.PatientVisitId;
          this.PrescriptionSlipMaster.ProviderId = this.patVisit.ProviderId;
          this.PrescriptionSlipMaster.VisitDate = new Date(this.patVisit.VisitDate);
            this.prescriptionslipService.LoadPrescriptionDetailbyMasterId(MasterId)
              .subscribe(res => {
                if (res.Status == "OK") {
                  this.PrescriptionDataList = res.Results;
                  this.PrescriptionReceipt = true;
                  this.fullname = this.pat.ShortName; 
                  this.age = this.pat.Age;
                  this.Patid = this.pat.PatientId;
               }
                else { this.msgBoxServ.showMessage("Failed", ["Something went wrong."]); }
              })
          break;
        }

      case "edit":
        {
          var MasterId = $event.Data.Id;
          this.prescriptionslipService.MasterId = MasterId;
          this.router.navigate(['/Doctors/PatientOverviewMain/Clinical/EyeExamination/PrescriptionslipHistory']);
        }
      default:
        break;
    }
  }

}
