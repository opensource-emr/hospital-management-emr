import { Component, ChangeDetectorRef } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../../security/shared/security.service"
import { VisitService } from '../../../appointments/shared/visit.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PatientService } from '../../../patients/shared/patient.service';
import { EyeExaminationBLService } from '../../shared/eye-examination.bl.service'
import * as moment from 'moment/moment';
import { Patient } from '../../../patients/shared/patient.model';
import { Visit } from '../../../appointments/shared/visit.model';
import { CoreService } from '../../../core/shared/core.service';
import { EyeModel } from '../shared/Eye.model';
@Component({
  templateUrl: "./eye-examination.html",
  styleUrls: ['./eye-examination.component.css']
})
export class EyeExaminationComponent {
  public date: string = null;
  public doctorsignature: string = null;
  public pat: Patient = new Patient();
  public patVisit: Visit = new Visit();
  public hospitalName: string = null;

  public EyeMaster: EyeModel = new EyeModel();
  public update: boolean = false;


  constructor(public visitService: VisitService,
    public msgBoxServ: MessageboxService,
    public patientService: PatientService,
    public eyeService: EyeExaminationBLService,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService) {
    this.pat = this.patientService.globalPatient;
    this.patVisit = this.visitService.globalVisit;
    this.pat.DateOfBirth = moment(this.patientService.globalPatient.DateOfBirth).format("YYYY-MM-DD");
    this.date = moment().format("YYYY-MM-DD,h:mm:ss a");
    this.hospitalName = this.coreService.GetHospitalName();
    //for eye master
    this.EyeMaster.PatientId = this.pat.PatientId;
    this.EyeMaster.VisitId = this.patVisit.PatientVisitId;
    this.EyeMaster.ProviderId = this.patVisit.ProviderId;
    this.EyeMaster.VisitDate = new Date(this.patVisit.VisitDate);
    if (this.eyeService.MasterId != 0) {
      this.LoadEMR(this.eyeService.MasterId);
    }
  }

  ngOnDestroy() {
    this.eyeService.MasterId = 0;
  }
  LoadEMR(MasterId: number) {
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
          this.update = true;
        }
        else { this.msgBoxServ.showMessage("Failed", ["Something went wrong."]); }
      })
  }

  SaveAll() {
    //for CLN_MST_EYE instance
    this.eyeService.PostMasterEye(this.EyeMaster)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", ["Data added."]);
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Add failed. Single Visit cannot have multiple EMR."]);
        }
      });
  }
  Update() {
    this.eyeService.UpdateMasterEye(this.EyeMaster)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", ["Update Succesful."]);
        }
        else {
          this.msgBoxServ.showMessage("Failed",["Something went wrong."]);
        }
      });
  }

}
