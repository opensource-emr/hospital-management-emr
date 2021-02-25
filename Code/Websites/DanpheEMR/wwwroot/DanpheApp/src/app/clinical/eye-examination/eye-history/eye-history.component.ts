import { Component, ChangeDetectorRef } from '@angular/core'
import { RouterOutlet, RouterModule,Router } from '@angular/router'
import { SecurityService } from "../../../security/shared/security.service"
import { VisitService } from '../../../appointments/shared/visit.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PatientService } from '../../../patients/shared/patient.service';
import { EyeExaminationBLService } from '../../shared/eye-examination.bl.service'
import * as moment from 'moment/moment';

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { Patient } from '../../../patients/shared/patient.model';
import { Visit } from '../../../appointments/shared/visit.model';
import { CoreService } from '../../../core/shared/core.service';
import { EyeModel } from '../shared/Eye.model';

@Component({
  templateUrl: "./eye-history.html"
})
export class EyeHistoryComponent {
  public date: string = null;
  public doctorsignature: string = null;
  public pat: Patient = new Patient();
  public patVisit: Visit = new Visit();
  public hospitalName: string = null;
  public eyeSlip: boolean = false;
  public EyeHistoryList: Array<EyeModel> = new Array<EyeModel>();
  public EyeHistoryColumn: Array<any> = null;
  public EyeMaster: EyeModel = new EyeModel();

  constructor(public visitService: VisitService,
    public msgBoxServ: MessageboxService,
    public patientService: PatientService,
    public eyeService: EyeExaminationBLService,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService,
    public router: Router) {
    this.EyeHistoryColumn = GridColumnSettings.EyeHistoryList;
    this.pat = this.patientService.globalPatient;
    this.patVisit = this.visitService.globalVisit;
    this.pat.DateOfBirth = moment(this.patientService.globalPatient.DateOfBirth).format("YYYY-MM-DD");
    this.date = moment().format("YYYY-MM-DD,h:mm:ss a");
    this.hospitalName = this.coreService.GetHospitalName();

    this.GetPatientHistory();
  }
  Close() {
    this.eyeSlip = false;
    this.eyeService.MasterId = 0;
  }

  GetPatientHistory() {
    this.eyeService.GetEyeHistoryByPatientId(this.pat.PatientId)
      .subscribe(res => {
        this.EyeHistoryList = res.Results
      })
  }
  //grid actions for eye history list
  EyeGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view-detail":
        {
          var MasterId = $event.Data.Id;
          this.eyeService.MasterId = MasterId;
          this.eyeSlip = true;
            this.eyeService.LoadEyeEMR(MasterId)
              .subscribe(res => {
                if (res.Status == "OK") {
                  this.EyeMaster = Object.assign(this.EyeMaster, res.Results);
                  this.EyeMaster.RefractionOD.map(a => a.Date = moment(a.Date).format("YYYY-MM-DD"));
                  this.EyeMaster.RefractionOS.map(a => a.Date = moment(a.Date).format("YYYY-MM-DD"));
                  this.EyeMaster.PachymetryOD.map(a => a.Date = moment(a.Date).format("YYYY-MM-DD"));
                  this.EyeMaster.PachymetryOS.map(a => a.Date = moment(a.Date).format("YYYY-MM-DD"));
                  this.EyeMaster.WavefrontOD.map(a => a.Date = moment(a.Date).format("YYYY-MM-DD"));
                  this.EyeMaster.WavefrontOS.map(a => a.Date = moment(a.Date).format("YYYY-MM-DD"));
                  this.EyeMaster.ORAOD.map(a => a.Date = moment(a.Date).format("YYYY-MM-DD"));
                  this.EyeMaster.ORAOS.map(a => a.Date = moment(a.Date).format("YYYY-MM-DD"));
                }
                else { this.msgBoxServ.showMessage("Failed", ["Something went wrong."]); }
              })
          
        }
        break;
      case "edit":
        {
          var MasterId = $event.Data.Id;
          this.eyeService.MasterId = MasterId;
          this.router.navigate(['/Doctors/PatientOverviewMain/Clinical/EyeExamination/NewEMR']);
        }
        break;
    }
  }

}
