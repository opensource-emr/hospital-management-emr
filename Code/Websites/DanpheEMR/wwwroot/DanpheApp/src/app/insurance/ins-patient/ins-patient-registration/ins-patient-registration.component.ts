import { Component, ChangeDetectorRef, EventEmitter, Output, OnInit, Input, Renderer2 } from '@angular/core';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CoreService } from '../../../core/shared/core.service';
import { GovInsurancePatientVM } from '../../shared/gov-ins-patient.view-model';
import { DanpheCache, MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';
import { CountrySubdivision } from '../../../settings-new/shared/country-subdivision.model';
import { InsuranceBlService } from '../../shared/insurance.bl.service';
import { UnicodeService } from '../../../common/unicode.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { InsuranceService } from '../../shared/ins-service';
import { INSGridColumnSettings } from '../../shared/insurance-grid-columns';
import { PatientsBLService } from '../../../patients/shared/patients.bl.service';

@Component({
  selector: 'ins-patient-registration',
  templateUrl: './ins-patient-registration.html'
})

// App Component class
export class INSPatientRegistrationComponent {

  public Country_All: any = null;
  public districts_All: Array<CountrySubdivision> = [];
  public districts_Filtered: Array<CountrySubdivision> = [];
  public selectedDistrict: CountrySubdivision = new CountrySubdivision();
  public olderAddressList: Array<any> = [];//for Autocomplete of Address Field.

  public insPatient: GovInsurancePatientVM = new GovInsurancePatientVM();
  public disableButton = false; //to avoid double click

  public matchedPatientList: any = [];
  public showExistingPatientListPage: boolean = false;
  public maxInsuranceAmtLimit: number = 0;

  @Output("ins-pat-on-close")
  insPatientOnClose: EventEmitter<object> = new EventEmitter<object>();

  @Input("pat-to-edit")
  insPatToEdit: GovInsurancePatientVM;

  @Input("popup-action")
  popupAction: string = "add";//add or edit.. logic will change accordingly.

  public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.

  public isPhoneMandatory: boolean = true;
  public showMunicipality: boolean = false;
  public showLocalName: boolean = true;

  constructor(public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public insuranceService: InsuranceService,
    public patientBlService: PatientsBLService,
    public govInsBlService: InsuranceBlService,
    public unicode: UnicodeService,
    public renderer: Renderer2,
  ) {
    this.Initialize();
    this.isPhoneMandatory = this.coreService.GetIsPhoneNumberMandatory();
    this.showMunicipality = this.coreService.ShowMunicipality().ShowMunicipality;
    this.showLocalName = this.coreService.showLocalNameFormControl;
  }

  Initialize() {
    this.GetInsuranceProviderList();
    this.Country_All = DanpheCache.GetData(MasterType.Country, null);
    this.districts_All = DanpheCache.GetData(MasterType.SubDivision, null);

    if (this.coreService.Masters.UniqueDataList && this.coreService.Masters.UniqueDataList.UniqueAddressList) {
      this.olderAddressList = this.coreService.Masters.UniqueDataList.UniqueAddressList;
    }
    let param = this.coreService.Parameters.find(x => x.ParameterGroupName == "Insurance" && x.ParameterName == "MaxInsuranceAmtLimit");
    if (param && parseInt(param.ParameterValue)) {
      this.maxInsuranceAmtLimit = (parseInt(param.ParameterValue) > 0) ? parseInt(param.ParameterValue) : 0;
    }
  }


  ngOnInit() {
    if (this.insPatToEdit && this.insPatToEdit.PatientId) {
      //below will assign all properties of input patient to current patient in scope.
      this.insPatient = Object.assign(new GovInsurancePatientVM(), this.insPatToEdit);
      this.SeperateAgeAndUnit();
      //below two properties needed to be assigned back to autocomplete.
      this.selectedDistrict.CountrySubDivisionId = this.insPatient.CountrySubDivisionId;
      this.selectedDistrict.CountrySubDivisionName = this.insPatient.CountrySubDivisionName;
      this.setFocusById("Ins_NshiNumber");
    }
    else {
      //let country = this.coreService.GetDefaultCountry();
      //let subDivision = this.coreService.GetDefaultCountrySubDivision();
      //this.insPatient.CountryId = country ? country.CountryId : null;
      //this.selectedDistrict.CountrySubDivisionId =
      //  this.insPatient.CountrySubDivisionId = subDivision ? subDivision.CountrySubDivisionId : null;
      //this.selectedDistrict.CountrySubDivisionName =
      //  this.insPatient.CountrySubDivisionName = subDivision ? subDivision.CountrySubDivisionName : null;
      this.insPatient = new GovInsurancePatientVM()
      let country = this.coreService.GetDefaultCountry();
      let subDivision = this.coreService.GetDefaultCountrySubDivision();
      this.insPatient.CountryId = country ? country.CountryId : null;
      this.insPatient.CountrySubDivisionId = subDivision ? subDivision.CountrySubDivisionId : null;
      this.selectedDistrict.CountrySubDivisionId = this.insPatient.CountrySubDivisionId = subDivision ? subDivision.CountrySubDivisionId : null;
      this.selectedDistrict.CountrySubDivisionName = this.insPatient.CountrySubDivisionName = subDivision ? subDivision.CountrySubDivisionName : null;
      this.setFocusById("aptPatFirstName");
    }
    this.phoneNumberMandatory();

    this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
      if (e.keyCode == this.ESCAPE_KEYCODE) {
        //this.onClose.emit({ CloseWindow: true, EventName: "close" });
        this.Close();
      }
    });
  }
  globalListenFunc: Function;
  ngOnDestroy() {
    // remove listener
    this.globalListenFunc();
  }


  public showAddPatient: boolean = false;
  AddPatient() {
    this.showAddPatient = true;
  }

  public isFamilyHead: string = null;
  SelectIsFamilyHead() {
    //var isFamHead = JSON.parse(this.isFamilyHead);
    if (this.insPatient.Ins_IsFamilyHead.toString() == "true") {
      this.insPatient.Ins_IsFamilyHead = true;
      this.insPatient.Ins_FamilyHeadNshi = this.insPatient.Ins_NshiNumber;
      this.insPatient.Ins_FamilyHeadName = this.insPatient.FirstName + ' ' + ((this.insPatient.MiddleName == null) ? "" : this.insPatient.MiddleName + ' ') + this.insPatient.LastName;
      if (this.popupAction == 'add')
        this.setFocusById('register');
      else {
        this.setFocusById('update');
      }
    }
    else {
      this.insPatient.Ins_IsFamilyHead = false;
      this.insPatient.Ins_FamilyHeadNshi = '';
      this.insPatient.Ins_FamilyHeadName = '';
      this.setFocusById('Ins_FamilyHeadNshi')
    }

  }
  InsFamilyHeadNameEnterKey() {
    if (this.popupAction == 'add')
      this.setFocusById('register');
    else {
      this.setFocusById('update');
    }
  }

  AssignSelectedDistrict() {
    if (this.selectedDistrict && this.selectedDistrict.CountrySubDivisionId) {
      this.insPatient.CountrySubDivisionId = this.selectedDistrict.CountrySubDivisionId;
      this.insPatient.CountrySubDivisionName = this.selectedDistrict.CountrySubDivisionName;
    } else {
      // when user types random characters we assign null values to these fields so that we can validate..
      this.insPatient.CountrySubDivisionId = null;
      this.insPatient.CountrySubDivisionName = null;
    }
  }

  districtListFormatter(data: any): string {
    let html = data["CountrySubDivisionName"];
    return html;
  }

  //we've to reload districts on change of country.
  CountryDDL_OnChange() {
    this.districts_Filtered = this.districts_All.filter(c => c.CountryId == this.insPatient.CountryId);
    //this.selectedDistrict = null;
  }

  CalculateDob() {
    this.insPatient.DateOfBirth = this.insuranceService.CalculateDOB(Number(this.insPatient.Age), this.insPatient.AgeUnit);
  }

  validCheck: boolean = false;

  RegisterInsurancePatient() {

    this.disableButton = true;
    this.validCheck = true;

    //at beginning, current balance would be initial balance.
    this.insPatient.InitialBalance = this.insPatient.Ins_InsuranceBalance;
    this.insPatient.Ins_InsuranceBalance = this.insPatient.Ins_InsuranceBalance;
    this.insPatient.Ins_HasInsurance = true;
    this.insPatient.InsuranceName = this.insProviderList.find(a => a.InsuranceProviderId == this.insPatient.InsuranceProviderId).InsuranceProviderName;

    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.insPatient.GovInsPatientValidator.controls) {
      this.insPatient.GovInsPatientValidator.controls[i].markAsDirty();
      this.insPatient.GovInsPatientValidator.controls[i].updateValueAndValidity();
    }
    if (!this.insPatient.CountrySubDivisionId) {
      this.msgBoxServ.showMessage("error", ["Please select valid district"]);
      this.validCheck = false;
      this.disableButton = false;
      return;
    }
    if (!this.insPatient.Age) {
      this.msgBoxServ.showMessage("error", ["Please fill the Patient Age"]);
      this.validCheck = false;
      this.disableButton = false;
      return;
    }
    if (this.insPatient.AgeUnit == null) {
      this.msgBoxServ.showMessage("error", ["Please select, Patient Age Unit"]);
      this.validCheck = false;
      this.disableButton = false;
      return;
    }

    //this is remporary solution later we need to fix it
    if (this.insPatient.Age) {
      let flagCheckAge = true;
      if (this.insPatient.AgeUnit == "Y") {
        flagCheckAge = (parseInt(this.insPatient.Age) > 0 && parseInt(this.insPatient.Age) < 120) ? true : false;
      }
      else if (this.insPatient.AgeUnit == "M") {
        flagCheckAge = (parseInt(this.insPatient.Age) > 0 && parseInt(this.insPatient.Age) < 1, 440) ? true : false;
      } else if (this.insPatient.AgeUnit == "D") {
        flagCheckAge = (parseInt(this.insPatient.Age) > 0 && parseInt(this.insPatient.Age) < 43, 200) ? true : false;
      }
      if (!flagCheckAge) {
        this.validCheck = false;
        this.msgBoxServ.showMessage("error", ["Please fill the correct age"]);
        this.disableButton = false;
        return;
      }
    }
    if (this.insPatient.IsValid(undefined, undefined)) {

      //removing extra spaces typed by the users
      this.insPatient.FirstName = this.insPatient.FirstName.trim();
      this.insPatient.MiddleName = this.insPatient.MiddleName ? this.insPatient.MiddleName.trim() : '';
      this.insPatient.LastName = this.insPatient.LastName.trim();
      this.insPatient.ShortName = this.insPatient.FirstName + " " + this.insPatient.MiddleName + " " + this.insPatient.LastName;

      //Get existing patient list by FirstName, LastName, Mobile Number
      this.GetExistedMatchingPatientList();
      //this.RegisterNewPatient();
    }
    else {
      this.msgBoxServ.showMessage("failed", ["One or more values are missing. Pls check and try again."]);
      //alert("Patient Information are invalid.");
      this.validCheck = false;
      this.disableButton = false;
    }
    //}

    // this.disableButton = false;
  }

  GetExistedMatchingPatientList() {
    this.govInsBlService.GetExistedMatchingPatientList(this.insPatient.FirstName, this.insPatient.LastName,
      this.insPatient.PhoneNumber, true, this.insPatient.Gender)
      .subscribe(
        res => {
          if (res.Status == "OK" && res.Results.length > 0) {
            this.validCheck = false;
            this.matchedPatientList = res.Results;
            this.showExistingPatientListPage = true;
            this.msgBoxServ.showMessage("Duplicate Patient(s) Found", ["Please enter correct details"]);
            this.disableButton = false;
            return;
          }
          else {
            this.GetPatientsListByNshiNumber(this.insPatient.Ins_NshiNumber);
          }
        },
        err => {
          this.validCheck = false;
          this.disableButton = false;
          this.msgBoxServ.showMessage("Please, Try again . Error in Getting Existed Match patient list", [err.ErrorMessage]);
        });
  }

  GetPatientsListByNshiNumber(Ins_NshiNumber: string) {
    this.govInsBlService.GetPatientsListByNshiNumber(Ins_NshiNumber)
      .subscribe(res => {
        if (res.Results.length > 0) {
          this.validCheck = false;
          this.matchedPatientList = res.Results;
          this.showExistingPatientListPage = true;
          this.msgBoxServ.showMessage("Duplicate Patient(s) Found", ["Patient(s) with same NSHI number,not allowed"]);
          this.disableButton = false;
          return;
        }
        else {
          this.RegisterNewPatient();
        }
      },
        err => {
          this.validCheck = false;
          this.disableButton = false;
          this.msgBoxServ.showMessage("Please, Try again . Error in Getting Existed Match patient list", [err.ErrorMessage]);
        });
  }

  RegisterNewPatient() {
    this.disableButton = true;
    if (this.validCheck)
      this.ConcatinateAgeAndUnit();//to get: 20Y, 45Y, etc from 20 and Years (of UI)
    this.govInsBlService.PostGovInsPatient(this.insPatient)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          console.log(res.Results);
          this.insPatientOnClose.emit({ action: "new-pat-added", data: res.Results });
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to Post."]);
          this.disableButton = false;
        }
      });

  }

  //we're storing Age and Age unit in a single column.
  ConcatinateAgeAndUnit() {
    if (this.insPatient.Age && this.insPatient.AgeUnit)
      this.insPatient.Age = this.insPatient.Age + this.insPatient.AgeUnit;
  }

  //needed at the time of Edit.
  SeperateAgeAndUnit() {
    let seperatedAgeUnit = this.insuranceService.SeperateAgeAndUnit(this.insPatient.Age);
    if (seperatedAgeUnit) {
      this.insPatient.Age = seperatedAgeUnit.Age;
      this.insPatient.AgeUnit = seperatedAgeUnit.Unit;
    }
  }


  public Close() {
    this.insPatientOnClose.emit({ action: "close", data: null });
    this.showAddPatient = false;
    this.validCheck = false;
    this.disableButton = false;
    this.insPatient = new GovInsurancePatientVM();
    this.popupAction = null;
  }



  //Insurance Block------
  public insProviderList: Array<any> = [];

  public GetInsuranceProviderList() {
    this.govInsBlService.GetInsuranceProviderList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.insProviderList = res.Results;
            this.insPatient.InsuranceProviderId = this.insProviderList[0].InsuranceProviderId;
            this.insPatient.Ins_InsuranceProviderId = this.insProviderList[0].InsuranceProviderId;
          }
          else {
            this.msgBoxServ.showMessage('Failed', ["unable to get items for searchbox.. check logs for more details."]);
            console.log(res.ErrorMessage);
          }
        }
      });
  }


  UpdateInsurancePatient() {
    this.disableButton = true;
    this.insPatient.Ins_InsuranceBalance = this.insPatient.Ins_InsuranceBalance;
    this.insPatient.Ins_HasInsurance = true;
    this.insPatient.Ins_InsuranceProviderId = this.insPatient.InsuranceProviderId;
    this.insPatient.InsuranceName = this.insProviderList.find(a => a.InsuranceProviderId == this.insPatient.InsuranceProviderId).InsuranceProviderName;

    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.insPatient.GovInsPatientValidator.controls) {
      this.insPatient.GovInsPatientValidator.controls[i].markAsDirty();
      this.insPatient.GovInsPatientValidator.controls[i].updateValueAndValidity();
    }
    if (!this.insPatient.Age) {
      this.msgBoxServ.showMessage("error", ["Please fill the Patient' Age"]);
      this.disableButton = false;
      return;
    }
    if (this.insPatient.IsValid(undefined, undefined)) {

      this.ConcatinateAgeAndUnit();//to get: 20Y, 45Y, etc from 20 and Years (of UI)

      this.govInsBlService.UpdateGovInsPatient(this.insPatient)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.msgBoxServ.showMessage("success", ["Patient Information Updated successfully."]);

            this.insPatientOnClose.emit({ action: "patient-updated", data: res.Results });
          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            this.disableButton = false;
          }
        });
    }
    else {
      this.msgBoxServ.showMessage("failed", ["One or more values are missing. Pls check and try again."]);
      this.disableButton = false;
    }
  }

  translate(language) {
    this.unicode.translate(language);
    if (language == "english") {
      var localName = <HTMLInputElement>document.getElementById("patNameLocal");
      let ipLocalName = localName.value;
      this.insPatient.PatientNameLocal = ipLocalName.length > 0 ? ipLocalName : "";
    }
  }

  DuplicateWarningBoxOnClose($event) {
    var action = $event.action;
    var data = $event.data;

    if (action == "use-existing") {
      let patientId = data;
      this.UseExistingPatientDetails(patientId); //Match Existing Patient and process
    }
    else if (action == "add-new") {
      this.RegisterNewPatient();
    }
    else if (action == "close") {
      this.showExistingPatientListPage = false;
      this.matchedPatientList = [];
    }
    this.showExistingPatientListPage = false;
    this.validCheck = false;
    this.disableButton = false;
  }

  UseExistingPatientDetails(PatientId) {
    this.popupAction = "edit";
    let matchingINSPatient = this.matchedPatientList.find(a => a.PatientId == PatientId);

    this.insPatient.Ins_NshiNumber = matchingINSPatient.Ins_NshiNumber;
    let seperatedAgeUnit = this.insuranceService.SeperateAgeAndUnit(this.insPatient.Age);
    if (seperatedAgeUnit) {
      this.insPatient.Age = seperatedAgeUnit.Age;
      this.insPatient.AgeUnit = seperatedAgeUnit.Unit;
    }

    this.showExistingPatientListPage = false;

  }

  //common function to set focus on  given Element. 
  setFocusById(targetId: string, waitingTimeinMS: number = 10) {
    this.coreService.FocusInputById(targetId);
  }

  public phoneNumberMandatory() {
    if (!this.isPhoneMandatory) {
      this.insPatient.UpdateValidator("off", "PhoneNumber");
    }
  }

  public updateMunicipality(event) {
    if (event) {
      this.insPatient.MunicipalityId = event.data;
    }
  }
}
