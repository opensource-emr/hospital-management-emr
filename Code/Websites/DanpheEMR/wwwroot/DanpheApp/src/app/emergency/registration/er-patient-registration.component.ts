import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment/moment';
import { PatientScheme_DTO } from '../../billing/shared/dto/patient-scheme.dto';
import { RegistrationScheme_DTO } from '../../billing/shared/dto/registration-scheme.dto';
import { PatientScheme } from '../../billing/shared/patient-map-scheme';
import { CoreService } from '../../core/shared/core.service';
import { SsfPatient_DTO } from '../../insurance/ssf/shared/service/ssf.service';
import { Patient } from '../../patients/shared/patient.model';
import { PatientService } from '../../patients/shared/patient.service';
import { GeneralFieldLabels } from '../../shared/DTOs/general-field-label.dto';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { CommonFunctions } from '../../shared/common.functions';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status, ENUM_Scheme_ApiIntegrationNames, ENUM_ServiceBillingContext } from '../../shared/shared-enums';
import { ModeOfArrivalModel } from '../shared/ModeOfArrival.model';
import { EmergencyPatientCases } from '../shared/emergency-patient-cases.model';
import { EmergencyPatientModel } from '../shared/emergency-patient.model';
import { EmergencyBLService } from '../shared/emergency.bl.service';
import { EmergencyService } from '../shared/emergency.service';

@Component({
  selector: 'er-patient-registration',
  templateUrl: './er-patient-registration.html',
  host: { '(window:keydown)': 'hotkeys($event)' }
})

// App Component class
export class ERPatientRegistrationComponent {
  public loading: boolean = false;
  public addNewUnknownERPatient: boolean = false;
  public defaultLoad: boolean = true;

  public ERPatient: EmergencyPatientModel = new EmergencyPatientModel();
  public ERPatientNumber: number = null;
  public CountrySubDivisionList: any;
  public selDistrict;
  public selDistrictOfBite;
  public calType: string = "";
  public Countries: any = null;

  public update: boolean = false;
  public isPoliceCaseState: boolean = false;
  public showTriageOption: boolean = false;

  public erServiceDepartmentName: string = null;

  public ModeOfArrivalList: Array<ModeOfArrivalModel> = new Array<ModeOfArrivalModel>();
  public SelectedModeOfArrival: any = null;

  @Output("sendBackERPatientData") sendERPatientData: EventEmitter<object> = new EventEmitter<object>();
  @Input("currentPatientToEdit") currentERPatient: EmergencyPatientModel = null;
  @Input("selectionFromExisting") selectionFromExistingPatient: boolean = false;

  public matchingPatientList: Array<any> = [];
  public showMatchingPatientList: boolean = false;
  public allCasesMaster: any;
  public showPoliceCase: boolean = false;
  public nestedCases: Array<any> = new Array<any>();
  public showOthersTextBox: boolean = false;
  public showAnimalBiteDetailEntry: boolean = false;
  public showDogBiteDetailEntry: boolean = false;
  public showSnakeBiteDetailEntry: boolean = false;
  public firstAidOther: boolean = false;
  public bitingSnakeOther: boolean = false;
  public bittenOnPart: boolean = false;
  public serviceBillingContext: string = ENUM_ServiceBillingContext.OpBilling;
  public snakeTypes: any;
  public bittenPart: any;
  public firstAidData: any;
  public ocmcSelected: boolean = false;
  public showMunicipality: boolean = false;
  @ViewChild('closebutton') closeButton;
  public RegistrationSchemeDetail: RegistrationScheme_DTO;
  public isValidSchemeSelected: boolean;
  public schemeObj_old: RegistrationScheme_DTO = new RegistrationScheme_DTO();
  public patientLastName: string = ""
  public ShowTriagePopup: boolean = false;
  public patientEthnicGroup: string = "";

  //public Muncipalitylable: string = "";
  public GeneralFieldLabel = new GeneralFieldLabels();

  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _messageBoxService: MessageboxService,
    private _emergencyBLService: EmergencyBLService,
    private _patientService: PatientService,
    private _coreService: CoreService,
    // private coreService: CoreService,
    private _emergencyService: EmergencyService
  ) {

    this.GeneralFieldLabel = _coreService.GetFieldLabelParameter();
    /*var Muncipalitylable = JSON.parse(_coreService.Parameters.find(p => p.ParameterGroupName == "Patient" && p.ParameterName == "Municipality").ParameterValue);
    if (Muncipalitylable) {
      this.Muncipalitylable = Muncipalitylable.Municipality;
    }
    */


    this.GetERPatNumAndModeOfArrival();
    this.InitializeData();
    this.LoadCalendarTypes();
    this.LoadCountryList();
    this.allCasesMaster = this._emergencyService.casesLookUpDetail;
    this.bittenPart = this._emergencyService.bittenBodyPartList;
    this.snakeTypes = this._emergencyService.snakeList;
    this.firstAidData = this._emergencyService.firstAidList;
    let currParam = this._coreService.Parameters.find(a => a.ParameterGroupName === "Emergency" && a.ParameterName === "EmergencyRegistrationDisplaySettings");
    if (currParam && currParam.ParameterValue) {
      let params = JSON.parse(currParam.ParameterValue);
      this.showPoliceCase = params.ShowIsPoliceCase;
    }

    // this.snakeTypes = erService.bitingSnake;
    // this.bittenPart = erService.bittenBodyPart;
    // this.firstAidData = erService.firstAid;

    this.showMunicipality = this._coreService.ShowMunicipality().ShowMunicipality;

  }

  ngOnInit() {
    this.erServiceDepartmentName = this._coreService.GetERDepartmentName();
    if (this.selectionFromExistingPatient) {
      if (this.currentERPatient && this.currentERPatient.PatientId && !this.currentERPatient.PatientVisitId) {
        if (this.currentERPatient.Age && this.currentERPatient.Age !== null
          && (this.currentERPatient.Age.includes("Y") || this.currentERPatient.Age.includes("M") || this.currentERPatient.Age.includes("D"))) {
          this.SplitAgeAndUnitFromInputPatient(this.currentERPatient);
        }
        this.update = false;
        this.ERPatient.EnableControl("FirstName", false);
        this.ERPatient.EnableControl("Gender", false);
        this.InitializeDataSelected();
      }
    }
    else {
      if (this.currentERPatient && this.currentERPatient.PatientId && this.currentERPatient.PatientVisitId) {
        if (this.currentERPatient.Age && this.currentERPatient.Age !== null) {
          this.SplitAgeAndUnitFromInputPatient(this.currentERPatient);
        }
        if (this.currentERPatient.EthnicGroup) {
          this.patientEthnicGroup = this.currentERPatient.EthnicGroup;
        } else {
          this.setEthnicGroupOfPatient(this.currentERPatient.LastName);
        }
        this.update = true;
        if (this.currentERPatient.IsExistingPatient) {
          this._changeDetector.detectChanges();
          //this.ERPatient.ERPatientValidator.controls["FirstName"].setValue(this.currentERPatient.FirstName);
          //this.ERPatient.ERPatientValidator.controls["Gender"].setValue(this.currentERPatient.Gender);
          this.ERPatient.EnableControl("FirstName", false);
          this.ERPatient.EnableControl("Gender", false);
          this.ERPatient.AgeUnit = this.currentERPatient.AgeUnit;

        }
        if (this.currentERPatient.PatientCases) {
          this.AssignNestedCases(this.currentERPatient.PatientCases.MainCase);
        } else {
          this.currentERPatient.PatientCases = new EmergencyPatientCases();
        }

        this.InitializeDataSelected();
      }
      else {
        this.update = false;
        this.ERPatient = new EmergencyPatientModel();
        this.ERPatient.DateOfBirth = moment().format('YYYY-MM-DD');
        this.ERPatient.Age = "0";
        this.GetCountrySubDivision();
      }
    }
  }
  setEthnicGroupOfPatient(patientLastName: string): void {
    this.patientLastName = patientLastName;
  }
  ngAfterViewInit() {
    let firstName = document.getElementById('erPatFirstName');
    if (firstName) {
      firstName.focus();
    }
  }

  OnRegistrationSchemeChanged(scheme: RegistrationScheme_DTO): void {
    console.log("RegistrationSchemeChange called from Visit-Main.component");
    console.log(scheme);
    this.RegistrationSchemeDetail = scheme;
    const newSchemeObj = _.cloneDeep(scheme);
    if (newSchemeObj && newSchemeObj.SchemeId) {
      this.isValidSchemeSelected = true;
      if (_.isEqual(newSchemeObj, this.schemeObj_old)) {
        return;
      }
      else {
        this.ERPatient.SchemeId = this.RegistrationSchemeDetail.SchemeId;
        this.ERPatient.PriceCategoryId = this.RegistrationSchemeDetail.PriceCategoryId;
        newSchemeObj.PatientScheme.LatestClaimCode = newSchemeObj.ClaimCode;
        newSchemeObj.PatientScheme.PolicyNo = newSchemeObj.MemberNo;
        newSchemeObj.PatientScheme.SubSchemeId = newSchemeObj.SubSchemeId;
        if (newSchemeObj.SchemeApiIntegrationName === ENUM_Scheme_ApiIntegrationNames.SSF && newSchemeObj.ssfPatientDetail && newSchemeObj.ssfPatientDetail.FirstName && !this.ERPatient.PatientId) {
          const patient = this.GetPatientMappedFromRegistrationSchemeDto(newSchemeObj.ssfPatientDetail); //! Krishna, 26thMarch'23 We need this logic for SSF, Medicare, etc
          this.ERPatient.FirstName = patient.FirstName
          this.ERPatient.LastName = patient.LastName
          this.ERPatient.MiddleName = patient.MiddleName
          this.ERPatient.Address = patient.Address
          this.ERPatient.DateOfBirth = patient.DateOfBirth
          this.ERPatient.Gender = patient.Gender
          this.ERPatient.Age = patient.Age
        }
        this.ERPatient.PatientScheme = this.GetPatientSchemeMappedFromRegistrationSchemeDto(newSchemeObj.PatientScheme);
        this.ERPatient.PatientScheme.LatestClaimCode = newSchemeObj.ClaimCode;
        this.ERPatient.SchemeId = newSchemeObj.SchemeId;
        this.ERPatient.ClaimCode = newSchemeObj.ClaimCode;
        this.ERPatient.PriceCategoryId = newSchemeObj.PriceCategoryId;
        this.schemeObj_old = newSchemeObj;
      }
    }
  }


  GetPatientMappedFromRegistrationSchemeDto(ssfPatientDetail: SsfPatient_DTO): Patient {
    const patient = new Patient();
    patient.FirstName = ssfPatientDetail.FirstName;
    patient.LastName = ssfPatientDetail.LastName;
    patient.MiddleName = "";
    patient.Address = ssfPatientDetail.Address;
    patient.DateOfBirth = ssfPatientDetail.DateOfBirth;
    patient.Gender = ssfPatientDetail.Gender;
    patient.Age = this.CalculateAge(ssfPatientDetail.DateOfBirth);
    return patient;
  }

  CalculateAge(dateOfBirth): string {
    let dobYear: number = Number(moment(dateOfBirth).format("YYYY"));
    if (dobYear > 1920) {
      return String(Number(moment().format("YYYY")) - Number(moment(dateOfBirth).format("YYYY")));
    }
  }

  GetPatientSchemeMappedFromRegistrationSchemeDto(patientSchemeObj: PatientScheme_DTO): PatientScheme {
    const patientScheme = new PatientScheme();
    patientScheme.PatientId = patientSchemeObj.PatientId !== null ? patientSchemeObj.PatientId : 0;
    patientScheme.PatientCode = patientSchemeObj.PatientCode !== null ? patientSchemeObj.PatientCode : null;
    patientScheme.SchemeId = patientSchemeObj.SchemeId;
    patientScheme.PolicyNo = patientSchemeObj.PolicyNo;
    patientScheme.PatientSchemeValidator.get("PolicyNo").setValue(patientScheme.PolicyNo);
    patientScheme.PolicyHolderUID = patientSchemeObj.PolicyHolderUID;
    patientScheme.OpCreditLimit = patientSchemeObj.OpCreditLimit;
    patientScheme.IpCreditLimit = patientSchemeObj.IpCreditLimit;
    patientScheme.GeneralCreditLimit = patientSchemeObj.GeneralCreditLimit;
    patientScheme.PolicyHolderEmployerName = patientSchemeObj.PolicyHolderEmployerName;
    patientScheme.LatestClaimCode = patientSchemeObj.LatestClaimCode;
    patientScheme.OtherInfo = patientSchemeObj.OtherInfo;
    patientScheme.PolicyHolderEmployerID = patientSchemeObj.PolicyHolderEmployerID;
    patientScheme.SubSchemeId = patientSchemeObj.SubSchemeId;
    return patientScheme;
  }

  InitializeData(): void {
    this.ERPatient = new EmergencyPatientModel();
  }

  InitializeDataSelected(): void {
    this.ERPatient = this.currentERPatient;
    //this.changeDetector.detectChanges();
    if (this.ERPatient.DateOfBirth === null) {
      if (!this.ERPatient.Age) {
        this.ERPatient.DateOfBirth = moment().format('YYYY-MM-DD');
        this.ERPatient.Age = "0";
      } else { this.CalculateDob(); }
    }
    else if (isNaN(Date.parse(this.ERPatient.DateOfBirth))) {
      if (!this.ERPatient.Age) {
        this.ERPatient.DateOfBirth = moment().format('YYYY-MM-DD');
        this.ERPatient.Age = "0";
      } else { this.CalculateDob(); }
    }
    else {
      this.ERPatient.DateOfBirth = moment(this.currentERPatient.DateOfBirth).format('YYYY-MM-DD');
    }
    this.isPoliceCaseState = this.ERPatient.IsPoliceCase;
    if (this.ERPatient.ModeOfArrival) {
      let currMoa = new ModeOfArrivalModel();
      currMoa.ModeOfArrivalId = this.ERPatient.ModeOfArrival;
      currMoa.ModeOfArrivalName = this.ERPatient.ModeOfArrivalName;
      this.SelectedModeOfArrival = currMoa;
    }
    //this.generateAge();
    this.CalculateDob();
    this.GenerateAge();
    //this.changeDetector.detectChanges();
    this.GetCountrySubDivision();
  }

  GetERPatNumAndModeOfArrival(): void {
    this._emergencyBLService.GetERNumAndModeOfArrData()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          //assign the unique patientNumber
          this.ERPatientNumber = res.Results.LatestERPatientNumber;
          this.ModeOfArrivalList = res.Results.AllModeOfArrival;
        }
      });
  }


  RegisterNewERPatient(): void {
    this.loading = true;
    if (this.loading) {
      //check if middlename exists or not to append to Shortname
      var midName = this.ERPatient.MiddleName;
      if (midName) {
        midName = this.ERPatient.MiddleName.trim() + " ";
      } else {
        midName = " ";
      }

      this.ERPatient.FirstName = this.ERPatient.FirstName.trim();
      this.ERPatient.LastName = this.ERPatient.LastName.trim();
      this.ERPatient.MiddleName = this.ERPatient.MiddleName ? this.ERPatient.MiddleName.trim() : this.ERPatient.MiddleName;
      this.ERPatient.ShortName = this.ERPatient.FirstName + midName + this.ERPatient.LastName;

      this.ERPatient.DefaultDepartmentName = this.erServiceDepartmentName;
      if ((this.ERPatient.Age || this.ERPatient.Age === "0") && !this.ERPatient.DateOfBirth) {
        this.CalculateDob;
        var age = this.ERPatient.Age;
        this.ERPatient.Age = age + this.ERPatient.AgeUnit;
      } else {
        var age = this.ERPatient.Age;
        this.ERPatient.Age = age + this.ERPatient.AgeUnit;
      }

      if (this.addNewUnknownERPatient && !this.selectionFromExistingPatient) {
        this.ERPatient.FirstName = "Unknown-" + this.ERPatientNumber;
        this.ERPatient.LastName = "Unknown-" + this.ERPatientNumber;
        this.ERPatient.ERPatientValidator.controls["FirstName"].setValue(this.ERPatient.FirstName);
      }

      if (this.selectionFromExistingPatient && this.ERPatient.PatientId && !this.ERPatient.PatientVisitId) {
        this.ERPatient.ERPatientValidator.controls["FirstName"].enable();
        this.ERPatient.ERPatientValidator.controls["Gender"].enable();
      }

      //for checking validations, marking all the fields as dirty and checking the validity.
      for (var i in this.ERPatient.ERPatientValidator.controls) {
        this.ERPatient.ERPatientValidator.controls[i].markAsDirty();
        this.ERPatient.ERPatientValidator.controls[i].updateValueAndValidity();
      }
      if (this.ERPatient.IsValid(undefined, undefined) && this.ERPatient.EthnicGroup) {
        this._emergencyBLService.PostERPatient(this.ERPatient, this.selectionFromExistingPatient)
          .subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              this.sendERPatientData.emit({ submit: true, ERPatient: res.Results });
              this.selectionFromExistingPatient = false;
              this._messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ['New Emergency Patient Added']);
              this.loading = false;
            }
            else {
              this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Sorry, Patient Cannot be Added']);
              console.log(res.ErrorMessage);
              this.loading = false;
            }
          });

      }
      else {
        this.loading = false;
        this._messageBoxService.showMessage(ENUM_DanpheHTTPResponses.Failed, ["One or more validation error occurred"]);
      }
    }
  }


  UpdateERPatient(): void {
    this.loading = true;
    if (this.loading) {
      if ((this.ERPatient.Age || this.ERPatient.Age === "0") && !this.ERPatient.DateOfBirth) {
        this.CalculateDob;
        var age = this.ERPatient.Age;
        this.ERPatient.Age = age + this.ERPatient.AgeUnit;
      } else {
        var age = this.ERPatient.Age;
        this.ERPatient.Age = age + this.ERPatient.AgeUnit;
      }

      //for checking validations, marking all the fields as dirty and checking the validity.
      for (var i in this.ERPatient.ERPatientValidator.controls) {
        this.ERPatient.ERPatientValidator.controls[i].markAsDirty();
        this.ERPatient.ERPatientValidator.controls[i].updateValueAndValidity();
      }
      if (this.ERPatient.IsValid(undefined, undefined)) {
        this._emergencyBLService.UpdateERPatient(this.ERPatient)
          .subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              this.sendERPatientData.emit({ submit: true, ERPatient: res.Results });
              this.loading = false;
              this._messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ['Emergency Patient Updated']);
            }
            else {
              this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Sorry, Patient Cannot be Updated']);
              this.loading = false;
            }
          });
      }
      else {
        this.loading = false;
      }
    }
  }

  GetMatchingPatientList(): void {
    // if (!this.update && this.ERPatient.TriageCode === null) {
    //   this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Please Triage the patient first.']);
    //   this.loading = false;
    //   return;
    // }
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.ERPatient.ERPatientValidator.controls) {
      this.ERPatient.ERPatientValidator.controls[i].markAsDirty();
      this.ERPatient.ERPatientValidator.controls[i].updateValueAndValidity();
    }
    if (this.ERPatient.IsValid(undefined, undefined)) {
      this.matchingPatientList = [];
      this.loading = true;

      if (!this.addNewUnknownERPatient && !this.selectionFromExistingPatient) {
        this._emergencyBLService.GetMatchingPatientInER(this.ERPatient.FirstName.trim(), this.ERPatient.LastName.trim(),
          this.ERPatient.DateOfBirth.trim(), this.ERPatient.ContactNo.trim())
          .subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.length > 0) {
              if (this.ERPatient.PatientId && this.update) {
                this.matchingPatientList = res.Results.filter(r => (r.PatientId != this.ERPatient.PatientId));
                if (this.matchingPatientList && this.matchingPatientList.length) {
                  this.showMatchingPatientList = true;
                } else {
                  this.UpdateERPatient();
                }
              } else {
                this.matchingPatientList = res.Results;
                this.showMatchingPatientList = true;
              }
            }
            else {
              if (this.update) {
                this.UpdateERPatient();
              } else {
                this.RegisterNewERPatient();
              }
            }
          });
      } else {
        if (this.update) {
          this.UpdateERPatient();
        } else {
          this.RegisterNewERPatient();
        }
      }
    } else {
      this.loading = false;
    }
  }

  //captalize first letter (controlName for field is use to update)
  capitalizeFirstLetter(inputString): string {
    let returnStr: string = CommonFunctions.CapitalizeFirstLetter(inputString);
    return returnStr;
  }

  AddUnknownERPatient(): void {
    this.ERPatient = new EmergencyPatientModel();
    this._changeDetector.detectChanges();
    this.defaultLoad = true;

    if (!this.addNewUnknownERPatient) {
      this.ERPatient.SchemeId = this.RegistrationSchemeDetail.SchemeId;
      this.ERPatient.PriceCategoryId = this.RegistrationSchemeDetail.PriceCategoryId;
      this.addNewUnknownERPatient = true;
      this.ERPatient.FirstName = "Unknown-" + this.ERPatientNumber;
      this.ERPatient.LastName = "Unknown-" + this.ERPatientNumber;
      this.ERPatient.Gender = null;
      this.ERPatient.Age = "0";
      this.ERPatient.DateOfBirth = moment().format('YYYY-MM-DD');
      this.ERPatient.CountryId = this.GetCountryParameter();
      this.GetCountrySubDivision();
      this.ERPatient.EnableControl("FirstName", false);
      this.ERPatient.EnableControl("LastName", false);
      //this.ERPatient.ERPatientValidator.controls["FirstName"].setValue(this.ERPatient.FirstName);
      //this.ERPatient.EnableControl("Gender", false);
    }
    else {
      this.addNewUnknownERPatient = false;
      this.ERPatient.CountryId = this.GetCountryParameter();
      this.ERPatient.Age = "0";
      this.ERPatient.Gender = null;
      this.ERPatient.DateOfBirth = moment().format('YYYY-MM-DD');
      this.GetCountrySubDivision();
      this.ERPatient.EnableControl("FirstName", true);
      this.ERPatient.EnableControl("LastName", true);
      //this.ERPatient.EnableControl("FirstName", true);
      //this.ERPatient.EnableControl("Gender", true);
    }


  }

  //loads CalendarTypes from Paramter Table (database) and assign the require CalendarTypes to local variable.
  LoadCalendarTypes(): void {
    let Parameter = this._coreService.Parameters;
    Parameter = Parameter.filter(parms => parms.ParameterName === "CalendarTypes");
    let calendarTypeObject = JSON.parse(Parameter[0].ParameterValue);
    this.calType = calendarTypeObject.PatientRegistration;
  }

  //Gets the list of all the countries
  LoadCountryList(): void {
    this._emergencyBLService.GetAllCountries()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.Countries = res.Results;
          this.ERPatient.CountryId = this.GetCountryParameter();
          this.ERPatient.PatientCases.BitingCountry = this.GetCountryParameter();
        }
      });
  }

  //Get the default country parameter from Parameter Table
  GetCountryParameter(): number {
    let countryId: number = 0;
    try {
      if (this.ERPatient.CountryId) {
        countryId = this.ERPatient.CountryId;
      } else {
        let countryJson = this._coreService.Parameters.filter(a => a.ParameterName === 'DefaultCountry')[0]["ParameterValue"];
        countryId = JSON.parse(countryJson).CountryId;
      }
    } catch (ex) {
      countryId = 0;
    }
    return countryId;
  }

  // this is used to get data from master table according to the countryId
  GetCountrySubDivision(): void {
    var countryId = this.ERPatient.CountryId;
    this._emergencyBLService.GetCountrySubDivision(countryId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.length) {
          this.CountrySubDivisionList = [];
          res.Results.forEach(a => {
            this.CountrySubDivisionList.push({
              "Key": a.CountrySubDivisionId, "Value": a.CountrySubDivisionName
            });
          });

          if (this.defaultLoad) {
            if (!this.ERPatient.PatientId) { //checking whether it is for new registration or not
              this.LoadCountryDefaultSubDivision(); //to get the default district/state
            }
            else {
              let district = this.CountrySubDivisionList.find(a => a.Key === this.ERPatient.CountrySubDivisionId);
              this.selDistrict = district ? district.Value : "";

              this.selDistrictOfBite = district ? district.Value : "";
            }
          }
          else {
            this.selDistrict = this.CountrySubDivisionList[0].Value;
            this.selDistrictOfBite = this.CountrySubDivisionList[0].Value;
          }
          this.DistrictChanged();
        }
        else {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
          //alert(res.ErrorMessage);
        }
      },
        err => {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["failed get State/ District.please check log for details."]);
          //alert('failed get State/District. please check log for details.');

          console.log(err.ErrorMessage);
        });
  }

  //getting country name from core_CFG_parameter table
  LoadCountryDefaultSubDivision(): void {
    let subDivision = this._coreService.GetDefaultCountrySubDivision();
    if (subDivision) {
      this.ERPatient.CountrySubDivisionId = subDivision.CountrySubDivisionId;
      this.selDistrict = subDivision.CountrySubDivisionName;
      this.ERPatient.PatientCases.BitingMunicipality = subDivision.CountrySubDivisionId;
      this.selDistrictOfBite = subDivision.CountrySubDivisionName;
    }
  }

  DistrictChanged(): void {
    let district = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.selDistrict && this.CountrySubDivisionList) {
      if (typeof (this.selDistrict) === 'string' && this.CountrySubDivisionList.length) {
        district = this.CountrySubDivisionList.find(a => a.Value.toLowerCase() === this.selDistrict);
      }
      else if (typeof (this.selDistrict) === 'object') {
        district = this.selDistrict;
      }
      if (district) {
        this.ERPatient.CountrySubDivisionId = district.Key;
      }
    }
  }
  TriagePatient(severity: number): void {
    this.loading = true;
    if (this.loading) {
      if (severity) {
        if (severity === 1) {
          this.ERPatient.TriageCode = "mild";
        }
        else if (severity === 2) {
          this.ERPatient.TriageCode = "moderate";
        }
        else if (severity === 3) {
          this.ERPatient.TriageCode = "critical";
        }
        else if (severity === 4) {
          this.ERPatient.TriageCode = "death";
        }
        this._messageBoxService.showMessage("Info", ["Triaged as " + this.ERPatient.TriageCode]);
        this.loading = false;
        this.ShowTriagePopup = false;
        // this.closeButton.nativeElement.click();
      }
    }
  }

  BitingMunicipalityChanged(): void {
    let district = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.selDistrictOfBite && this.CountrySubDivisionList) {
      if (typeof (this.selDistrictOfBite) === 'string' && this.CountrySubDivisionList.length) {
        district = this.CountrySubDivisionList.find(a => a.Value.toLowerCase() === this.selDistrict);
      }
      else if (typeof (this.selDistrictOfBite) === 'object') {
        district = this.selDistrictOfBite;
      }
      if (district) {
        this.ERPatient.PatientCases.BitingMunicipality = district.Key;
      }
    }
  }

  ModeOfArrivalChanged(): void {
    let moa = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.SelectedModeOfArrival) {
      console.log(typeof (this.SelectedModeOfArrival));
      if (typeof (this.SelectedModeOfArrival) === 'string' && this.SelectedModeOfArrival.trim() !== '') {
        this.ERPatient.ModeOfArrival = null;
        this.ERPatient.ModeOfArrivalName = this.SelectedModeOfArrival;
      }
      else if (typeof (this.SelectedModeOfArrival) === 'object') {
        moa = this.SelectedModeOfArrival;
        if (moa) {
          this.ERPatient.ModeOfArrival = moa.ModeOfArrivalId;
          this.ERPatient.ModeOfArrivalName = moa.ModeOfArrivalName;
        }
      }
    } else {
      this.ERPatient.ModeOfArrival = null;
      this.ERPatient.ModeOfArrivalName = null;
    }
  }

  //used to format display of item in ng-autocomplete.
  MyListFormatter(data: any): string {
    let html = data["Value"];
    return html;
  }

  ModeOfArrivalListFormatter(data: any): string {
    let html = data["ModeOfArrivalName"];
    return html;
  }

  CalculateDob(indicator?: number): void {
    if (this.ERPatient.AgeUnit) {
      if (this.ERPatient.AgeUnit === 'M') {
        this.ERPatient.AgeUnit = "D";
      }
      else if (this.ERPatient.AgeUnit === 'D') {
        this.ERPatient.AgeUnit = "M";
      }
      else if (this.ERPatient.AgeUnit === 'Y') {
        this.ERPatient.AgeUnit = "Y";
      }
    }
    //if (this.model.Age && this.model.AgeUnit) {
    if ((this.ERPatient.Age || this.ERPatient.Age === "0") && this.ERPatient.AgeUnit) {
      var age: number = Number(this.ERPatient.Age);
      var ageUnit: string = this.ERPatient.AgeUnit;
      this.ERPatient.DateOfBirth = this._patientService.CalculateDOB(age, ageUnit);
    }
  }

  GenerateAge(): void {
    let dobYear: number = Number(moment(this.ERPatient.DateOfBirth).format("YYYY"));
    if (dobYear > 1900) {
      //this.model.Age = String(Number(moment().format("YYYY")) - Number(moment(this.model.DateOfBirth).format("YYYY")));
      var yrs = parseInt(String(moment().diff(moment(this.ERPatient.DateOfBirth), 'years')));
      var mnths = parseInt(String(moment().diff(moment(this.ERPatient.DateOfBirth), 'months')));
      var dys = parseInt(String(moment().diff(moment(this.ERPatient.DateOfBirth), 'days')));

      let validYears: boolean = yrs > 0 ? true : false;
      let validMonths: boolean = mnths > 0 ? true : false;
      let validDays: boolean = dys > 0 ? true : false;

      if (validYears) {
        this.ERPatient.AgeUnit = "Y";
        this.ERPatient.Age = String(yrs);
      } else if (validMonths && !validYears) {
        this.ERPatient.AgeUnit = "M";
        this.ERPatient.Age = String(mnths);
      } else if (validDays && !validMonths && !validYears) {
        this.ERPatient.AgeUnit = "D";
        this.ERPatient.Age = String(dys);
      } else {
        this.ERPatient.Age = "0";
      }

    }
  }

  SplitAgeAndUnit(): void {
    if (this.ERPatient.Age) {
      var splitData = [];
      if (this.ERPatient.Age.includes("Y")) {
        splitData = this.ERPatient.Age.split("Y");
        this.ERPatient.Age = splitData[0];
        this.ERPatient.AgeUnit = "Y";
      }
      else if (this.ERPatient.Age.includes("M")) {
        splitData = this.ERPatient.Age.split("M");
        this.ERPatient.Age = splitData[0];
        this.ERPatient.AgeUnit = "M";
      }
      else if (this.ERPatient.Age.includes("D")) {
        splitData = this.ERPatient.Age.split("D");
        this.ERPatient.Age = splitData[0];
        this.ERPatient.AgeUnit = "D";
      }

    }
  }

  SplitAgeAndUnitFromInputPatient(ERPatientToEdit: EmergencyPatientModel): void {
    if (ERPatientToEdit.Age) {
      var splitData = [];
      if (ERPatientToEdit.Age.includes("Y")) {
        splitData = ERPatientToEdit.Age.split("Y");
        ERPatientToEdit.Age = splitData[0];
        ERPatientToEdit.AgeUnit = "Y";
      }
      else if (ERPatientToEdit.Age.includes("M")) {
        splitData = ERPatientToEdit.Age.split("M");
        ERPatientToEdit.Age = splitData[0];
        ERPatientToEdit.AgeUnit = "M";
      }
      else if (ERPatientToEdit.Age.includes("D")) {
        splitData = ERPatientToEdit.Age.split("D");
        ERPatientToEdit.Age = splitData[0];
        ERPatientToEdit.AgeUnit = "D";
      }
    }
  }

  Close(): void {
    this.sendERPatientData.emit({ submit: false });
  }

  EmitMatchingListCloseAction($event): void {
    let action = $event.action;
    let data = $event.data;
    if (action === "add-new") {
      this.showMatchingPatientList = false;
      if (this.update) {
        this.UpdateERPatient();
      } else {
        this.RegisterNewERPatient();
      }
    }
    else if (action === "close") {
      this.showMatchingPatientList = false;
      this.loading = false;
    }
    else if (action === "use-existing") {
      let patId = data;
      this._emergencyBLService.GetPatientById(patId).subscribe(res => {
        if (res.Status === "OK") {
          this.ERPatient = { ...res.Results }
          this.ERPatient.FullName = res.Results.ShortName;
          this.ERPatient.ContactNo = res.Results.PhoneNumber;
          this.ERPatient.IsExistingPatient = true;
          this.SplitAgeAndUnit();
          this.GenerateAge();

          this.update = false;
          this.ERPatient.EnableControl("FirstName", false);
          this.ERPatient.EnableControl("LastName", false);
          this.ERPatient.EnableControl("Gender", false);
          this.selectionFromExistingPatient = true;
          this.showMatchingPatientList = false;
          this.RegisterNewERPatient();
        }
      });
    }
  }


  AssignNestedCases(caseId): void {
    this.nestedCases = [];
    this.ERPatient.MainCase = +caseId;
    this.ERPatient.PatientCases.MainCase = +caseId;
    var data = this.allCasesMaster.filter(a => a.Id === +caseId);
    //below code for Alias name should be shown only for MedicoLegal>OCMC.
    this.ocmcSelected = false;
    this.ERPatient.ERPatientValidator.controls['LastName'].enable();
    this.ERPatient.UpdateValidator("on", "LastName", "required");
    this.ERPatient.PatientCases.SubCase = null;

    if (data[0] && data[0].ChildLookUpDetails && data[0].ChildLookUpDetails.length > 1) {
      data[0].ChildLookUpDetails.forEach(a => {
        this.nestedCases.push(a);
      });
      this.showAnimalBiteDetailEntry = false;
      this.showSnakeBiteDetailEntry = false;
      this.showDogBiteDetailEntry = false;
    } else if (data[0] && data[0].ChildLookUpDetails.length == 0) {
      switch (data[0].Name) {
        case "General": {
          this.showAnimalBiteDetailEntry = false;
          this.showSnakeBiteDetailEntry = false;
          this.showDogBiteDetailEntry = false;
          let phnNum = document.getElementById('erPatPhone');
          if (phnNum) {
            phnNum.focus();
          }
        } break;
        case "Dog Bite": {
          this.showAnimalBiteDetailEntry = false;
          this.showSnakeBiteDetailEntry = false;
          this.showDogBiteDetailEntry = true;
          this._changeDetector.detectChanges();
          let bitingAddress = document.getElementById('bitingAddress');
          if (bitingAddress) {
            bitingAddress.focus();
          }
        } break;
        case "Snake Bite": {
          this.showAnimalBiteDetailEntry = false;
          this.showSnakeBiteDetailEntry = true;
          this.showDogBiteDetailEntry = false;
          this._changeDetector.detectChanges();
          let bitingAddress = document.getElementById('bitingAddress');
          if (bitingAddress) {
            bitingAddress.focus();
          }
        } break;
        case "Animal Bite": {
          this.showAnimalBiteDetailEntry = true;
          this.showSnakeBiteDetailEntry = false;
          this.showDogBiteDetailEntry = false;
          this._changeDetector.detectChanges();
          let bitingAddress = document.getElementById('bitingAddress');
          if (bitingAddress) {
            bitingAddress.focus();
          }
        } break;
        case "Emergency Labor": {
          this.showAnimalBiteDetailEntry = false;
          this.showSnakeBiteDetailEntry = false;
          this.showDogBiteDetailEntry = false;
        } break;
        default:
          break;
      }
    }
  }

  HandleOthersCase(subCaseId): void {
    this.ERPatient.SubCase = +subCaseId;
    this.ERPatient.PatientCases.SubCase = +subCaseId;
    var data = this.nestedCases.filter(a => a.Id === +subCaseId);
    if (data[0] && data[0].Name == 'Others') {
      this.showOthersTextBox = true;
    } else {
      this.showOthersTextBox = false;
      if (data[0].Name === 'OCMC') {
        this.ocmcSelected = true;
        this.ERPatient.ERPatientValidator.controls['LastName'].disable();
        this.ERPatient.UpdateValidator("off", "LastName", "required");
      } else {
        this.ocmcSelected = false;
        this.ERPatient.ERPatientValidator.controls['LastName'].enable();
        this.ERPatient.UpdateValidator("on", "LastName", "required");
      }
    }
  }

  ShowOtherForBittenOn(eventId): void {
    if (+eventId === 5) {
      this.bittenOnPart = true;
    } else {
      this.bittenOnPart = false;
    }
  }

  ShowOtherForFirstAid(eventId): void {
    if (+eventId === 3) {
      this.firstAidOther = true;
    } else {
      this.firstAidOther = false;
    }
  }
  ShowOtherForBitingSnake(eventId): void {
    if (+eventId === 6) {
      this.bitingSnakeOther = true;
    } else {
      this.bitingSnakeOther = false;
    }
  }

  SetFocusById(IdToBeFocused: string): void {
    this._coreService.FocusInputById(IdToBeFocused);
  }

  hotkeys(event): void {
    if (event.keyCode === 27) {
      this.sendERPatientData.emit({ submit: false });
    }

  }

  UpdateMunicipality(event): void {
    if (event && event.data) {
      this.ERPatient.MunicipalityId = event.data.MunicipalityId;
    }
  }

  Triage(): void {
    this.showTriageOption = true;
  }

  OnLastNameChanged($event): void {
    if ($event) {
      const lastName = $event.target.value;
      this.patientLastName = lastName;
    }
  }

  OnEthnicGroupChangeCallBack(ethnicGroup): void {
    if (ethnicGroup) {
      this.ERPatient.EthnicGroup = ethnicGroup.ethnicGroup;
    }
  }
  ShowTriagePopUp(): void {
    this.ShowTriagePopup = true;
  }
  HideTriagePopUp(): void {
    this.ShowTriagePopup = false;
  }
}
