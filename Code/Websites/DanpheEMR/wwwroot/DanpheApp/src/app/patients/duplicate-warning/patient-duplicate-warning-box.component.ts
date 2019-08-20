import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Patient } from "../shared/patient.model";
import * as moment from 'moment/moment';
import { PatientService } from "../shared/patient.service";


@Component({
  selector: "patient-duplicate-warning-box",
  templateUrl: "./patient-duplicate-warning-box.html",
})

export class PatientDuplicateWarningBox {

  @Input("currentPatInfo")
  public Patient: Patient = new Patient();

  @Input("btnActionName")
  public btnActionName: string = null;

  @Input("matchedPatResult")
  public matchedPatResult: any;

  public matchedPatientList: Array<Patient> = new Array<Patient>();

  @Output("emit-close-action")
  emitCloseAction: EventEmitter<Object> = new EventEmitter<Object>();

  loading: boolean = false;

  constructor(public patientService: PatientService) {
    this.patientService;
  }

  ngOnInit() {
    this.patientService;
    this.Patient;
    this.matchedPatResult;
    this.setMatchingPatientLists();
  }

  setMatchingPatientLists() {
    if (this.matchedPatResult) {
      this.matchedPatientList = new Array<Patient>();

      var nowYear: number = Number(moment().format("YYYY"));
      var patYear: number = Number(this.Patient.Age);

      if (this.Patient.AgeUnit == 'Y') {
        this.matchedPatResult.forEach(patient => {
          var originalYear: number = Number(moment(patient.DateOfBirth).format("YYYY"));
          var diff: number = (nowYear - originalYear - patYear)
          if ((diff > -3 && diff < 3) || (this.Patient.PhoneNumber == patient.PhoneNumber)) {
            this.matchedPatientList.push(patient);
            return true;
          } else {
            return false;
          }
        });
      }
      else {
        this.matchedPatientList = this.matchedPatResult;
      }


      if (this.matchedPatientList.length) {
        let PatientFullName = this.Patient.FirstName.trim() + " " + this.Patient.LastName.trim();
        this.matchedPatientList.forEach(a => {
          if (a.FullName.toLowerCase() == PatientFullName.toLowerCase()) {
            a["NameExists"] = true;

          } else {
            a["NameExists"] = false;
          }

          if (a.PhoneNumber == this.Patient.PhoneNumber) {
            a["NumberExists"] = true;
          } else {
            a["NumberExists"] = false;
          }
        })
      }
    }

  }

  EditPatientDetails(patientId) {
    this.emitCloseAction.emit({ action: "use-existing", data: patientId });
  }
  //For New patient
  ProceedAnyway() {
    this.emitCloseAction.emit({ action: "add-new", data: null });
  }
  //Update new Paient with recent Information
  UpdateAnyway() {
    this.emitCloseAction.emit({ action: "update-patient", data: null });
  }
  Close() {
    this.emitCloseAction.emit({ action: "close", data: null });
  }
}
