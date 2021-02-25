import { Component } from '@angular/core';
import { Input, Output, EventEmitter, OnInit } from "@angular/core";
import { ADT_BLService } from '../shared/adt.bl.service';
import { PatientBedInfo } from '../shared/patient-bed-info.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { Bed } from '../shared/bed.model';
import { Ward } from '../shared/ward.model';
import { Patient } from '../../patients/shared/patient.model';
import { BedFeature } from '../shared/bedfeature.model';
import { PatientBedInfoVM } from '../shared/admission.view.model';
import * as moment from 'moment/moment';
import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'

@Component({
  selector: "patient-admission-history",
  templateUrl: "./patient-bed-history.html"
})
export class PatientBedHistory {

  public patWardList: Array<PatientBedInfoVM> = new Array<PatientBedInfoVM>();
  public showDatePicker: Array<boolean> = [];
  public prevStartedOn: string = null;
  public prevEndedOn: string = null;
  public validEndDate: boolean = true;
  public validStartDate: boolean = true;
  public showEdit: boolean = true;
  @Input()
  public ipVisitid: number;

  @Output("change-started-date")
  changeBedInfo: EventEmitter<Object> = new EventEmitter<Object>();

  public AdmissionDateValidator: FormGroup = null;
  constructor(public admissionBLService: ADT_BLService,
    public msgBoxServ: MessageboxService) {
    this.SetValidators();
  }
  ngOnInit() {
    if (this.ipVisitid) {
      this.GetPatientWardInfo(this.ipVisitid);
      this.validStartDate = true;
      this.validEndDate = true;
    }
  }

  public GetPatientWardInfo(PatVisitId: number) {
    this.admissionBLService.GetAdmittedPatientInfo(PatVisitId)
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.patWardList = res.Results;
            this.patWardList.forEach(a => {
              this.showDatePicker.push(false);
            });
            this.patWardList = this.patWardList.slice();

          }
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
        });
  }
  EditSelectedInfoOnClick(index: number) {
    if (this.showEdit == true) {
      this.showEdit = false;
      this.showDatePicker[index] = true;
      this.prevStartedOn = this.patWardList[index].StartedOn;
      this.prevEndedOn = this.patWardList[index].EndedOn;
      this.UpdateValidator(index);
    }

  }
  CloseDateChange(index: number) {
    this.showEdit = true;
    this.validStartDate = true;
    this.validEndDate = true;
    this.showDatePicker[index] = false;
    this.patWardList[index].StartedOn = this.prevStartedOn;
    this.patWardList[index].EndedOn = this.prevEndedOn;
  }

  SaveChanges(index: number, showConfirmAlert = true) {
    for (var i in this.AdmissionDateValidator.controls) {
      this.AdmissionDateValidator.controls[i].markAsDirty();
      this.AdmissionDateValidator.controls[i].updateValueAndValidity();
    }
    if (this.IsValid(undefined, undefined) && this.validStartDate && this.validEndDate) {
      if (this.patWardList[index].Action == "admission") {
        if (showConfirmAlert) {
          //we need to be sure if the user wants to change the admission info
          let sure = window.confirm("It will change the patient's admission date. Do you want to continue?");
          if (sure) {
            this.Update(index);
          }
        }
        else {
          return;
        }
      }
      else {
        this.Update(index);
      }

    }


  }
  public Update(index: number) {
    this.admissionBLService.UpdateAdmittedPatientInfo(this.patWardList[index])
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("success", ["Dates changed successfully."]);
          this.GetPatientWardInfo(this.ipVisitid);
          this.changeBedInfo.emit();
          this.showDatePicker[index] = false;
          this.showEdit = true;
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      });
  }
  public SetValidators() {
    var _formBuilder = new FormBuilder();
    this.AdmissionDateValidator = _formBuilder.group({
      'StartedOn': ['', Validators.compose([Validators.required])],
      'EndedOn': ['', Validators.compose([])]
    });
  }

  public UpdateValidator(index) {
    if (this.patWardList[index].EndedOn) {
      this.AdmissionDateValidator.controls['EndedOn'].validator = Validators.compose([Validators.required]);
    }
    else {
      this.AdmissionDateValidator.controls['EndedOn'].validator = Validators.compose([]);
    }
    this.AdmissionDateValidator.controls['EndedOn'].updateValueAndValidity();
  }
  public compareStartDate(index: number) {
    //if (this.patWardList.length == 1) {
    //    if ((moment(this.patWardList[index].StartedOn).diff(moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm')) > 0)
    //        || !this.patWardList[index].StartedOn)
    //        this.validStartDate = false;
    //    else
    //        this.validStartDate = true;
    //}
    //else if (this.patWardList.length > 1)
    //{
    //    if ((typeof this.patWardList[index + 1] == 'undefined') ? (moment(this.patWardList[index].StartedOn).diff(this.patWardList[index].EndedOn) < 0) : (moment(this.patWardList[index].StartedOn).diff(this.patWardList[index + 1].StartedOn) < 0)
    //        || (moment(this.patWardList[0].StartedOn).diff(this.patWardList[index].StartedOn) < 0)
    //        || (moment(this.patWardList[index].StartedOn).diff(moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm')) > 0) || (moment(this.patWardList[index].StartedOn).diff(this.patWardList[index].EndedOn) < 0)
    //        || !this.patWardList[index].StartedOn)                                                                                                                                                                                                                                                                                                                                                                                                                                       
    //        this.validStartDate = false;
    //    else
    //        this.validStartDate = true;
    //}

    if ((moment(this.patWardList[index].StartedOn).diff(moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm')) > 0)
      || !this.patWardList[index].StartedOn || (moment(this.patWardList[index].EndedOn).diff(this.patWardList[index].StartedOn) < 0) || ((typeof this.patWardList[index + 1] == 'undefined') ? (moment(this.patWardList[index].EndedOn).diff(this.patWardList[index].StartedOn) < 0) : (moment(this.patWardList[index].StartedOn).diff(this.patWardList[index + 1].StartedOn) < 0))) {
      this.validStartDate = false;
    }
    else {
      this.validStartDate = true;
    }

  }

  public compareEndDate(index: number) {
    //if (this.patWardList[index].EndedOn)
    //    if ((moment(this.patWardList[index].EndedOn).diff(moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm')) > 0) || (moment(this.patWardList[index].EndedOn).diff(this.patWardList[index].StartedOn) < 0)
    //        || !this.patWardList[index].EndedOn)
    //        this.validStartDate = false;
    //    else
    //        this.validStartDate = true;
    if ((moment(this.patWardList[index].EndedOn).diff(moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm')) > 0)
      || !this.patWardList[index].EndedOn || (moment(this.patWardList[index].EndedOn).diff(this.patWardList[index].StartedOn) < 0) || ((typeof this.patWardList[index - 1] == 'undefined') ? (moment(this.patWardList[index].EndedOn).diff(this.patWardList[index].StartedOn) < 0) : (moment(this.patWardList[index - 1].EndedOn).diff(this.patWardList[index].EndedOn) < 0)))
      this.validEndDate = false;
    else
      this.validEndDate = true;

  }



  public IsDirty(controlname): boolean {
    if (controlname == undefined) {
      return this.AdmissionDateValidator.dirty;
    }
    else {
      return this.AdmissionDateValidator.controls[controlname].dirty;
    }
  }

  public IsValid(controlname, typeofvalidation): boolean {
    if (this.AdmissionDateValidator.valid) {
      return true;
    }
    if (controlname == undefined) {
      return this.AdmissionDateValidator.valid;
    }
    else {
      return !(this.AdmissionDateValidator.controls[controlname].hasError(typeofvalidation));
    }
  }


}

