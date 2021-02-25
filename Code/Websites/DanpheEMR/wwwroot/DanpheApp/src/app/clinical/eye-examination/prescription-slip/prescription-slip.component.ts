import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import * as moment from 'moment/moment';
import { PrescriptionSlipModel } from './shared/PrescriptionSlip.model';
import { PrescriptionSlipBLService } from '../../eye-examination/prescription-slip/shared/prescription-slip.bl.service';
import { Patient } from '../../../patients/shared/patient.model';
import { Visit } from '../../../appointments/shared/visit.model';
import { PatientService } from '../../../patients/shared/patient.service';
import { VisitService } from '../../../appointments/shared/visit.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

@Component({
  selector: "prescription-slip",
  templateUrl: "./prescription-slip.html" ,
  styleUrls: ['./prescription-slip.component.css']
})
export class PrescriptionSlipComponent {
  coreservice: any;
  router: any;
  public pat: Patient = new Patient();
  public patVisit: Visit = new Visit();
  public PrescriptionSlipMaster: PrescriptionSlipModel = new PrescriptionSlipModel();

  constructor(public PrescriptionSlipService: PrescriptionSlipBLService,
    public patientService: PatientService,
    public visitService: VisitService,
    public msgBoxServ: MessageboxService
  )
  {
    this.PrescriptionSlipMaster.PatientId = this.patientService.globalPatient.PatientId;
    this.PrescriptionSlipMaster.VisitId = this.visitService.globalVisit.PatientVisitId;
    this.PrescriptionSlipMaster.ProviderId = this.visitService.globalVisit.ProviderId;
    this.PrescriptionSlipMaster.VisitDate = new Date(this.patVisit.VisitDate);
  }

  SaveAll() {
    this.PrescriptionSlipService.PostMasterPrescriptionSlip(this.PrescriptionSlipMaster)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", ["Data added."]);
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Add failed.."]);
        }
      });
  }
 
  
}
