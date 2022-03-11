/*
 Description:
    - It handles visit's patient informations.
    - Get's patient details from global patient at first if any.
    - Flow:- Construcor is called
           - @Input variables are initialized from visit-main.component.ts
           - ngOnInit() function is called. from there we're initializing patient data from globalpatient and default country and default country subdivision
    - Disable PatientInput if PatientId is there.
    - Gets all master data required for patient registraiton.
    - Handles functions to calculate nepali date, english date, calculate age/dob by calling related funcitons from patient service.
        
 -------------------------------------------------------------------
 change history:
 -------------------------------------------------------------------
 S.No     UpdatedBy/Date             description           remarks
 -------------------------------------------------------------------
 1.       ashim/ 23rd Aug 2018           created            
                                                     
 -------------------------------------------------------------------
 */
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, Renderer2 } from "@angular/core";
import { Patient } from "../../patients/shared/patient.model";
import { PatientService } from "../../patients/shared/patient.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { CoreService } from "../../core/shared/core.service";
import { VisitBLService } from "../shared/visit.bl.service";
import { CountrySubdivision } from "../../settings-new/shared/country-subdivision.model";
import * as moment from 'moment/moment';
import { DanpheCache, MasterType } from "../../shared/danphe-cache-service-utility/cache-services";
import { VisitService } from "../shared/visit.service";
import { Membership } from "../../settings-new/shared/membership.model";
import { Municipality } from "../../shared/address-controls/municipality-model";
//import { MembershipType } from '../../patients/shared/membership-type.model';
@Component({
  selector: "visit-patient-info",
  templateUrl: "./visit-patient-info.html"
})
export class VisitPatientInfoComponent implements OnInit {
  @Input("patient")
  public patient: Patient = new Patient();

  public countrySubDivisions: Array<CountrySubdivision> = [];
  public municipalities: Array<Municipality> = [];
  public countries: Array<any> = [];
  public calendarType: string = "";
  public countrySubDivision: CountrySubdivision = new CountrySubdivision();
  public disablePatientInput: boolean = false;
  @Output("emit-membership-discount")
  public emitMembershipDiscount: EventEmitter<Object> = new EventEmitter<Object>();

  //public membershipTypes: Array<{ MembershipTypeId: number, MembershipType: string, MembershipTypeName: string, DiscountPercent: number }>;

  public initialLoad: boolean = false; //flag added by yubraj --6th sept 2018

  public olderAddressList: Array<any> = [];//for Autocomplete of Address Field.
  public isPhoneMandatory: boolean = false;
  //public AgeUnitDisable: boolean = false;
  public showMunicipality: boolean = false;




  constructor(public patientService: PatientService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public visitBLService: VisitBLService,
    public visitService: VisitService,
    public changeDetector: ChangeDetectorRef,
    public renderer2: Renderer2) {
    this.LoadCalendarTypes();
    this.GetCountries();
    //this.GetCountrySubDivision(); //this was reapting double time --yub 6th Sept
    //this.GetMembershipTypes();

    this.initialLoad = true;

    if (this.coreService.Masters.UniqueDataList && this.coreService.Masters.UniqueDataList.UniqueAddressList) {
      this.olderAddressList = this.coreService.Masters.UniqueDataList.UniqueAddressList;
    }
    this.LoadMembershipSettings();
    this.isPhoneMandatory = this.coreService.GetIsPhoneNumberMandatory();
    this.showMunicipality = this.coreService.ShowMunicipality().ShowMunicipality;
  }

  // ngAfterViewInit() {
  //   if (!this.patient.PatientId) {
  //     this.SetFocusById('aptPatFirstName');
  //   }
  // }
  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    this.InitializeNewPatient();
    this.isPatientInfoLoaded = true;
    this.phoneNumberMandatory();
  }

  public InitializeNewPatient() {
    this.patient = Object.assign(this.patient, this.patientService.getGlobal());
    if (this.patient.PatientId) {
      this.countrySubDivision["CountrySubDivisionId"] = this.patient.CountrySubDivisionId;
      this.countrySubDivision["CountrySubDivisionName"] = this.patient.CountrySubDivisionName;
      this.SeperateAgeAndUnit();
      this.DisableInputFields();
    }
    else {
      let country = this.coreService.GetDefaultCountry();
      let subDivision = this.coreService.GetDefaultCountrySubDivision();
      this.patient.CountryId = country ? country.CountryId : null;
      this.countrySubDivision.CountrySubDivisionId = this.patient.CountrySubDivisionId = subDivision ? subDivision.CountrySubDivisionId : null;
      this.countrySubDivision.CountrySubDivisionName = this.patient.CountrySubDivisionName = subDivision ? subDivision.CountrySubDivisionName : null;

      //this.countrySubDivision["CountrySubDivisionId"] = subDivision ? subDivision.CountrySubDivisionId : null;
      //this.countrySubDivision["CountrySubDivisionName"] = subDivision ? subDivision.CountrySubDivisionName : null;
      // this.AssignSelectedDistrict();
      this.LoadDOBdefault();
    }
    this.ConditionalValidationOfAgeAndDOB();
    this.CalculateDob();
  }
  DisableInputFields() {
    this.patient.EnableControl("FirstName", false);
    this.patient.EnableControl("LastName", false);
    this.patient.EnableControl("MiddleName", false);
    this.patient.EnableControl("Age", false);
    this.patient.EnableControl("DateOfBirth", false);
    this.patient.EnableControl("Gender", false);
    this.patient.EnableControl("ItemName", false);
    this.patient.EnableControl("CountrySubDivisionId", false);
    this.patient.EnableControl("Email", false);
    this.patient.EnableControl("PhoneNumber", false);
    this.patient.EnableControl("CountryId", false);
    this.patient.EnableControl("Address", false);
    this.patient.EnableControl("PANNumber", false);
    this.patient.EnableControl("MembershipTypeId", false);
    //this.AgeUnitDisable = true;
  }

  LoadCalendarTypes() {
    let Parameter = this.coreService.Parameters;
    Parameter = Parameter.filter(parms => parms.ParameterName == "CalendarTypes");
    let calendarTypeObject = JSON.parse(Parameter[0].ParameterValue);
    this.calendarType = calendarTypeObject.PatientVisit;
  }

  GetCountrySubDivision() {

    this.visitService.TriggerBillChangedEvent({ ChangeType: "Country", "PatientInfo": this.patient });

    this.visitBLService.GetCountrySubDivision(this.patient.CountryId)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results) {
          this.countrySubDivisions = [];
          this.countrySubDivisions = res.Results;

          if (this.initialLoad) { //checking whether it is for new registration or not
            var selCountrySubDiv = this.countrySubDivisions.find(a => a.CountrySubDivisionId == this.patient.CountrySubDivisionId || a.CountrySubDivisionName == this.patient.CountrySubDivisionName);
            if (selCountrySubDiv) {
              this.patient.CountrySubDivisionName = selCountrySubDiv.CountrySubDivisionName;
              this.patient.CountrySubDivisionId = selCountrySubDiv.CountrySubDivisionId;

              this.countrySubDivision["CountrySubDivisionId"] = this.patient.CountrySubDivisionId;
              this.countrySubDivision["CountrySubDivisionName"] = this.patient.CountrySubDivisionName;

              //this.countrySubDivision = new CountrySubdivision();
              //this.countrySubDivision = null;
            }
            if (this.patient.CountrySubDivisionName) { //Yubraj Modification --2nd July '19 
              this.initialLoad = false;
            }
            else {
              this.LoadCountryDefaultSubDivision(); //to get the default district/state
            }
          }
          else {
            this.countrySubDivision = new CountrySubdivision();
            this.countrySubDivision = null; //to show sub country box empty when the country selection is changed --yub 30th Aug '18
            if (this.patient.CountryId != 1) {
              var selCountrySubDiv = this.countrySubDivisions.find(a => a.CountryId == this.patient.CountryId);
              this.patient.CountrySubDivisionName = selCountrySubDiv.CountrySubDivisionName;
              this.patient.CountrySubDivisionId = selCountrySubDiv.CountrySubDivisionId;
              this.patient.CountryName = this.countries.find(a => a.CountryId == this.patient.CountryId).CountryName;
              // this.countrySubDivision["CountrySubDivisionId"] = this.patient.CountrySubDivisionId;
              // this.countrySubDivision["CountrySubDivisionName"] = this.patient.CountrySubDivisionName;
            }
          }
          this.AssignSelectedDistrict();
        }
        else {
          this.msgBoxServ.showMessage("failed", ['Failed to get country sub divisions.']);
          console.log(res.ErrorMessage);
        }
      });
  }

  //getting country name from core_CFG_parameter table --added by --yub-- 6th Sept'18
  LoadCountryDefaultSubDivision() {
    let subDivision = this.coreService.GetDefaultCountrySubDivision();
    if (subDivision) {
      this.patient.CountrySubDivisionId = subDivision.CountrySubDivisionId;
      this.patient.CountrySubDivisionName = subDivision.CountrySubDivisionName;
      this.countrySubDivision = subDivision.CountrySubDivisionName;
    }
  }

  GetCountries() {
    this.countries = DanpheCache.GetData(MasterType.Country, null);

    // this.visitBLService.GetCountries(this.patient.CountryId)
    //     .subscribe(res => {
    //         if (res.Status == "OK") {
    //             this.countries = res.Results;
    //         }
    //         else {
    //             this.msgBoxServ.showMessage("failed", ['Failed to get country sub divisions.']);
    //             console.log(res.ErrorMessage);
    //         }
    //     });
  }

  //GetMembershipTypes() {
  //  this.visitBLService.GetMemberShipTypes()
  //    .subscribe(res => {
  //      if (res.Status == "OK") {
  //        this.membershipTypes = res.Results;
  //        if (this.patient.PatientId) {
  //          let type = this.membershipTypes.find(i => i.MembershipTypeId == this.patient.MembershipTypeId);
  //          this.patientService.globalPatient.MembershipTypeName = type.MembershipType;
  //          this.patientService.globalPatient.MembershipDiscountPercent = type.DiscountPercent;
  //          this.membership = type.MembershipTypeName;
  //        } else {
  //          let index = this.membershipTypes.findIndex(i => i.MembershipType == "General");
  //          if (!this.patient.MembershipTypeId) {
  //            this.patient.MembershipTypeId = this.membershipTypes[index].MembershipTypeId;
  //            this.membership = this.membershipTypes[index].MembershipTypeName;
  //            this.patientService.globalPatient.MembershipDiscountPercent = this.membershipTypes[index].DiscountPercent;
  //            this.patientService.globalPatient.MembershipTypeName = this.membershipTypes[index].MembershipType;
  //          }
  //        }
  //        this.MembershipTypeChanged();
  //      }
  //      else {
  //        this.msgBoxServ.showMessage("failed", ['Failed to get membership types.']);
  //        console.log(res.ErrorMessage);
  //      }
  //    });
  //}

  //public membership: any = null;

  //onMembershipTypeChange() {
  //  this.membership;
  //  let type = null;
  //  if (this.membership) {
  //    if (typeof (this.membership) == 'string') {
  //      type = this.membershipTypes.find(a => a.MembershipTypeName == this.membership);
  //    }
  //    else if (typeof (this.membership) == 'object') {
  //      type = this.membership;
  //    }
  //    if (type) {
  //      this.patient.MembershipTypeId = this.membership.MembershipTypeId;
  //      this.patient.IsValidMembershipTypeName = true;
  //    }
  //    else {
  //      this.patient.IsValidMembershipTypeName = false;
  //    }
  //  }
  //  this.MembershipTypeChanged();
  //}

  //MembershipTypeListFormatter(data: any): string {
  //  return data["MembershipTypeName"];
  //}

  SeperateAgeAndUnit() {
    let seperatedAgeUnit = this.patientService.SeperateAgeAndUnit(this.patient.Age);
    if (seperatedAgeUnit) {
      this.patient.Age = seperatedAgeUnit.Age;
      this.patient.AgeUnit = seperatedAgeUnit.Unit;
    }
  }

  NepCalendarOnDateChange() {
    this.patient.DateOfBirth = this.patientService.GetEnglishFromNepaliDate(this.patient.NepaliDOB);

  }
  EngCalendarOnDateChange() {
    this.patient.NepaliDOB = this.patientService.GetNepaliFromEngDate(this.patient.DateOfBirth);
  }

  //calculate DOB from age and ageUnit 
  CalculateDob() {
    this.patient.DateOfBirth = this.patientService.CalculateDOB(Number(this.patient.Age), this.patient.AgeUnit);
    this.EngCalendarOnDateChange();
  }

  CalculateAge() {
    let dobYear: number = Number(moment(this.patient.DateOfBirth).format("YYYY"));
    if (dobYear > 1920) {
      this.patient.Age = String(Number(moment().format("YYYY")) - Number(moment(this.patient.DateOfBirth).format("YYYY")));
    }
  }
  districtListFormatter(data: any): string {
    let html = data["CountrySubDivisionName"];
    return html;
  }

  LoadDOBdefault() {
    this.patient.NepaliDOB = this.patientService.GetDefaultNepaliDOB();
    this.NepCalendarOnDateChange();
  }
  AssignSelectedDistrict() {
    if (this.countrySubDivision && this.countrySubDivision.CountrySubDivisionId) {
      this.patient.CountrySubDivisionId = this.countrySubDivision.CountrySubDivisionId;
      this.patient.CountrySubDivisionName = this.countrySubDivision.CountrySubDivisionName;
    }else{
      this.patient.CountrySubDivisionId = null;
      this.patient.CountrySubDivisionName = null;
    }
  }

  //conditional validation for age and Dob
  //if on is passed to the UpdateValidator in model the Age is validated and
  // if off on is passed to the UpdateValidator in model the dob is validated and
  ConditionalValidationOfAgeAndDOB() {
    if (this.patient.IsDobVerified == true) {
      //incase age was entered
      this.patient.Age = null;
      let onOff = 'off';
      let formControlName = 'Age';
      this.patient.UpdateValidator(onOff, formControlName);
    }
    else {
      let onOff = 'on';
      let formControlName = 'Age';
      this.patient.UpdateValidator(onOff, formControlName);

    }
  }



  //start:sundeep-14nov-for membership

  public isPatientInfoLoaded: boolean = false;//sundeep:14Nov'19-- show membership dropdown only after patient is loaded.
  public membershipSchemeParam = { ShowCommunity: false, IsMandatory: true };

  OnMembershipChanged($event: Membership) {
    if ($event) {

      this.patient.MembershipTypeId = $event.MembershipTypeId;
      this.patient.IsValidMembershipTypeName = true;
    }
    else {
      this.patient.MembershipTypeId = null;
      this.patient.IsValidMembershipTypeName = false;
    }
    this.MembershipTypeChanged($event);
  }


  MembershipTypeChanged(currentMembType: Membership) {
    //we need to emit even when membership type is invalid. so that visit-main component can do the check accordingly.
    if (currentMembType && this.patient.MembershipTypeId) {
      this.visitService.TriggerBillChangedEvent({ ChangeType: "Membership", "DiscountPercent": currentMembType.DiscountPercent, MembershipTypeName: currentMembType.MembershipTypeName, MembershipTypeId: currentMembType.MembershipTypeId });
      this.visitService.TriggerBillChangedEvent({ ChangeType: "MembershipTypeValid", "MembershipTypeValid": this.patient.IsValidMembershipTypeName });
    }
    else {
      this.visitService.TriggerBillChangedEvent({ ChangeType: "Membership", "DiscountPercent": 0 });
      this.visitService.TriggerBillChangedEvent({ ChangeType: "MembershipTypeValid", "MembershipTypeValid": this.patient.IsValidMembershipTypeName });
    }
  }

  public LoadMembershipSettings() {
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "MembershipSchemeSettings");
    if (currParam && currParam.ParameterValue) {
      this.membershipSchemeParam = JSON.parse(currParam.ParameterValue);
    }
  }

  //end:sundeep-14nov-for membership

  //Enter Key Sequence handling
  GoToNext(nextField: HTMLInputElement) {
    nextField.focus();
    nextField.select();
  }

  GoToNextSelect(nextField: HTMLSelectElement) {
    nextField.focus();
  }

  SetFocusById(IdToBeFocused: string) {
    this.coreService.FocusInputById(IdToBeFocused);
  }

  public phoneNumberMandatory() {
    if (!this.isPhoneMandatory) {
      this.patient.UpdatePhoneValidator("off", "PhoneNumber");
    }
  }

  public updateMunicipality(event) {
    if (event) {
      this.patient.MunicipalityId = event.data;
    }
  }

  public transFormAddress() {
    if (this.patient.Address) {
      var splitStr = this.patient.Address.toLowerCase().split(" ");
      for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
      }
      this.patient.Address = splitStr.join(" ");
    }
  }
}
