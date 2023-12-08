
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, Renderer2 } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from 'moment/moment';
import { Subscription } from "rxjs";
import { PatientScheme } from "../../billing/shared/patient-map-scheme";
import { CoreService } from "../../core/shared/core.service";
import { SsfPatient_DTO, SsfService } from "../../insurance/ssf/shared/service/ssf.service";
import { Patient } from "../../patients/shared/patient.model";
import { PatientService } from "../../patients/shared/patient.service";
import { CountrySubdivision } from "../../settings-new/shared/country-subdivision.model";
import { GeneralFieldLabels } from "../../shared/DTOs/general-field-label.dto";
import { Municipality } from "../../shared/address-controls/municipality-model";
import { DanpheCache, MasterType } from "../../shared/danphe-cache-service-utility/cache-services";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { RouteFromService } from "../../shared/routefrom.service";
import { ENUM_Country, ENUM_DanpheHTTPResponseText } from "../../shared/shared-enums";
import { VisitBLService } from "../shared/visit.bl.service";
import { VisitService } from "../shared/visit.service";

@Component({
  selector: "visit-patient-info",
  templateUrl: "./visit-patient-info.html",
  styleUrls: ['./visit-common.css']
})
export class VisitPatientInfoComponent implements OnInit {
  @Input("patient")
  public patient: Patient = new Patient();

  public countrySubDivisions: Array<CountrySubdivision> = [];
  public municipalities: Array<Municipality> = [];
  public countries: Array<any> = [];
  public calendarType: string = "";
  public countrySubDivision: CountrySubdivision = new CountrySubdivision();

  @Output("emit-membership-discount")
  public emitMembershipDiscount: EventEmitter<Object> = new EventEmitter<Object>();
  public initialLoad: boolean = false; //flag added by yubraj --6th sept 2018
  public olderAddressList: Array<any> = [];//for Autocomplete of Address Field.
  public isPhoneMandatory: boolean = false;
  //public AgeUnitDisable: boolean = false;
  public showMunicipality: boolean = false;
  public disableMembership: boolean = false;
  public defaultCountry: { CountryId: number; CountryName: string };
  public CountryNepal: string = ENUM_Country.Nepal;
  public tempMembershipTypeId: number = 0;
  disableAgeUnit = false;
  disableEchsNumber: boolean;
  disableSelectEthnicGroup = false;
  IsMedicareMemberEligibleForRegistration: boolean = false;
  public PatientImage: string = null;
  patientEthnicGroup: string = "";
  patientLastName: string = ""
  public PatientInfoSubscription = new Subscription();
  public ssfPatientDetail: SsfPatient_DTO = new SsfPatient_DTO();
  public GeneralFieldLabel = new GeneralFieldLabels();

  constructor(public patientService: PatientService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public visitBLService: VisitBLService,
    public visitService: VisitService,
    public changeDetector: ChangeDetectorRef,
    public renderer2: Renderer2,
    public router: Router,
    public RouteFrom: RouteFromService,
    public ssfService: SsfService) {
    //this.patient.MembershipTypeId = this.patientService.getGlobal().MembershipTypeId;
    //this.tempMembershipTypeId = this.patient.MembershipTypeId;
    this.LoadCalendarTypes();
    this.GetCountries();
    this.initialLoad = true;
    this.GeneralFieldLabel = coreService.GetFieldLabelParameter();

    if (this.coreService.Masters.UniqueDataList && this.coreService.Masters.UniqueDataList.UniqueAddressList) {
      this.olderAddressList = this.coreService.Masters.UniqueDataList.UniqueAddressList;
    }

    //this.LoadMembershipSettings();  //sud:14March'23--Not required since Scheme is no more part of this component
    this.isPhoneMandatory = this.coreService.GetIsPhoneNumberMandatory();
    this.showMunicipality = this.coreService.ShowMunicipality().ShowMunicipality;
    this.InitializePatientInfoSubscription();
  }

  InitializePatientInfoSubscription(): void {
    this.PatientInfoSubscription = this.visitService.ObserveSchemeChangedEvent().subscribe(res => {
      if (res) {
        this.ssfPatientDetail = res.ssfPatientDetail;
        if (this.patient && this.patient.LastName) {
          this.setEthnicGroupOfPatient(this.patient.LastName);
        }
      }
    });

  }
  ngOnDestroy() {
    this.PatientInfoSubscription.unsubscribe();
  }
  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    this.defaultCountry = this.coreService.GetDefaultCountry();
    this.InitializeNewPatient();
    this.phoneNumberMandatory();
  }


  public InitializeNewPatient() {
    this.patient = Object.assign(this.patient, this.patientService.getGlobal());
    this.patient.PatientScheme = new PatientScheme();
    if (this.patient.PatientId) {
      this.countrySubDivision["CountrySubDivisionId"] = this.patient.CountrySubDivisionId;
      this.countrySubDivision["CountrySubDivisionName"] = this.patient.CountrySubDivisionName;
      // this.patientEthnicGroup = this.patient.EthnicGroup;
      if (this.patient.EthnicGroup) {
        this.patientEthnicGroup = this.patient.EthnicGroup;
      } else {
        this.setEthnicGroupOfPatient(this.patient.LastName);
      }
      this.SeparateAgeAndUnit();
      this.DisableInputFields();

    }
    else {

      let subDivision = this.coreService.GetDefaultCountrySubDivision();
      this.patient.CountryId = this.defaultCountry ? this.defaultCountry.CountryId : null;
      this.patient.CountryName = this.defaultCountry ? this.defaultCountry.CountryName : null;
      this.countrySubDivision.CountrySubDivisionId = this.patient.CountrySubDivisionId = subDivision ? subDivision.CountrySubDivisionId : null;
      this.countrySubDivision.CountrySubDivisionName = this.patient.CountrySubDivisionName = subDivision ? subDivision.CountrySubDivisionName : null;
      this.LoadDOBdefault();
    }
    this.ConditionalValidationOfAgeAndDOB();
    this.updatePatientValidatorsInCaseOfCountryNepal();
    this.CalculateDob();
    if (this.patientService.Telmed_Payment_Status === "paid") {
      this.disableMembership = true;
    }
  }
  setEthnicGroupOfPatient(patientLastName: string): void {
    this.patientLastName = patientLastName;
  }

  DisableInputFields() {
    this.patient.EnableControl("FirstName", false);
    this.patient.EnableControl("LastName", false);
    this.patient.EnableControl("MiddleName", false);
    this.patient.EnableControl("Age", false);
    this.disableAgeUnit = true;
    this.disableSelectEthnicGroup = false;
    this.disableEchsNumber = true;
    this.patient.EnableControl("DateOfBirth", false);
    this.patient.EnableControl("Gender", false);
    this.patient.EnableControl("ItemName", false);
    this.patient.EnableControl("CountrySubDivisionId", false);
    this.patient.EnableControl("Email", false);
    if (this.patient.PhoneNumber)
      this.patient.EnableControl("PhoneNumber", false);
    this.patient.EnableControl("CountryId", false);
    this.patient.EnableControl("Address", false);
    this.patient.EnableControl("PANNumber", false);
    this.patient.EnableControl("MembershipTypeId", false);
    //this.AgeUnitDisable = true;
  }

  LoadCalendarTypes() {
    let Parameter = this.coreService.Parameters;
    Parameter = Parameter.filter(parms => parms.ParameterName === "CalendarTypes");
    let calendarTypeObject = JSON.parse(Parameter[0].ParameterValue);
    this.calendarType = calendarTypeObject.PatientVisit;
  }

  GetCountrySubDivision() {

    let country = this.countries.find(a => a.CountryId === Number(this.patient.CountryId))
    this.patient.CountryName = country ? country.CountryName : "";

    this.visitBLService.GetCountrySubDivision(this.patient.CountryId)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results) {
          this.countrySubDivisions = [];
          this.countrySubDivisions = res.Results;

          if (this.initialLoad) { //checking whether it is for new registration or not
            var selCountrySubDiv = this.countrySubDivisions.find(a => a.CountrySubDivisionId === Number(this.patient.CountrySubDivisionId) || a.CountrySubDivisionName === this.patient.CountrySubDivisionName);
            if (selCountrySubDiv) {
              this.patient.CountrySubDivisionName = selCountrySubDiv.CountrySubDivisionName;
              this.patient.CountrySubDivisionId = selCountrySubDiv.CountrySubDivisionId;

              this.countrySubDivision["CountrySubDivisionId"] = this.patient.CountrySubDivisionId;
              this.countrySubDivision["CountrySubDivisionName"] = this.patient.CountrySubDivisionName;
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
            if (this.patient.CountryId !== Number(this.defaultCountry.CountryId)) {
              var selCountrySubDiv = this.countrySubDivisions.find(a => a.CountryId === Number(this.patient.CountryId));
              this.patient.CountrySubDivisionName = selCountrySubDiv.CountrySubDivisionName;
              this.patient.CountrySubDivisionId = selCountrySubDiv.CountrySubDivisionId;
              const country = this.countries.find(a => a.CountryId === Number(this.patient.CountryId))
              this.patient.CountryName = country ? country.countryName : "";
            }
          }
          this.AssignSelectedDistrict();
          this.updatePatientValidatorsInCaseOfCountryNepal();
        }
        else {
          this.msgBoxServ.showMessage("failed", ['Failed to get country sub divisions.']);
          console.log(res.ErrorMessage);
        }
      });
  }
  private updatePatientValidatorsInCaseOfCountryNepal(): void {
    if (this.patient.CountryName === ENUM_Country.Nepal && this.showMunicipality) {
      //this.patient.PatientValidator.get("WardNumber").setValidators([Validators.required, Validators.pattern('^[0-9]{1,2}$')]);
      //this.patient.PatientValidator.get("Municipality").setValidators(Validators.required);
    }
    else {
      //this.patient.PatientValidator.get("WardNumber").clearValidators();
      //this.patient.PatientValidator.get("Municipality").clearValidators();
    }
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
  }

  SeparateAgeAndUnit() {
    let separateAgeUnit = this.patientService.SeperateAgeAndUnit(this.patient.Age);
    if (separateAgeUnit) {
      this.patient.Age = separateAgeUnit.Age;
      this.patient.AgeUnit = separateAgeUnit.Unit;
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
    this.visitService.TriggerPatientAgeChangeEvent(this.patient.Age);
  }

  CalculateAge() {
    let dobYear: number = Number(moment(this.patient.DateOfBirth).format("YYYY"));
    if (dobYear > 1920) {
      this.patient.Age = String(Number(moment().format("YYYY")) - Number(moment(this.patient.DateOfBirth).format("YYYY")));
    }
    this.visitService.TriggerPatientAgeChangeEvent(this.patient.Age);
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
    } else {
      this.patient.CountrySubDivisionId = null;
      this.patient.CountrySubDivisionName = null;
    }
  }

  //conditional validation for age and Dob
  //if on is passed to the UpdateValidator in model the Age is validated and
  // if off on is passed to the UpdateValidator in model the dob is validated and
  ConditionalValidationOfAgeAndDOB() {
    if (this.patient.IsDobVerified) {
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
  @Input() tender: any;

  SetFocusTenderOrRemarks() {
    const tenderDisabled = this.tender === 'credit';
    if (tenderDisabled) {
      this.coreService.FocusInputById('id_billing_remarks', 100);
    } else {
      this.coreService.FocusInputById('tender', 100);
    }
  }
  public phoneNumberMandatory() {
    if (!this.isPhoneMandatory) {
      this.patient.UpdatePhoneValidator("off", "PhoneNumber");
    }
  }

  public updateMunicipality(event) {
    this.patient.PatientValidator.get("Municipality").setValue('');
    if (event) {
      this.patient.MunicipalityId = event.data ? event.data.MunicipalityId : null;
      this.patient.MunicipalityName = event.data ? event.data.MunicipalityName : null;
      this.patient.PatientValidator.get("Municipality").setValue(this.patient.MunicipalityName);
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
  onLastNameChanged($event) {
    if ($event) {
      const lastName = $event.target.value;
      this.patientLastName = lastName;
    }
  }
  onEthnicGroupChangeCallBack(ethnicGroup) {
    if (ethnicGroup) {
      this.patient.EthnicGroup = ethnicGroup.ethnicGroup;
    }
  }
}

//! Krishna, 15thMarch'23 Below class should not be here, need to move it to its appropriate location
export class Rank_ApfHospital {
  public RankId: number = null;
  public RankName: string = null;
  public RankDescription: string = null;
}
