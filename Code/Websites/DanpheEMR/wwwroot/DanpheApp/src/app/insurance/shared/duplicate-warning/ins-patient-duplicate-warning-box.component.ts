import { Component, Input, Output, EventEmitter } from "@angular/core";
import * as moment from 'moment/moment';
import {Patient} from '../../../patients/shared/patient.model'


@Component({
  selector: "ins-patient-duplicate-warning-box",
  templateUrl: "./ins-patient-duplicate-warning-box.html",
})

export class InsPatientDuplicateWarningBox {

  @Input("currentPatInfo")
  public Patient: Patient = new Patient();

  @Input("matchedPatResult")
  public matchedPatResult: any;

  public matchedPatientList: Array<Patient> = new Array<Patient>();

  @Output("emit-close-action")
  emitCloseAction: EventEmitter<Object> = new EventEmitter<Object>();

  @Input("byPassClientCheck")
  public byPassClientCheck: boolean = false;;

  loading: boolean = false;

  constructor() {
  }

  ngOnInit() {
    this.Patient;
    this.matchedPatResult;
    this.setMatchingPatientLists();
  }

  setMatchingPatientLists() {
    if (this.matchedPatResult) {
      this.matchedPatientList = new Array<Patient>();
      if (!this.byPassClientCheck) {
        var nowYear: number = Number(moment().format("YYYY"));
        var patYear: number = Number(this.Patient.Age);

        if (this.Patient.AgeUnit == 'Y') {
          this.matchedPatResult.forEach(patient => {
            var originalYear: number = Number(moment(patient.DateOfBirth).format("YYYY"));
            var diff: number = (nowYear - originalYear - patYear)
            if ((diff > -3 && diff < 3) || (this.Patient.PhoneNumber == patient.PhoneNumber || this.Patient.Ins_NshiNumber == patient.Ins_NshiNumber )) {
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
      } else {
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

          if (a.Ins_NshiNumber.toLowerCase() == this.Patient.Ins_NshiNumber.toLowerCase()) {
            a["Ins_NshiNumberExists"] = true;
          } else {
            a["Ins_NshiNumberExists"] = false;
          }
        })
      }
    }

  }

  Close() {
    this.emitCloseAction.emit({ action: "close", data: null });
  }
}
