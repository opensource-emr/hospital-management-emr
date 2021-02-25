import { Component, ChangeDetectorRef } from '@angular/core';
import { VisitService } from '../../appointments/shared/visit.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { PatientService } from '../../patients/shared/patient.service';
import * as moment from 'moment/moment';
import { DoctorNotes } from './doctors-notes.model.';
import { IOAllergyVitalsBLService } from '../../clinical/shared/io-allergy-vitals.bl.service';
import { Vitals } from '../../clinical/shared/vitals.model';
import { Patient } from '../../patients/shared/patient.model';
import { Visit } from '../../appointments/shared/visit.model';
import { CoreService } from '../../core/shared/core.service';

@Component({
  templateUrl: './doctors-notes.html'
})
//This is Progress Notes of Clinical-- So.. Confusing.. 
export class DoctorsNotesComponent {
  public showAddVital: boolean = false;
  public doctorNote: DoctorNotes = new DoctorNotes();
  public vitalsList: Array<Vitals> = new Array<Vitals>();
  public date: string = null;
  public doctorsignature: string = null;
  public pat: Patient = new Patient();
  public patVisit: Visit = new Visit();
  public vitals: Vitals = new Vitals();
  public painDataList: Array<any> = new Array<any>();
  public hospitalName: string = null;

  constructor(public visitService: VisitService, public msgBoxServ: MessageboxService,
    public patientService: PatientService, public ioAllergyVitalsBLService: IOAllergyVitalsBLService,
    public changeDetector: ChangeDetectorRef, public coreService: CoreService) {
    this.pat = this.patientService.globalPatient;
    this.patVisit = this.visitService.globalVisit;
    this.pat.DateOfBirth = moment(this.patientService.globalPatient.DateOfBirth).format("YYYY-MM-DD");
    this.date = moment().format("YYYY-MM-DD,h:mm:ss a");
    this.hospitalName = this.coreService.GetHospitalName();
    this.GetPatientVitalsList();
    this.GetProviderLongSignature();
  }
  GetPatientVitalsList(): void {
    let patientVisitId = this.visitService.globalVisit.PatientVisitId;
    this.ioAllergyVitalsBLService.GetPatientVitalsList(patientVisitId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.CallBackGetPatientVitalList(res.Results);
        }
        else {
          this.msgBoxServ.showMessage("failed", ['Failed. please check log for details.'], res.ErrorMessage);

        }
      },
        err => { this.msgBoxServ.showMessage("error", [err.ErrorMessage]); });
  }

  CallBackGetPatientVitalList(_vitalsList) {
    if (_vitalsList.length) {
      var len = _vitalsList.length - 1;
      this.vitals = _vitalsList[len];
      //looping through the vitalsList to check if any object contains height unit as inch so that it can be converted to foot inch.
      for (var i = 0; i < _vitalsList.length; i++) {
        if (_vitalsList[i].HeightUnit && _vitalsList[i].HeightUnit == "inch") {
          //incase of footinch we're converting and storing as inch.
          //converting back for displaying in the format foot'inch''
          _vitalsList[i].Height = this.ioAllergyVitalsBLService.ConvertInchToFootInch(_vitalsList[i].Height);
        }
        var jsonData = JSON.parse(_vitalsList[i].BodyPart);
        this.painDataList.push(jsonData);
      }
      this.vitalsList = _vitalsList;
    } else {
      this.vitals.Height = null;
      this.vitals.Weight = null;
      this.vitals.BMI = null;
      this.vitals.Temperature = null;
      this.vitals.Pulse = null;
      this.vitals.RespiratoryRatePerMin = null;
      this.vitals.BPSystolic = null;
      this.vitals.SpO2 = null;
    }
  }
  // -----------To get the docors signature 
  GetProviderLongSignature(): void {
    let providerId = this.visitService.globalVisit.ProviderId;
    this.ioAllergyVitalsBLService.GetProviderLongSignature(providerId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.doctorsignature = (res.Results[0].LongSignature);
        }
        else {
          this.msgBoxServ.showMessage("failed", ['Failed. please check log for details.'], res.ErrorMessage);

        }
      },
        err => { this.msgBoxServ.showMessage("error", [err.ErrorMessage]); });
  }




  showAddVitals() {
    this.showAddVital = false;
    this.changeDetector.detectChanges();
    this.showAddVital = true;
  }

  CallBackAdd($event) {
    if ($event.vitals != null && $event.submit) {
      if ($event.vitals.HeightUnit == "inch") {
        //incase of footinch we're converting and storing as inch.
        //converting back for displaying in the format foot'inch''
        $event.vitals.HeightUnit == "footinch";
        $event.vitals.Height = this.ioAllergyVitalsBLService.ConvertInchToFootInch($event.vitals.Height);
      }
      this.vitals = $event.vitals;
    }
    this.showAddVital = false;
  }

  print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    //popupWinindow.document.write('<html><head><link href="../assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" /><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
    popupWinindow.document.write('<html><head><link href="../../assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" /><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
    //<style>#printpage{ width: 4960px; height: 7016px; } </style>
    popupWinindow.document.close();

  }

}  
