import { Component, ChangeDetectorRef, Input, EventEmitter, Output } from "@angular/core";
import { Router } from '@angular/router';
import { ADT_BLService } from '../../shared/adt.bl.service';
import { PatientService } from '../../../patients/shared/patient.service';
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CallbackService } from '../../../shared/callback.service';
import { Bed } from '../../shared/bed.model';
import { Ward } from '../../shared/ward.model';
import { BedFeature } from '../../shared/bedfeature.model';
import { BillingDeposit } from '../../../billing/shared/billing-deposit.model';
import * as moment from 'moment/moment';
import { NepaliDate } from "../../../shared/calendar/np/nepali-dates";
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { CommonFunctions } from '../../../shared/common.functions';
import { CoreService } from "../../../core/shared/core.service";
import { BedReservationInfo } from "../../shared/bed-reservation-info.model";

@Component({
  templateUrl: "./admission-reserve.html",
  selector: 'admission-reserve',
  styles: [`.cstm-pat-registration input.form-control {margin-top: 4px;} .form-body{padding: 0;}`]
})
export class AdmissionReserveComponent {
  @Input("patientVisitId") patientVisitId: number = null;
  @Input("patientId") patientId: number = null;
  @Input("requestingDepartmentName") requestingDepartmentName: string = null;
  @Input("actionName") actionName: string = null;
  @Output("closePopUp") closePopUp: EventEmitter<object> = new EventEmitter<object>();

  public CurrentBedReservation: BedReservationInfo = new BedReservationInfo();

  public wardList: Array<Ward> = new Array<Ward>();
  public bedFeatureList: Array<BedFeature> = new Array<BedFeature>();
  public bedList: Array<Bed> = new Array<Bed>();

  public doctorList: any;
  public filteredDocList: any;
  public selectedDoctor: any;

  public departmentList: any;
  public selectedDept: any;


  public loading: boolean = false;
  public disableFeature: boolean = true;
  public reqDptEditDisabled: boolean = false;

  public admitDateNP: NepaliDate;
  public bedPrice: number = 0;
  public disableBed: boolean = true;

  public bufferDaysMinutes: any = null;
  public isUpdate: boolean = false;
  public reservedBedIdByPat: number = null;

  constructor(
    public npCalendarService: NepaliCalendarService,
    public admissionBLService: ADT_BLService,
    public patientService: PatientService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public callbackservice: CallbackService,
    public router: Router,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService) {

  }

  ngOnInit() {
    this.InitializeData();
  }

  public InitializeData() {
    this.bufferDaysMinutes = this.coreService.ADTReservationBuffer(); //in the form of {days:xx,minutes:xx}
    this.CurrentBedReservation.PatientId = this.patientId;
    this.patientVisitId ? (this.CurrentBedReservation.PatientVisitId = this.patientVisitId) : (this.CurrentBedReservation.PatientVisitId = null);
    this.CurrentBedReservation.AdmissionStartsOn = moment().add(50, 'minutes').format('YYYY-MM-DDTHH:mm');
    let nepDate = this.npCalendarService.ConvertEngToNepDate(this.CurrentBedReservation.AdmissionStartsOn);
    this.admitDateNP = nepDate;
    this.GetDocDptAndWardList();
  }

  public GetDocDptAndWardList() {
    this.admissionBLService.GetDocDptAndWardList(this.patientId, this.patientVisitId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.doctorList = res.Results.DoctorList;
          this.filteredDocList = this.doctorList;
          this.departmentList = res.Results.DepartmentList;
          this.wardList = res.Results.WardList;
          this.departmentList.unshift({ "Key": 0, "Value": "All" });
          if (this.requestingDepartmentName && this.requestingDepartmentName.trim().length > 0) {
            let dpt = this.departmentList.find(d => d.Value == this.requestingDepartmentName);
            if (dpt && dpt.Key > 0) {
              this.CurrentBedReservation.RequestingDepartmentId = dpt.Key;
              this.selectedDept = dpt.Value;
              this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == dpt.Key);
              this.reqDptEditDisabled = true;
            }
          } else { this.reqDptEditDisabled = false; }


          if (res.Results.BedReservedForCurrentPat &&
            res.Results.BedReservedForCurrentPat.ReservedBedInfoId > 0) {
            this.CurrentBedReservation = Object.assign(new BedReservationInfo(), res.Results.BedReservedForCurrentPat);
            let nepDate = this.npCalendarService.ConvertEngToNepDate(this.CurrentBedReservation.AdmissionStartsOn);
            this.admitDateNP = nepDate;
            this.reservedBedIdByPat = res.Results.BedReservedForCurrentPat.BedId;
            this.isUpdate = true;
            this.SetParametersForUpdate();
          }
        } else {
          this.msgBoxServ.showMessage("error", ['There is some error, cant get the data !', res.ErrorMessage]);
        }
      });
  }

  SetParametersForUpdate() {
    let dpt = this.departmentList.find(d => d.Key == this.CurrentBedReservation.RequestingDepartmentId);
    if (dpt && dpt.Key > 0) {
      this.selectedDept = dpt.Value;
      this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == dpt.Key);
      let adtDoc = this.doctorList.find(dc => dc.Key == this.CurrentBedReservation.AdmittingDoctorId);
      if (adtDoc && adtDoc.Key > 0) { this.selectedDoctor = adtDoc.Value; }
      this.reqDptEditDisabled = true;
    }
    this.WardChanged(this.CurrentBedReservation.WardId, true);
  }


  public WardChanged(wardId: number, useForUpdate: boolean = false) {
    if (wardId) {
      !useForUpdate ? this.CurrentBedReservation.BedFeatureId = null : this.CurrentBedReservation.BedFeatureId;
      this.bedList = null;
      this.admissionBLService.GetWardBedFeatures(wardId)
        .subscribe(res => {
          if (res.Status == 'OK') {
            if (res.Results.length) {
              this.disableFeature = false;
              this.bedFeatureList = res.Results;
              !useForUpdate ? this.CurrentBedReservation.BedFeatureId = this.bedFeatureList[0].BedFeatureId : this.CurrentBedReservation.BedFeatureId;
              this.changeDetector.detectChanges();
              this.GetAvailableBeds(wardId, this.CurrentBedReservation.BedFeatureId);
            }
            else {
              this.msgBoxServ.showMessage("failed", ["No bed features available"]);
              this.bedList = null;
              this.CurrentBedReservation.BedId = null;
              this.disableFeature = false;
            }
          } else {
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
            this.disableFeature = true;
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", ["Failed to get available beds. " + err.ErrorMessage]);
            this.disableFeature = true;
          });
    } else {
      this.disableFeature = true;
    }
  }


  public GetAvailableBeds(wardId: number, bedFeatureId: number) {
    if (wardId && bedFeatureId) {
      var selectedFeature = this.bedFeatureList.find(a => a.BedFeatureId == bedFeatureId);
      this.bedPrice = selectedFeature.BedPrice;

      this.admissionBLService.GetAvailableBeds(wardId, bedFeatureId)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.disableBed = false;
            if (res.Results.availableBeds.length) {
              this.bedList = res.Results.availableBeds;
            }
            else {
              this.msgBoxServ.showMessage("failed", ["No beds are available for this type."]);
              this.bedList = null;
              this.CurrentBedReservation.BedId = null;
            }
          } else {
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
            this.disableBed = true;
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", ["Failed to get available beds. " + err.ErrorMessage]);
            this.disableBed = true;
          });
    }
  }

  myDocListFormatter(data: any): string {
    let html = data["Value"];
    return html;
  }

  myDeptListFormatter(data: any): string {
    let html = data["Value"];
    return html;
  }

  //Nepali date calendar related changes below
  //this method fire when nepali calendar date changed 
  //convert nepali date to english date and assign to english calendar
  NepCalendarOnDateChange() {
    let engDate = this.npCalendarService.ConvertNepToEngDate(this.admitDateNP);
    this.CurrentBedReservation.AdmissionStartsOn = engDate;
  }

  //this method fire when english calendar date changed
  //convert english date to nepali date and assign to nepali canlendar
  EngCalendarOnDateChange() {
    if (this.CurrentBedReservation.AdmissionStartsOn) {
      let nepDate = this.npCalendarService.ConvertEngToNepDate(this.CurrentBedReservation.AdmissionStartsOn);
      this.admitDateNP = nepDate;
    }
  }


  public FilterDoctorList() {
    let deptId = 0;
    if (typeof (this.selectedDept) == 'string') {
      let dept = this.departmentList.find(a => a.Value.toLowerCase() == String(this.selectedDept).toLowerCase());
      if (dept) {
        deptId = dept.Key;
      }
    }
    else if (typeof (this.selectedDept) == 'object' && this.selectedDept.Key) {
      let dept = this.departmentList.find(a => a.Key == this.selectedDept.Key);
      if (dept) {
        deptId = dept.Key;
      }
    }
    this.CurrentBedReservation.AdmittingDoctorId = null;
    this.selectedDoctor = "";

    this.CurrentBedReservation.RequestingDepartmentId = deptId;
    this.filteredDocList = (deptId > 0) ? this.doctorList.filter(doc => doc.DepartmentId == deptId) : this.doctorList;
  }

  public DoctorDdlOnChange() {
    if (this.selectedDoctor) {
      this.CurrentBedReservation.RequestingDepartmentId = this.selectedDoctor.DepartmentId;

      //currently we already have department name in doctor object, so we don't have to filter from departmentlist.
      this.selectedDept = this.selectedDoctor.DepartmentName;
      //this.CurrentBedReservation.RequestingDepartmentId = this.selectedDoctor.DepartmentId;
      //let dept = this.deptList.find(a => a.Key == this.selectedProvider.DepartmentId);

      //if (dept) {
      //  this.selectedDept = dept.Value;
      //}

      this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.selectedDoctor.DepartmentId);
    }
  }

  public CheckForStrInDoctor() {
    if (typeof (this.selectedDoctor) == 'string') {
      let doc = this.doctorList.find(d => d.Value == this.selectedDoctor);
      if (doc) {
        this.CurrentBedReservation.AdmittingDoctorId = doc.Key;
        return;
      }
      this.CurrentBedReservation.AdmittingDoctorId = null;
    }
  }

  public ReserveBed() {
    if (this.CurrentBedReservation.PatientId) {
      if (this.selectedDoctor) {
        this.CurrentBedReservation.AdmittingDoctorId = this.selectedDoctor ? this.selectedDoctor.Key : null;
        if (!this.CurrentBedReservation.AdmittingDoctorId) {
          this.msgBoxServ.showMessage("error", ['Please select Admitting DoctorName from List only !']); this.loading = false; return;
        }
      }

      let daysDiff = moment(this.CurrentBedReservation.AdmissionStartsOn).diff(moment().format('YYYY-MM-DD HH:mm'), 'days');
      let minutesDiff = moment(this.CurrentBedReservation.AdmissionStartsOn).diff(moment().format('YYYY-MM-DD HH:mm'), 'minutes');

      let timeIsValid = daysDiff > 0 ? (daysDiff <= this.bufferDaysMinutes.days) : minutesDiff >= this.bufferDaysMinutes.minutes;

      if (!timeIsValid) {
        this.msgBoxServ.showMessage("error", ['Please enter proper admission date and time !']); this.loading = false; return;
      }

      this.CurrentBedReservation.IsActive = true;

      for (var i in this.CurrentBedReservation.BedReservationInfoValidator.controls) {
        this.CurrentBedReservation.BedReservationInfoValidator.controls[i].markAsDirty();
        this.CurrentBedReservation.BedReservationInfoValidator.controls[i].updateValueAndValidity();
      }

      if (this.CurrentBedReservation.IsValidCheck(undefined, undefined) && this.CurrentBedReservation.IsValidCheck(undefined, undefined)) {
        this.loading = true;
        this.admissionBLService.PostADTBedReservation(this.CurrentBedReservation, this.actionName)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage('success', ["Bed Reservation is completed"]);
              this.closePopUp.emit({ close: true, submit: true, PatientId: this.CurrentBedReservation.PatientId });
              this.loading = false;
            } else { this.loading = false; }
          });
      }
      this.loading = false;
    } else { this.msgBoxServ.showMessage('error', ['Patient is not Selected']); this.loading = false; }
  }

  public UpdateReserveBed() {
    if (this.CurrentBedReservation.PatientId && this.CurrentBedReservation.ReservedBedInfoId) {
      if (this.selectedDoctor) {
        this.CurrentBedReservation.AdmittingDoctorId = this.selectedDoctor ? this.selectedDoctor.Key : null;
      }
      this.CheckForStrInDoctor();
      if (!this.CurrentBedReservation.AdmittingDoctorId) { this.msgBoxServ.showMessage("error", ['Please select Admitting DoctorName from List only !']); this.loading = false; return; }

      let daysDiff = moment(this.CurrentBedReservation.AdmissionStartsOn).diff(moment().format('YYYY-MM-DD HH:mm'), 'days');
      let minutesDiff = moment(this.CurrentBedReservation.AdmissionStartsOn).diff(moment().format('YYYY-MM-DD HH:mm'), 'minutes');

      let timeIsValid = daysDiff > 0 ? (daysDiff <= this.bufferDaysMinutes.days) : minutesDiff >= this.bufferDaysMinutes.minutes;

      if (!timeIsValid) {
        this.msgBoxServ.showMessage("error", ['Please enter proper admission date and time !']); this.loading = false; return;
      }

      this.CurrentBedReservation.IsActive = true;

      for (var i in this.CurrentBedReservation.BedReservationInfoValidator.controls) {
        this.CurrentBedReservation.BedReservationInfoValidator.controls[i].markAsDirty();
        this.CurrentBedReservation.BedReservationInfoValidator.controls[i].updateValueAndValidity();
      }

      if (this.CurrentBedReservation.IsValidCheck(undefined, undefined) && this.CurrentBedReservation.IsValidCheck(undefined, undefined)) {
        this.loading = true;
        this.admissionBLService.UpdateADTBedReservation(this.CurrentBedReservation, this.actionName)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage('success', ["Bed Reservation is successfully Updated"]);
              this.closePopUp.emit({ close: true, submit: true, PatientId: this.CurrentBedReservation.PatientId });
              this.loading = false;
            } else {
              this.msgBoxServ.showMessage('error', ["Cannot Update this reservation now, please try again later!"]);
              this.loading = false;
            }
          });
      } else { this.loading = false; }
    } else { this.msgBoxServ.showMessage('error', ['Patient/Bed is not Set']); this.loading = false; }
  }

  public CancelReservedBed() {
    if (this.CurrentBedReservation.PatientId && this.CurrentBedReservation.ReservedBedInfoId) {
      var confirm = window.confirm("Are you sure, you want to cancel this reservation ?");
      if (!confirm) { this.loading = false; return; }

      this.CurrentBedReservation.BedId = this.reservedBedIdByPat;

      if (this.CurrentBedReservation && this.CurrentBedReservation.ReservedBedInfoId) {
        this.loading = true;        
        this.admissionBLService.CancelADTBedReservation(this.CurrentBedReservation.ReservedBedInfoId, this.actionName)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage('success', ["Bed Reservation is successfully cancelled"]);
              this.closePopUp.emit({ close: true, submit: true, PatientId: this.CurrentBedReservation.PatientId });
              this.loading = false;
            } else {
              this.msgBoxServ.showMessage('error', ["Cannot cancel now, please try again later!"]);
              this.loading = false;
            }
          });
      } else { this.loading = false; }
    } else { this.msgBoxServ.showMessage('error', ['Patient/Bed is not Set']); this.loading = false; }
  }

  public BedChanged(bed: any, curr: number) {
    console.log(this.reservedBedIdByPat);
    var bedRes = this.bedList.find(b => b.BedId == bed && b.IsReserved);

    if (bedRes && (this.reservedBedIdByPat != bedRes.BedId)) {
      this.msgBoxServ.showMessage("error", ['Cannot reserve this bed. This bed is already reserved by '
        + bedRes.ReservedByPatient + ' for date: ' + moment(bedRes.ReservedForDate).format('YYYY-MM-DD HH:mm')]);
      this.changeDetector.detectChanges();
      this.CurrentBedReservation.BedId = null;
    }
    //console.log(this.CurrentBedReservation.BedId);
  }

  public ClosePopUp() {
    this.closePopUp.emit({ close: true, submit: false });
  }
}
