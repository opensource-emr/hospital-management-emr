import { Component, ChangeDetectorRef, EventEmitter, Output, Injectable, ViewChild, ElementRef } from "@angular/core";
import { RouterModule, Router, CanDeactivate } from '@angular/router';
import { AppointmentService } from '../../../appointments/shared/appointment.service';
import { IRouteGuard } from '../../../shared/route-guard.interface';
import { PatientService } from '../../shared/patient.service';
import { PatientsBLService } from '../../shared/patients.bl.service';
import { Patient } from "../../shared/patient.model";
import { PatientMembership } from '../../shared/patient-membership.model';
import { CoreService } from '../../../core/shared/core.service';
//import { CoreDLService } from '../../../../core/shared/core.dl.service';
import { NepaliDate } from '../../../shared/calendar/np/nepali-dates';
import { NepaliCalendarService } from '../../../shared/calendar/np/nepali-calendar.service';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CommonFunctions } from "../../../shared/common.functions";
import { UnicodeService } from "../../../common/unicode.service";
import { DanpheCache, MasterType } from "../../../shared/danphe-cache-service-utility/cache-services";
import { MembershipType } from "../../shared/membership-type.model";//remove this or merge to one type with membership. 
import { Membership } from "../../../settings-new/shared/membership.model";
import { Municipality } from "../../../shared/address-controls/municipality-model";
import { PatientRegistrationMainComponent } from "../patient-registration-main.component";
@Component({
  templateUrl: "./patient-basic-info.html"
})


export class PatientBasicInfoComponent implements IRouteGuard {
  // binding logic
  public patientService: PatientService;
  public appointmentServ: AppointmentService;
  public model: Patient = new Patient();
  patients: Array<Patient> = new Array<Patient>();
  // this used to disble the drop down of CountrySubDivision or district/state
  public disableTextBox: boolean = true;
  // to store the CountrySubDivision which we are getting in GetCountrySubDivision
  public CountrySubDivisionList: any;
  public selDistrict;
  public calType: string = "";
  //public nepaliDateClass: NepaliDate;
  public nepaliDob: NepaliDate;
  public initialLoad: boolean = false;
  public Countries: Array<any> = null;
  public MembershipTypeList: Array<MembershipType> = new Array<MembershipType>();
  public olderAddressList: Array<any> = [];
  public isPhoneNumberMandatory: boolean = true;
  public showMunicipality: boolean = false;
  public showLocalName: boolean = true;
  public submitDone: boolean = true;

  // @Output('emitToRegisterButton')
  // public emitToRegisterButton: EventEmitter<boolean>  = new EventEmitter<boolean>();
  constructor(public unicode: UnicodeService, _serv: PatientService,
    _appointmentServ: AppointmentService,
    public patientBLService: PatientsBLService,
    public coreService: CoreService,
    public npCalendarService: NepaliCalendarService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef) {

    if (this.coreService.Masters.UniqueDataList && this.coreService.Masters.UniqueDataList.UniqueAddressList) {
      this.olderAddressList = this.coreService.Masters.UniqueDataList.UniqueAddressList;
    }

    this.GoToNextInput("InputId");
    this.patientService = _serv;
    this.model = _serv.getGlobal();

    this.LoadMembershipSettings();


    //assign countryid only when it's null or 0 or empty. --yub 3rd Sept '18
    if (!this.model.CountryId)
      this.model.CountryId = this.GetCountryParameter();
    this.appointmentServ = _appointmentServ;
    //assign isDialysis to true if DialysisCode is not null
    if (this.model.DialysisCode != null) {
      this.model.IsDialysis = true;
    }
    else
      this.model.IsDialysis = false;

    this.initialLoad = true;
    this.LoadCalendarTypes();
    if (this.model.DateOfBirth == null) {
      this.model.DateOfBirth = moment().format('YYYY-MM-DD');
    }
    else if (isNaN(Date.parse(this.model.DateOfBirth))) {
      this.model.DateOfBirth = moment().format('YYYY-MM-DD');
    }
    this.GetCountry();
    //this.model.MembershipTypeId = 1;//this is hard-coded for testing..
    //this.GetMembershipType();
    //this.ConditionalValidationOfAgeAndDOB();//sud:3sept'18 now that both Dob & Age are selectable in single view, we can remove this.

    this.isPhoneNumberMandatory = this.coreService.GetIsPhoneNumberMandatory();
    this.showMunicipality = this.coreService.ShowMunicipality().ShowMunicipality;

    this.showLocalName = this.coreService.showLocalNameFormControl;
  }

  ngOnInit() {
    this.isPatientInfoLoaded = true;//sud:13Nov'19-- needed for membership.
    this.phoneNumberMandatory();
  }

  ngAfterViewInit() {
    document.getElementById('regPatFirstName').focus();
  }

  GetCountry() {

    this.Countries = DanpheCache.GetData(MasterType.Country, null)

  }


  //getting country name from core_CFG_parameter table
  LoadCountryDefaultSubDivision() {
    let subDivision = this.coreService.GetDefaultCountrySubDivision();
    if (subDivision) {
      this.model.CountrySubDivisionId = subDivision.CountrySubDivisionId;
      this.model.CountrySubDivisionName = subDivision.CountrySubDivisionName;
      this.selDistrict = subDivision.CountrySubDivisionName;
    }
  }

  public DistrictChanged() {
    let district = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.selDistrict && this.CountrySubDivisionList) {
      if (typeof (this.selDistrict) == 'string' && this.CountrySubDivisionList.length) {
        district = this.CountrySubDivisionList.find(a => a.Value == this.selDistrict);
      }
      else if (typeof (this.selDistrict) == 'object')
        district = this.selDistrict;
      if (district) {
        this.model.CountrySubDivisionId = district.Key;
        this.model.CountrySubDivisionName = district.Value;
      }
    }
  }
  translate(language) {
    this.unicode.translate(language);
    if (language == "english") {
      var localName = <HTMLInputElement>document.getElementById("patNameLocal");
      let ipLocalName = localName.value;
      this.model.PatientNameLocal = ipLocalName.length > 0 ? ipLocalName : "";
    }
  }

  // this is used to get data from master table according to the countryId
  GetCountrySubDivision() {
    //if (this.model.CountryId != 0) {
    //    this.disableTextBox = false;
    //}
    var countryId = this.model.CountryId;
    this.patientBLService.GetCountrySubDivision(countryId)
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results.length) {
          this.CountrySubDivisionList = [];
          res.Results.forEach(a => {
            this.CountrySubDivisionList.push({
              "Key": a.CountrySubDivisionId, "Value": a.CountrySubDivisionName
            });
          });
          if (this.initialLoad) {
            if (!this.model.PatientId) { //checking whether it is for new registration or not
              this.LoadCountryDefaultSubDivision(); //to get the default district/state
            }
            else {
              let district = this.CountrySubDivisionList.find(a => a.Key == this.model.CountrySubDivisionId);
              this.selDistrict = district ? district.Value : "";
            }
            this.initialLoad = false;
          }
          else {
            this.selDistrict = this.CountrySubDivisionList[0].Value;
          }
          this.DistrictChanged();
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          //alert(res.ErrorMessage);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["failed get State/ District.please check log for details."]);
          //alert('failed get State/District. please check log for details.');

          console.log(err.ErrorMessage);
        });


  }


  CanRouteLeave(): boolean {
    //if not-dirty or is valid, return true, else check each validation controls and make them dirty. 
    if (!this.model.PatientValidator.dirty || this.model.IsValidCheck(undefined, undefined)) {
      return true;
    }
    else {
      // for loop is used to show validation message 
      for (var i in this.model.PatientValidator.controls) {
        this.model.PatientValidator.controls[i].markAsDirty();
        this.model.PatientValidator.controls[i].updateValueAndValidity();
      }
      return false;
    }

  }
  logError(err: any) {
    console.log(err);
  }

  //reads the country paramater, parses the json and get the countryid field of it.
  //Prerequisites: ParameterName == 'DefaultCountry'  with value in JSON Format should already be configured in database for this to work.
  //ELSE: it'll crash, and default countryid will be 0 (from catch block).
  GetCountryParameter(): number {
    let countryId: number = 0;
    try {
      let countryJson = this.coreService.Parameters.filter(a => a.ParameterName == 'DefaultCountry')[0]["ParameterValue"];
      countryId = JSON.parse(countryJson).CountryId;
    } catch (ex) {
      countryId = 0;
    }
    return countryId;
  }


  NepCalendarOnDateChange() {
    let engDate = this.npCalendarService.ConvertNepToEngDate(this.nepaliDob);
    this.model.DateOfBirth = moment(engDate).format("YYYY-MM-DD");
  }

  EngCalendarOnDateChange() {
    if (this.model.DateOfBirth) {
      let nepDate = this.npCalendarService.ConvertEngToNepDate(this.model.DateOfBirth);
      this.nepaliDob = nepDate;
    }
  }
  //calculate DOB from age and ageUnit 
  CalculateDob() {
    //if (this.model.Age && this.model.AgeUnit) {
    if ((this.model.Age || this.model.Age == "0") && this.model.AgeUnit) {
      var age: number = Number(this.model.Age);
      var ageUnit: string = this.model.AgeUnit;
      this.model.DateOfBirth = this.patientService.CalculateDOB(age, ageUnit);
    }
  }

  LoadDOBdefault() {
    let npDateToday = this.npCalendarService.GetTodaysNepDate();
    this.nepaliDob = npDateToday;
    this.NepCalendarOnDateChange();

  }

  //conditional validation for age and Dob
  //if on is passed to the UpdateValidator in model the Age is validated and
  // if off on is passed to the UpdateValidator in model the dob is validated and
  ConditionalValidationOfAgeAndDOB() {
    if (this.model.IsDobVerified == true) {
      //incase age was entered.
      this.model.Age = null;
      let onOff = 'off';
      let formControlName = 'Age';
      this.model.UpdateValidator(onOff, formControlName);
      this.model.PatientValidator.controls['Age'].updateValueAndValidity();
    }
    else {
      let onOff = 'on';
      let formControlName = 'Age';
      this.model.UpdateValidator(onOff, formControlName);
      this.model.PatientValidator.controls['Age'].updateValueAndValidity();

    }
  }

  // assigning the gender according to the Salutation.....
  OnSelectSalutation() {
    if (this.model.Salutation == "Mr.") {
      this.model.Gender = "Male";
    }
    else {
      this.model.Gender = "Female";
    }
  }
  //find the last+1 dialysisCode and assign it to current Patient
  OnSelectDialysis() {
    if (this.model.IsDialysis == true) {
      this.patientBLService.GetDialysisCode()
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.model.DialysisCode = res.Results + 1;
          } else {
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);

          }
        },
          err => {
            this.msgBoxServ.showMessage("failed", ["failed get DialysisCode. please check log for details."]);

          });
    }
    else {
      this.model.DialysisCode = null;
    }
  }

  //loads CalendarTypes from Paramter Table (database) and assign the require CalendarTypes to local variable.
  LoadCalendarTypes() {
    let Parameter = this.coreService.Parameters;
    Parameter = Parameter.filter(parms => parms.ParameterName == "CalendarTypes");
    let calendarTypeObject = JSON.parse(Parameter[0].ParameterValue);
    this.calType = calendarTypeObject.PatientRegistration;
  }

  //used to format display of item in ng-autocomplete.
  myListFormatter(data: any): string {
    let html = data["Value"];
    return html;
  }

  MembershipTypeListFormatter(data: any): string {
    return data["MembershipTypeName"];
  }


  //This function only for show catch messages
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  //captalize first letter (controlName for field is use to update)
  capitalizeFirstLetter(controlName) {
    let cntrl = this.model.PatientValidator.controls[controlName];
    if (cntrl) {
      let str: string = cntrl.value;
      let returnStr: string = CommonFunctions.CapitalizeFirstLetter(str);
      cntrl.setValue(returnStr);
    }
  }

  //sud: 3sept'18-- revised Age calculation logic.
  generateAge() {
    let dobYear: number = Number(moment(this.model.DateOfBirth).format("YYYY"));
    if (dobYear > 1900) {
      //this.model.Age = String(Number(moment().format("YYYY")) - Number(moment(this.model.DateOfBirth).format("YYYY")));
      if (this.model.AgeUnit == "Y") {
        this.model.Age = String(moment().diff(moment(this.model.DateOfBirth), 'years'));
      }
      else if (this.model.AgeUnit == "M") {
        this.model.Age = String(moment().diff(moment(this.model.DateOfBirth), 'months'));
      }
      else if (this.model.AgeUnit == "D") {
        this.model.Age = String(moment().diff(moment(this.model.DateOfBirth), 'days'));
      }


    }
  }

  //start: sundeep:14Nov'19--for membership/community scheme
  public isPatientInfoLoaded: boolean = false;
  public membershipSchemeParam = { ShowCommunity: false, IsMandatory: true };

  public LoadMembershipSettings() {
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "MembershipSchemeSettings");
    if (currParam && currParam.ParameterValue) {
      this.membershipSchemeParam = JSON.parse(currParam.ParameterValue);
    }
  }

  OnMembershipChanged($event: Membership) {
    if ($event) {
      this.model.MembershipTypeId = $event.MembershipTypeId;
      this.model.IsValidMembershipTypeName = true;
    }
    else {
      this.model.MembershipTypeId = null;
      this.model.IsValidMembershipTypeName = false;
    }
  }

  //end: sundeep:14Nov'19--for membership/community scheme


  public phoneNumberMandatory() {
    if (!this.isPhoneNumberMandatory) {
      this.model.UpdatePhoneValidator("off", "PhoneNumber");
    }
  }
  public updateMunicipality(event) {
    if (event) {
      this.model.MunicipalityId = event.data;
    }
  }

  public GoToNextInput(id: string) {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
  }
  
  public AgeUnitValueChange() {
    if (this.isPhoneNumberMandatory == true) {
      this.GoToNextInput('PhoneNumber');
    }
    else {
      this.GoToNextInput('ddlCountry');
    }
  }
  public SelectCountry() {
    if (this.model.CountryId == 1) {
      this.GoToNextInput('ddlDistrict');
    } else {
      this.GoToNextInput('Gender');
    }
  }


  SetFocusById(IdToBeFocused: string) {
    this.coreService.FocusInputById(IdToBeFocused);
   }
}
