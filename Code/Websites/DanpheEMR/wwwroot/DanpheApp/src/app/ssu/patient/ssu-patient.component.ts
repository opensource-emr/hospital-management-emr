import { Component, ChangeDetectorRef, Output, EventEmitter, Input } from "@angular/core";

import { PatientService } from '../../patients/shared/patient.service';
import { CoreService } from '../../core/shared/core.service';
//import { CoreDLService } from '../../../../core/shared/core.dl.service';
import { NepaliDate } from '../../shared/calendar/np/nepali-dates';
import { NepaliCalendarService } from '../../shared/calendar/np/nepali-calendar.service';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CommonFunctions } from "../../shared/common.functions";
import { UnicodeService } from "../../common/unicode.service";
import { DanpheCache, MasterType } from "../../shared/danphe-cache-service-utility/cache-services";
import { MembershipType } from "../../patients/shared/membership-type.model";//remove this or merge to one type with membership. 
import { Membership } from "../../settings-new/shared/membership.model";
import { SSU_BLService } from "../shared/ssu.bl.service";
import { SsuPatientVM } from "../shared/ssu-patient.view-model";
import { Patient } from "../../patients/shared/patient.model";
import { parse } from "querystring";

@Component({
  selector: "ssu-add-patient",
  templateUrl: "./ssu-patient.html",
  host: { '(window:keydown)': 'hotkeys($event)' }
})


export class SSU_PatientComponent {
  // binding logic
  public patientService: PatientService;
  // public model: Patient = new Patient();
  public model: SsuPatientVM = new SsuPatientVM();
  // patients: Array<Patient> = new Array<Patient>();
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
  public hasTG_Certificate: boolean = null;
  public OtherIncome: string;
  public MembershipList: Array<any> = new Array<any>();

  @Output('ssu-pat-callback')
  public ssuEmiter: EventEmitter<string> = new EventEmitter<string>();

  @Input('EditSSUPatMode')
  public EditSSUPatMode: boolean = false;

  @Input('patient-to-edit')
  public PatientToEdit: Patient = new Patient();

  public isPatientInfoLoaded: boolean = false;
  public membershipSchemeParam = { ShowCommunity: false, IsMandatory: true };

  public showMunicipality: boolean = false;

  public TargetGroupList =
    [{ TargetGroupId: 1, TargetGroup: "Poor/Ultra Poor" },
    { TargetGroupId: 2, TargetGroup: "Helpless" },
    { TargetGroupId: 3, TargetGroup: "Disability" },
    { TargetGroupId: 4, TargetGroup: "Senior Citizen" },
    { TargetGroupId: 5, TargetGroup: "Victim of Gender Violence" },
    { TargetGroupId: 6, TargetGroup: "FCHV" },];

  public IncomeSourceList =
    [{ Id: 1, IncomeSource: "Unskilled Labour in Agriculture or Other" },
    { Id: 2, IncomeSource: "Skilled Labour in Agriculture or Other" },
    { Id: 3, IncomeSource: "Agriculture/Farming" },
    { Id: 4, IncomeSource: "Private Sector/Government Sector" },
    { Id: 5, IncomeSource: "Foreign employment in Malaysia or UAE" },
    { Id: 6, IncomeSource: "Others" },
    ];

  constructor(public unicode: UnicodeService, _serv: PatientService,
    public ssuBLService: SSU_BLService,
    public coreService: CoreService,
    public npCalendarService: NepaliCalendarService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef) {

    this.patientService = _serv;
    this.showMunicipality = this.coreService.ShowMunicipality().ShowMunicipality;

  }

  ngOnInit() {
    this.model = new SsuPatientVM();
    this.model.MaritalStatus = null;
    if (this.PatientToEdit && this.PatientToEdit.PatientId > 0) {
      //below will assign all properties of input patient to current patient in scope.
      // this.model = Object.assign(new SsuPatientVM(), this.PatientToEdit);
      this.AssignEditableData();
    }
    this.Initialize();
    
  }

  ngAfterViewInit() {
    this.setFocusById('regPatFirstName');
  }

  GetCountry() {

    this.Countries = DanpheCache.GetData(MasterType.Country, null);

  }

  Initialize() {
    if (this.coreService.Masters.UniqueDataList && this.coreService.Masters.UniqueDataList.UniqueAddressList) {
      this.olderAddressList = this.coreService.Masters.UniqueDataList.UniqueAddressList;
    }

    this.model.IsSSUPatient = true;
    this.model.SSU_IsActive = true;

    //assign countryid only when it's null or 0 or empty. --yub 3rd Sept '18
    if (!this.model.CountryId)
      this.model.CountryId = this.GetCountryParameter();


    if (this.model.DateOfBirth == null) {
      this.model.DateOfBirth = moment().format('YYYY-MM-DD');
    }
    else if (isNaN(Date.parse(this.model.DateOfBirth))) {
      this.model.DateOfBirth = moment().format('YYYY-MM-DD');
    }
    // this.isPhoneNumberMandatory = this.coreService.GetIsPhoneNumberMandatory();
    this.isPhoneNumberMandatory = false; // for ssu phone number is not mendotory
    this.phoneNumberMandatory();

    this.initialLoad = true;
    this.LoadCalendarTypes();
    this.GetCountry();
    this.LoadMembershipSettings();
    this.GetTargetGroupMembershipMapping();
    this.isPatientInfoLoaded = true;
  }

  AssignEditableData() {
    this.model.PatientId = this.PatientToEdit.PatientId;
    this.model.PatientCode = this.PatientToEdit.PatientCode;
    this.model.FirstName = this.PatientToEdit.FirstName;
    this.model.MiddleName = this.PatientToEdit.MiddleName;
    this.model.LastName = this.PatientToEdit.LastName;
    this.model.Gender = this.PatientToEdit.Gender;
    this.model.PhoneNumber = this.PatientToEdit.PhoneNumber;
    this.model.MaritalStatus = this.PatientToEdit.MaritalStatus;
    this.model.FatherName = this.PatientToEdit.FatherName;
    this.model.MotherName = this.PatientToEdit.MotherName;
    this.model.CountryId = this.PatientToEdit.CountryId;
    this.model.CountrySubDivisionId = this.PatientToEdit.CountrySubDivisionId;
    this.model.Address = this.PatientToEdit.Address;
    this.model.EthnicGroup = this.PatientToEdit.EthnicGroup;
    this.model.Race = this.PatientToEdit.Race;
    this.model.MembershipTypeId = this.PatientToEdit.MembershipTypeId;
    this.model.SSU_Information = this.PatientToEdit.SSU_Information;
    this.model.MunicipalityId = this.PatientToEdit.MunicipalityId;
    this.model.MunicipalityName = this.PatientToEdit.MunicipalityName;

    // Extracting Age and AgeUnit (formatt stored in DB: Age= 56Y/56M/56D)
    let l: number = this.PatientToEdit.Age.length;
    this.model.Age = this.PatientToEdit.Age.substring(0, (l - 1));
    this.model.AgeUnit = this.PatientToEdit.Age.substring((l - 1), l);
    this.CalculateDob();
    if (this.model.SSU_Information.TG_CertificateNo) {
      this.hasTG_Certificate = true;
    }

    if (this.model.SSU_Information.SSU_InfoId <= 0) { // making membership = SSU for all non ssu patinet who come to ssu registration      
      this.model.MembershipTypeId = 11;
    } else {
      this.EditSSUPatMode = true; // if patient has ssu Id then it is existing patent
    }
  }


  GetTargetGroupMembershipMapping() {
    this.coreService.InitializeParameters().
      subscribe(res => {
        if (res && res.Results) {
          let tempList: Array<any> = res.Results;
          this.MembershipList = JSON.parse(tempList.find(a => a.ParameterName == 'SSUMembershipTargetGroupMapping').ParameterValue);
        }
      });
  }

  AssignMembershipOnTargetGroupChage() {
    this.isPatientInfoLoaded = false;
    if (this.model.SSU_Information && this.model.SSU_Information.TargetGroupId > 0 && this.MembershipList.length > 0) {
      this.model.MembershipTypeId = this.MembershipList.find(e => e.TargetGroupId == this.model.SSU_Information.TargetGroupId).MembershipId;
    }
    this.isPatientInfoLoaded = true;
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
    this.ssuBLService.GetCountrySubDivision(countryId)
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
    if (!this.model.SsuPatientValidator.dirty || this.model.IsValidCheck(undefined, undefined)) {
      return true;
    }
    else {
      // for loop is used to show validation message 
      for (var i in this.model.SsuPatientValidator.controls) {
        this.model.SsuPatientValidator.controls[i].markAsDirty();
        this.model.SsuPatientValidator.controls[i].updateValueAndValidity();
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
  // ConditionalValidationOfAgeAndDOB() {
  //   if (this.model.IsDobVerified == true) {
  //     //incase age was entered.
  //     this.model.Age = null;
  //     let onOff = 'off';
  //     let formControlName = 'Age';
  //     this.model.UpdateValidator(onOff, formControlName);
  //     this.model.PatientValidator.controls['Age'].updateValueAndValidity();
  //   }
  //   else {
  //     let onOff = 'on';
  //     let formControlName = 'Age';
  //     this.model.UpdateValidator(onOff, formControlName);
  //     this.model.PatientValidator.controls['Age'].updateValueAndValidity();

  //   }
  // }


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
    let cntrl = this.model.SsuPatientValidator.controls[controlName];
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

  public LoadMembershipSettings() {
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "MembershipSchemeSettings");
    if (currParam && currParam.ParameterValue) {
      this.membershipSchemeParam = JSON.parse(currParam.ParameterValue);
    }
  }

  OnMembershipChanged($event: Membership) {
    if(this.model.FirstName ==""){
      this.setFocusById('regPatFirstName');
    }
    else{
      this.setFocusById('IncomeSource')
    }
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


  Save(flag: number) {
    let isValid = this.CheckValidation();
    if (isValid) {
      if (this.model.SSU_Information && (!this.model.SSU_Information.TargetGroup || this.model.SSU_Information.TargetGroupId <= 0)) {
        this.model.SSU_Information.TargetGroupId = undefined;
        this.msgBoxServ.showMessage('Error', ['Please Select Target Group!']);
        return;
      }
      // if (this.model && (this.model.FatherName == ' ' && this.model.MotherName == ' ') || (!this.model.FatherName && !this.model.MotherName)) {
      //   this.model.FatherName = undefined;
      //   this.model.MotherName = undefined;
      //   this.msgBoxServ.showMessage('Error', ['Please Enter Father or Mother Name !']);
      //   return;
      // }
      this.AssignPostData();
      if (flag == 0) {
        this.PostSsuPatient();
      }
      else if (flag == 1) {
        this.PutSsuPatient();
      }
    }
  }

  public PostSsuPatient() {
    this.ssuBLService.PostSsuPatient(this.model)
      .subscribe(
        (res: any) => {
          if (res.Status == "OK" && res.Results) {
            this.msgBoxServ.showMessage("Success", ['SSU patient Registered!']);
            this.ssuEmiter.emit("Ok");
          }

        },
        err => {
          this.msgBoxServ.showMessage("Please, Try again . Error while adding new SSU patient", [err.ErrorMessage]);
        });
  }

  public PutSsuPatient() {
    this.ssuBLService.PutSsuPatient(this.model)
      .subscribe(
        (res: any) => {
          if (res.Status == "OK" && res.Results) {
            this.msgBoxServ.showMessage("Success", ['SSU patient Updated Successfully!']);
            this.ssuEmiter.emit("Ok");
          }

        },
        err => {
          this.msgBoxServ.showMessage("Please, Try again . Error while updating new SSU patient", [err.ErrorMessage]);
        });
  }

  AssignPostData() {
    if (this.model.SSU_Information && this.model.SSU_Information.IncomeSource && this.model.SSU_Information.IncomeSource == 'Others') {
      this.model.SSU_Information.IncomeSource = this.OtherIncome;
    }
    this.model.Age = this.model.Age + this.model.AgeUnit;
  }

  CheckValidation(): boolean {

    for (var i in this.model.SsuPatientValidator.controls) {
      this.model.SsuPatientValidator.controls[i].markAsDirty();
      this.model.SsuPatientValidator.controls[i].updateValueAndValidity();
    }
    if (!this.model.Age) {
      this.msgBoxServ.showMessage("error", ["Please fill the Patient' Age"]);
      return;
    }
    if (this.model.IsValid(undefined, undefined)) {

      //removing extra spaces typed by the users
      this.model.FirstName = this.model.FirstName.trim();
      this.model.MiddleName = this.model.MiddleName ? this.model.MiddleName.trim() : "";
      this.model.LastName = this.model.LastName.trim();
      this.model.ShortName = this.model.FirstName + " " + this.model.MiddleName + this.model.LastName;

      //Get existing patient list by FirstName, LastName, Mobile Number
      // this.GetExistedMatchingPatientList();
      //this.RegisterNewPatient();
    }
    else {
      //alert("Patient Information are invalid.");
      this.msgBoxServ.showMessage("failed", ["One or more values are missing. Pls check and try again."]);
      return false;
    }

    return true;
  }

  OnTargetGroupChange() {
    let tgId = this.model.SSU_Information.TargetGroupId;
    if (tgId && tgId > 0) {
      let tg = this.TargetGroupList.find(a => a.TargetGroupId == tgId).TargetGroup;
      this.model.SSU_Information.TargetGroup = tg;
      this.model.SSU_Information.TG_CertificateType = tg + ' Certificate';
      this.AssignMembershipOnTargetGroupChage();
    }
  }

  Close() {
    this.ssuEmiter.emit("Close");
  }

    //common function to set focus on  given Element. 
    setFocusById(targetId: string, waitingTimeinMS: number = 10) {
      if( targetId==="saveButton"){
        if(this.model.PatientId<=0){
          targetId = "SaveButton0";
        }
        else{
          targetId = "SaveButton1";
        }
      }
      else if(targetId ==="TG_CertificateType"){
        if(this.hasTG_Certificate == false){
          targetId = "IncomeSource";
        }
        else{
          targetId="TG_CertificateType";
        }
      }
      else if(targetId ==="IncomeSource2"){
          if(this.model.SSU_Information.IncomeSource ==="Others"){
            targetId ="IncomeSource2";
          }
          else{
            targetId = "PatFamilyFinancialStatus"
          }
      }
      this.coreService.FocusInputById(targetId);
    }

    public hotkeys(event) {
      if (event.keyCode == 27) {
        this.ssuEmiter.emit("Close");
      }
    }

   
    public updateMunicipality(event){
      if(event){
      this.model.MunicipalityId = event.data;
      }
    }

}
