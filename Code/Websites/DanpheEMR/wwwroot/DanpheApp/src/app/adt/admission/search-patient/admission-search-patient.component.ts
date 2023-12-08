import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';

import { PatientService } from '../../../patients/shared/patient.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ADT_BLService } from '../../shared/adt.bl.service';

import { Patient } from "../../../patients/shared/patient.model";

import { BillingBLService } from '../../../billing/shared/billing.bl.service';
import { BillingService } from '../../../billing/shared/billing.service';
import { CoreService } from '../../../core/shared/core.service';
import { PatientsBLService } from '../../../patients/shared/patients.bl.service';
import { SecurityService } from '../../../security/shared/security.service';
import { GeneralFieldLabels } from '../../../shared/DTOs/general-field-label.dto';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { APIsByType } from '../../../shared/search.service';
import { ADTGridColumnSettings } from '../../shared/adt-grid-column-settings';


@Component({
  templateUrl: "./admission-search-patient.html" //"/AdmissionView/AdmissionSearchPatient"
})

export class AdmissionSearchPatient {
  public patients: Array<Patient> = new Array<Patient>();
  public showmsgbox: boolean = false;
  public status: string = null;
  public message: string = null;
  public showProvisionalWarning: boolean = false;
  patientGridColumns: Array<any> = null;
  public patGirdDataApi: string = "";
  public adtGriColumns: ADTGridColumnSettings = null;//sud: 10Jan'19-- to use parameterized grid-columns, we created separate class for ADT-Grid-Columns.
  searchText: string = '';
  public enableServerSideSearch: boolean = false;
  public showBedReservationPopup: boolean = false;

  public patientId: number = null;
  public patientVisitId: number = null;
  public showIsInsurancePatient: boolean = false;
  public allPatientList = [];
  public filteredPatientList = [];
  public GeneralFieldLabel = new GeneralFieldLabels();

  constructor(
    public patientService: PatientService,
    public router: Router,
    public admissionBLService: ADT_BLService,
    public msgBoxServ: MessageboxService, public coreService: CoreService, public changeDetRef: ChangeDetectorRef, public securityService: SecurityService,
    public billingBlService: BillingBLService, public billingservice: BillingService,
    private patientBLService: PatientsBLService) {
    this.patGirdDataApi = APIsByType.PatientListForRegNewVisit;  //sud:29Nov--For Testing.. Review this before pushing to server.
    this.getParamter();
    this.Load("");
    this.adtGriColumns = new ADTGridColumnSettings(this.coreService, this.securityService);
    this.patientGridColumns = this.adtGriColumns.AdmissionSearchPatient;
    this.GetOrganizationList();
    this.GeneralFieldLabel = coreService.GetFieldLabelParameter();
    this.patientGridColumns[5].headerName = `${this.GeneralFieldLabel.NSHINo} NO`;
  }

  ngAfterViewChecked() {
    this.changeDetRef.detectChanges();
  }
  serverSearchTxt(searchTxt) {
    this.searchText = searchTxt;
    this.Load(this.searchText);
  }

  getParamter() {
    let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "ServerSideSearchComponent").ParameterValue;
    var data = JSON.parse(parameterData);
    this.enableServerSideSearch = data["PatientSearchPatient"];
  }
  Load(searchTxt): void {
    this.admissionBLService.GetPatientListForADT(searchTxt)
      .subscribe(res => {
        if (res.Status == 'OK') {
          //this.patients = res.Results;
          this.allPatientList = res.Results;
          this.filteredPatientList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
        });
  }
  AdmissionGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "admit": {
        var data = $event.Data;
        if (data.MunicipalityName) {
          data.Address += ", " + data.MunicipalityName;
        }

        if (data.CountrySubDivisionName) {
          data.Address += ", " + data.CountrySubDivisionName;
        }
        this.patientService.setGlobal(data);
        this.AdmitPatient(data);
      }
        break;
      case "view-reserved-patient": {
        this.patientId = $event.Data.PatientId;
        this.patientVisitId = $event.Data.PatientVisitId;
        this.changeDetRef.detectChanges();
        this.showBedReservationPopup = true;
      }
        break
      default:
        break;
    }
  }

  public ReturnFromPatBedReservation($event) {
    if ($event.close) {
      this.CloseReservationPopUp();
    }
  }

  public CloseReservationPopUp() {
    this.patientId = null;
    this.patientVisitId = null;
    this.showBedReservationPopup = false;
  }

  public AdmitPatient(data) {
    if (data) {
      //ramavtar: 06Nov'18 IsPatientAdmittedScenario is already covered,
      //calling here api for checking if any provisional amt is pending on patient or not
      //this.admissionBLService.CheckPatProvisionalInfo(data.PatientId)
      //    .subscribe(res => {
      //        if (res.Status == "OK") {
      //            //this.msgBoxServ.showMessage("failed", ['<h4><b>Please clear provisional items before proceeding for admission.</b></h4>']);
      //            this.showProvisionalWarning = true;
      //            return;
      //        }
      //        else {
      var globalPatient = this.patientService.getGlobal();
      globalPatient.PatientId = data.PatientId;
      //globalPatient.MembershipTypeId = data.MembershipTypeId;
      globalPatient.PatientCode = data.PatientCode;
      globalPatient.PhoneNumber = data.PhoneNumber;
      globalPatient.ShortName = data.ShortName;
      globalPatient.DateOfBirth = data.DateOfBirth;
      globalPatient.Gender = data.Gender;
      globalPatient.IsPoliceCase = data.IsPoliceCase;
      globalPatient.Ins_HasInsurance = data.Ins_HasInsurance;
      globalPatient.Ins_NshiNumber = data.Ins_NshiNumber;
      globalPatient.Ins_InsuranceBalance = data.Ins_InsuranceBalance;
      globalPatient.SSFPolicyNo = data.SSFPolicyNo;
      globalPatient.PolicyNo = data.PolicyNo;
      globalPatient.CareTakerName = data.CareTakerName;
      globalPatient.CareTakerContact = data.CareTakerContact;
      globalPatient.RelationWithCareTaker = data.RelationWithCareTaker;
      this.router.navigate(["/ADTMain/CreateAdmission"]);
      //    }
      //},
      //err => {
      //    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
      //    return true;
      //});
    }
  }

  public CloseWarningPopUp() {
    this.showProvisionalWarning = false;
  }

  public govPatientShow: boolean = false;
  FilterGridItems(govPatientShow) {
    this.filteredPatientList = [];
    if (govPatientShow == true) {
      this.filteredPatientList = this.allPatientList.filter(s => s.Ins_HasInsurance == true);
    }
    else {
      this.filteredPatientList = this.allPatientList;
    }
    //this.patients = this.filteredPatientList;
  }

  public GetOrganizationList() {
    this.billingBlService.GetOrganizationList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == 'OK') {
          console.log("CreditOrganization list are loaded successfully (billing-main).");
          this.billingservice.SetAllCreditOrgList(res.Results);
        }
        else {
          console.log("Couldn't get CreditOrganization List.");
        }
      });
  }
}
