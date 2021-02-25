import { Component, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { Router } from '@angular/router';
import { Patient } from "../../patients/shared/patient.model";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
//import { InPatientVM } from '../shared/InPatientVM';
import { ADT_BLService } from '../../adt/shared/adt.bl.service';
import { InPatientVM } from '../../labs/shared/InPatientVM';
import { LabsBLService } from '../../labs/shared/labs.bl.service';
import { WardPatientVM } from './ward-patient-view-model';
import { CommonFunctions } from '../../shared/common.functions';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./rad-ip-list.html",
  styles: [` .portlet.portlet-fullscreen > .portlet-body {overflow-y: hidden !important;}`]
})

export class Rad_InpatientListComponent {
  public WardGridColumns: Array<any> = null;
  public showDischargeBill: boolean = false;
  public inpatientList: Array<InPatientVM>;
  public selecteditems: InPatientVM;
  public patientId: number = null;
  public patientVisitId: number = null;
  public selectedPatient: WardPatientVM = null;


  public showWardBillingWindow: boolean = false;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(
    public router: Router,
    public labBLService: LabsBLService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef, public admissionBLService: ADT_BLService) {
    this.WardGridColumns = GridColumnSettings.RadiologyWardBillingColumns;
    this.GetInpatientlist();
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('AdmittedDate', true));
  }



  RouteToLabRequisition() {


  }

  RouteToList($event) {
    this.selecteditems = new InPatientVM();
    if (!$event.state) {
      this.showWardBillingWindow = false;
    }
  }

  LabGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "ViewDetails":
        {

          this.showWardBillingWindow = false;
          this.changeDetector.detectChanges();
          this.selectedPatient = this.GetPatientInfoFromGrid_Formatted($event.Data);
          this.showWardBillingWindow = true;
          break;
        }

      default:
        break;
    }
  }

  GetPatientInfoFromGrid_Formatted(patInfo): WardPatientVM {
    console.log(patInfo);
    let retPatient = new WardPatientVM();
    retPatient.PatientId = patInfo.PatientId;
    //retPatient.Age=patInfo.
    retPatient.Gender = patInfo.Gender;
    retPatient.PatientCode = patInfo.PatientCode;
    retPatient.PatientFullName = patInfo.Name;
    retPatient.PatientVisitId = patInfo.PatientVisitId;
    retPatient.VisitDateTime = patInfo.AdmittedDate;
    retPatient.Age = CommonFunctions.GetFormattedAge(patInfo.DateOfBirth);

    let ward_bedName = patInfo.BedInformation != null ? patInfo.BedInformation.Ward + "/" + patInfo.BedInformation.BedCode : null;
    retPatient.Ward_BedName = ward_bedName;
    retPatient.AdmittingDoctorName = patInfo.AdmittingDoctorName;
    return retPatient;
  }


  GetInpatientlist() {
    this.admissionBLService.GetAdmittedPatients()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.inpatientList = res.Results;
          this.inpatientList = this.inpatientList.slice();
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
        });

  }

  OnWardBillingClosed() {
    this.showWardBillingWindow = false;
  }

  Close() {
    this.showWardBillingWindow = false;
  }

}
