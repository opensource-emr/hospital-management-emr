import { Component, ChangeDetectorRef, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CoreService } from '../../../core/shared/core.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { PatientService } from '../../../patients/shared/patient.service';
import { PatientsBLService } from '../../../patients/shared/patients.bl.service';
import { GovInsurancePatientVM } from '../shared/gov-ins-patient.view-model';
import { DanpheCache, MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';
import { CountrySubdivision } from '../../../settings-new/shared/country-subdivision.model';
import { GovInsuranceBLService } from '../shared/gov-ins.bl.service';
import { UnicodeService } from '../../../common/unicode.service';

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

  public matchedPatientList: any;
  public showExistingPatientListPage: boolean = false;

  @Output("ins-pat-on-close")
  insPatientOnClose: EventEmitter<object> = new EventEmitter<object>();

  @Input("pat-to-edit")
  insPatToEdit: GovInsurancePatientVM;

  @Input("popup-action")
  popupAction: string = "add";//add or edit.. logic will change accordingly.

  public showLocalName:boolean= true;

  constructor(public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public patientBlService: PatientsBLService,
    public coreService: CoreService,
    public patientService: PatientService,
    public govInsBlService: GovInsuranceBLService,
    public unicode: UnicodeService
  ) {

    this.Initialize();
    this.showLocalName=this.coreService.showLocalNameFormControl;
  }

  Initialize() {
    this.GetInsuranceProviderList();
    this.Country_All = DanpheCache.GetData(MasterType.Country, null);
    this.districts_All = DanpheCache.GetData(MasterType.SubDivision, null);


    if (this.coreService.Masters.UniqueDataList && this.coreService.Masters.UniqueDataList.UniqueAddressList) {
      this.olderAddressList = this.coreService.Masters.UniqueDataList.UniqueAddressList;
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
    }
    else {
      let country = this.coreService.GetDefaultCountry();
      let subDivision = this.coreService.GetDefaultCountrySubDivision();

      this.insPatient.CountryId = country ? country.CountryId : null;
      this.selectedDistrict.CountrySubDivisionId =
        this.insPatient.CountrySubDivisionId = subDivision ? subDivision.CountrySubDivisionId : null;
      this.selectedDistrict.CountrySubDivisionName =
        this.insPatient.CountrySubDivisionName = subDivision ? subDivision.CountrySubDivisionName : null;
    }
  }

  AssignSelectedDistrict() {
    if (this.selectedDistrict && this.selectedDistrict.CountrySubDivisionId) {
      this.insPatient.CountrySubDivisionId = this.selectedDistrict.CountrySubDivisionId;
      this.insPatient.CountrySubDivisionName = this.selectedDistrict.CountrySubDivisionName;
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
    this.insPatient.DateOfBirth = this.patientService.CalculateDOB(Number(this.insPatient.Age), this.insPatient.AgeUnit);
  }



  loading: boolean = false;

  RegisterInsurancePatient() {
    if (this.loading) {

      //at beginning, current balance would be initial balance.
      this.insPatient.InitialBalance = this.insPatient.CurrentBalance;
      this.insPatient.InsuranceName = this.insProviderList.find(a => a.InsuranceProviderId == this.insPatient.InsuranceProviderId).InsuranceProviderName;
      //this.insPatient.ModifiedBy = 1;

      //for checking validations, marking all the fields as dirty and checking the validity.
      for (var i in this.insPatient.GovInsPatientValidator.controls) {
        this.insPatient.GovInsPatientValidator.controls[i].markAsDirty();
        this.insPatient.GovInsPatientValidator.controls[i].updateValueAndValidity();
      }
      if (!this.insPatient.Age) {
        this.msgBoxServ.showMessage("error", ["Please fill the Patient' Age"]);
        return;
      }
      if (this.insPatient.IsValid(undefined, undefined)) {

        //removing extra spaces typed by the users
        this.insPatient.FirstName = this.insPatient.FirstName.trim();
        this.insPatient.MiddleName = this.insPatient.MiddleName ? this.insPatient.MiddleName.trim() : "";
        this.insPatient.LastName = this.insPatient.LastName.trim();
        this.insPatient.ShortName = this.insPatient.FirstName + " " + this.insPatient.MiddleName + this.insPatient.LastName;

        //Get existing patient list by FirstName, LastName, Mobile Number
        this.GetExistedMatchingPatientList();
        //this.RegisterNewPatient();
      }
      else {
        this.msgBoxServ.showMessage("failed", ["One or more values are missing. Pls check and try again."]);
        //alert("Patient Information are invalid.");
      }
    }
    this.loading = false;
  }

  GetExistedMatchingPatientList() {
    //if (this.insPatient.Age && this.insPatient.AgeUnit) {
    //  this.insPatient.Age = this.insPatient.Age;
    //}
    //else {
    //  if (this.insPatient.DateOfBirth) {
    //    var age = CommonFunctions.GetFormattedAge(this.insPatient.DateOfBirth);
    //    var splitted = age.split(" ", 2);
    //    this.insPatient.AgeUnit = splitted[1];
    //    this.insPatient.Age = splitted[0];
    //  }
    //}

    this.patientBlService.GetExistedMatchingPatientList(this.insPatient.FirstName, this.insPatient.LastName,
      this.insPatient.PhoneNumber, true, this.insPatient.IMISCode)
      .subscribe(
        res => {
          if (res.Status == "OK" && res.Results.length > 0) {
            this.loading = false;
            this.matchedPatientList = res.Results;
            this.showExistingPatientListPage = true;
          }
          else {
            this.RegisterNewPatient();
          }

        },
        err => {
          this.loading = false;
          this.msgBoxServ.showMessage("Please, Try again . Error in Getting Existed Match patient list", [err.ErrorMessage]);
        });
  }

  RegisterNewPatient() {
    this.ConcatinateAgeAndUnit();//to get: 20Y, 45Y, etc from 20 and Years (of UI)
    this.govInsBlService.PostGovInsPatient(this.insPatient)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          console.log(res.Results);
          this.insPatientOnClose.emit({ action: "new-pat-added", data: res.Results });
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to Post."]);
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
    let seperatedAgeUnit = this.patientService.SeperateAgeAndUnit(this.insPatient.Age);
    if (seperatedAgeUnit) {
      this.insPatient.Age = seperatedAgeUnit.Age;
      this.insPatient.AgeUnit = seperatedAgeUnit.Unit;
    }
  }


  public Close() {
    this.insPatientOnClose.emit({ action: "close", data: null });
  }



  //Insurance Block------
  public insProviderList: Array<any> = [];

  public GetInsuranceProviderList() {
    this.patientBlService.GetInsuranceProviderList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.insProviderList = res.Results;
            this.insPatient.InsuranceProviderId = this.insProviderList[0].InsuranceProviderId;
          }
          else {
            this.msgBoxServ.showMessage('Failed', ["unable to get items for searchbox.. check logs for more details."]);
            console.log(res.ErrorMessage);
          }
        }
      });
  }


  UpdateInsurancePatient() {
    //console.log(this.insPatient);
    //console.log(this.insPatToEdit);

    this.insPatient.InsuranceName = this.insProviderList.find(a => a.InsuranceProviderId == this.insPatient.InsuranceProviderId).InsuranceProviderName;
    //this.insPatient.ModifiedBy = 1;

    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.insPatient.GovInsPatientValidator.controls) {
      this.insPatient.GovInsPatientValidator.controls[i].markAsDirty();
      this.insPatient.GovInsPatientValidator.controls[i].updateValueAndValidity();
    }
    if (!this.insPatient.Age) {
      this.msgBoxServ.showMessage("error", ["Please fill the Patient' Age"]);
      return;
    }
    if (this.insPatient.IsValid(undefined, undefined)) {

      this.ConcatinateAgeAndUnit();//to get: 20Y, 45Y, etc from 20 and Years (of UI)

      this.govInsBlService.UpdateGovInsPatient(this.insPatient)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.msgBoxServ.showMessage("success", ["Patient Information Updated successfully."]);
            //console.log(res.Results);
            this.insPatientOnClose.emit({ action: "patient-updated", data: res.Results });
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Failed to Update Patient."]);
          }
        });
    }
    else {
      this.msgBoxServ.showMessage("failed", ["One or more values are missing. Pls check and try again."]);
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
    }
    this.showExistingPatientListPage = false;
    this.loading = false;
  }

  UseExistingPatientDetails(PatientId) {
    this.popupAction = "edit";
    let matchingINSPatient = this.matchedPatientList.find(a => a.PatientId == PatientId);

    this.insPatient.IMISCode = matchingINSPatient.IMISCode;
    let seperatedAgeUnit = this.patientService.SeperateAgeAndUnit(this.insPatient.Age);
    if (seperatedAgeUnit) {
      this.insPatient.Age = seperatedAgeUnit.Age;
      this.insPatient.AgeUnit = seperatedAgeUnit.Unit;
    }

    this.showExistingPatientListPage = false;

  }
}
