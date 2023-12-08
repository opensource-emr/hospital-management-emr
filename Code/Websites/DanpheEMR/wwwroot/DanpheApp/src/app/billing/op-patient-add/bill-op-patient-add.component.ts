import { Component, EventEmitter, Output } from '@angular/core';
import { UnicodeService } from '../../common/unicode.service';
import { CoreService } from '../../core/shared/core.service';
import { PatientService } from '../../patients/shared/patient.service';
import { CountrySubdivision } from '../../settings-new/shared/country-subdivision.model';
import { GeneralFieldLabels } from '../../shared/DTOs/general-field-label.dto';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { DanpheCache, MasterType } from '../../shared/danphe-cache-service-utility/cache-services';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../shared/shared-enums';
import { BillingBLService } from '../shared/billing.bl.service';
import { BillingOpPatientVM } from './bill-op-patientVM';

@Component({
  selector: 'bill-op-patient-add',
  templateUrl: './bill-op-patient-add.html',
  styles: [`padding-7-tp{padding-top: 7px;}`],
  host: { '(window:keydown)': 'hotkeys($event)' }
})

// App Component class
export class BillOutpatientAddComponent {
  public NewPatient = new BillingOpPatientVM();
  public Country_All: any = null;
  public Districts_All: Array<CountrySubdivision> = [];
  public Districts_Filtered: Array<CountrySubdivision> = [];
  public SelectedDistrict: CountrySubdivision = new CountrySubdivision();
  public OlderAddressList: Array<any> = [];
  public loading: boolean = false;
  public GoToBilling: boolean = false;
  public IsPhoneMandatory: boolean = true;
  public ShowMunicipality: boolean = false;
  public PatientLastName: string = ""
  @Output() public CallBackAddClose: EventEmitter<Object> = new EventEmitter<Object>();
  public ShowLocalName: boolean = true;
  public MatchedPatientList: any;
  public ShowExistingPatientListPage: boolean = false;

  //public Muncipalitylable: string = "";
  public showNam_Thar: boolean = true;
  public GeneralFieldLabel = new GeneralFieldLabels();

  constructor(
    private _messageBoxService: MessageboxService,
    public coreService: CoreService,
    private _patientService: PatientService,
    private _billingBLService: BillingBLService,
    private _unicodeService: UnicodeService
  ) {
    this.GeneralFieldLabel = coreService.GetFieldLabelParameter();
    this.showNam_Thar = this.GeneralFieldLabel.showNam_Thar;
    /*var Muncipalitylable = JSON.parse(coreService.Parameters.find(p => p.ParameterGroupName == "Patient" && p.ParameterName == "Municipality").ParameterValue);
    if (Muncipalitylable) {
      this.Muncipalitylable = Muncipalitylable.Municipality;
    }
     */
    this.Initialize();
    this.IsPhoneMandatory = this.coreService.GetIsPhoneNumberMandatory();
    this.ShowMunicipality = this.coreService.ShowMunicipality().ShowMunicipality;
    this.ShowLocalName = this.coreService.showLocalNameFormControl;
  }

  ngOnInit() {
    let country = this.coreService.GetDefaultCountry();
    let subDivision = this.coreService.GetDefaultCountrySubDivision();
    this.NewPatient.CountryId = country ? country.CountryId : null;
    this.SelectedDistrict.CountrySubDivisionId = this.NewPatient.CountrySubDivisionId = subDivision ? subDivision.CountrySubDivisionId : null;
    this.SelectedDistrict.CountrySubDivisionName = this.NewPatient.CountrySubDivisionName = subDivision ? subDivision.CountrySubDivisionName : null;
    this.setFocusById("newPatFirstName");
    this.PhoneNumberMandatory();
  }

  Initialize(): void {
    this.Country_All = DanpheCache.GetData(MasterType.Country, null);
    this.Districts_All = DanpheCache.GetData(MasterType.SubDivision, null);
    if (this.coreService.Masters.UniqueDataList && this.coreService.Masters.UniqueDataList.UniqueAddressList) {
      this.OlderAddressList = this.coreService.Masters.UniqueDataList.UniqueAddressList;
    }
  }

  DistrictListFormatter(data: any): string {
    let html = data["CountrySubDivisionName"];
    return html;
  }

  AssignSelectedDistrict(): void {
    if (this.SelectedDistrict && this.SelectedDistrict.CountrySubDivisionId) {
      this.NewPatient.CountrySubDivisionId = this.SelectedDistrict.CountrySubDivisionId;
      this.NewPatient.CountrySubDivisionName = this.SelectedDistrict.CountrySubDivisionName;
    }
  }

  CountryDDL_OnChange(): void {
    this.Districts_Filtered = this.Districts_All.filter(c => c.CountryId === +this.NewPatient.CountryId);
  }

  CalculateDob(): void {
    this.NewPatient.DateOfBirth = this._patientService.CalculateDOB(Number(this.NewPatient.Age), this.NewPatient.AgeUnit);
  }

  CheckValiadtionAndRegisterNewPatient(goToBilling: boolean): void {
    this.GoToBilling = goToBilling;
    if (this.loading) {
      this.NewPatient.CountrySubDivisionId = this.SelectedDistrict ? this.SelectedDistrict.CountrySubDivisionId : null;
      for (let i in this.NewPatient.OutPatientValidator.controls) {
        this.NewPatient.OutPatientValidator.controls[i].markAsDirty();
        this.NewPatient.OutPatientValidator.controls[i].updateValueAndValidity();
      }
      if (this.NewPatient.IsValid(undefined, undefined) && (this.NewPatient.CountrySubDivisionId !== null || this.NewPatient.CountrySubDivisionId !== undefined) && this.NewPatient.EthnicGroup) {
        //check if middlename exists or not to append to Shortname
        let midName = this.NewPatient.MiddleName;
        if (midName) {
          midName = this.NewPatient.MiddleName.trim() + " ";
        } else {
          midName = "";
        }
        //removing extra spaces typed by the users
        this.NewPatient.FirstName = this.NewPatient.FirstName.trim();
        this.NewPatient.MiddleName = this.NewPatient.MiddleName ? this.NewPatient.MiddleName.trim() : null;
        this.NewPatient.LastName = this.NewPatient.LastName.trim();
        this.NewPatient.ShortName = this.NewPatient.FirstName + " " + midName + this.NewPatient.LastName;
        this.CheckExistingPatientsAndSubmit();
      }
      else {
        this._messageBoxService.showMessage('failed', ["Some of the inputs are invalid. Please check and try again. !"]);
        this.loading = false;//re-enable the buttons after showing the error message.
      }
    }
  }

  CheckExistingPatientsAndSubmit(): void {
    if (!this.NewPatient.PatientId) {
      let age = this.NewPatient.Age + this.NewPatient.AgeUnit;
      this._billingBLService.GetExistedMatchingPatientList(this.NewPatient.FirstName, this.NewPatient.LastName, this.NewPatient.PhoneNumber, age, this.NewPatient.Gender)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.length) {
            this.MatchedPatientList = res.Results;
            this.ShowExistingPatientListPage = true;
            this.loading = false;
          }
          else {
            this.RegisterNewPatient();
          }
        }, (err) => {
          this.loading = false;
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to add new Patient. Please try later !"]);
        });
    }
    else {
      this.RegisterNewPatient();
    }
  }

  RegisterNewPatient(): void {
    this.ConcatenateAgeAndUnit();
    this._billingBLService.AddNewOutpatienPatient(this.NewPatient)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.loading = false;
          if (this.GoToBilling) {
            this.CallBackAddClose.emit({ action: "register-and-billing", data: res.Results, close: true });
          }
          else {
            this.CallBackAddClose.emit({ action: "register-only", data: res.Results, close: true });
          }
        }
        else {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to add new Patient. Please try later !"]);
          this.loading = false;
        }
      }, (err) => {
        this.loading = false;
        this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to add new Patient. Please try later !"]);
      });
  }

  //we're storing Age and Age unit in a single column.
  ConcatenateAgeAndUnit(): void {
    if (this.NewPatient.Age && this.NewPatient.AgeUnit) {
      this.NewPatient.Age = this.NewPatient.Age + this.NewPatient.AgeUnit;
    }
  }

  CloseAddNewPatPopUp(): void {
    this.CallBackAddClose.emit({ close: true });
  }

  Translate(language): void {
    this._unicodeService.translate(language);
    if (language === "english") {
      let localName = <HTMLInputElement>document.getElementById("patNameLocal");
      let ipLocalName = localName.value;
      this.NewPatient.PatientNameLocal = ipLocalName.length > 0 ? ipLocalName : "";
    }
  }
  //if the user selects any patient from the matched list of patient. assign it to current patient instead of creating a new patient.
  AssignMatchedPatientAndProceed(PatientId): void {
    let existingPatient = this.MatchedPatientList.find(a => a.PatientId === +PatientId);
    existingPatient.CountrySubDivisionName = this.Districts_All.find(a => a.CountrySubDivisionId === +existingPatient.CountrySubDivisionId).CountrySubDivisionName;
    this.CallBackAddClose.emit({ action: "register-and-billing", data: existingPatient, close: true });
    //this.billingBLService.GetPatientById(PatientId)
    //  .subscribe(res => {
    //    if (res.Status == 'OK') {
    //      //patient Service has Common SetPatient method For Setting Pattient Deatils
    //      //this common method is for Code reusability
    //      this.loading = false;
    //      this.patientService.setGlobal(res.Results),

    //        //this showExstingPatientList is false because popup window should be closed after navigate to /Patient/RegisterPatient/BasicInfo in set patient method of Patient service
    //        this.showExstingPatientListPage = false;

    //      //go to route if all the value are mapped with the patient service
    //      this.router.navigate(['/Patient/RegisterPatient/BasicInfo']);
    //    }
    //    else {
    //      // alert(res.ErrorMessage);
    //      this.msgBoxServ.showMessage("error", [res.ErrorMessage]);

    //    }
    //  },


    //    err => {
    //      this.msgBoxServ.showMessage("error", ["failed to get selected patient"]);
    //      //alert('failed to get selected patient');

    //    });

  }

  EmitCloseAction($event): void {
    let action = $event.action;
    let data = $event.data;
    if (action === "use-existing") {
      let patientId = data;
      this.AssignMatchedPatientAndProceed(patientId); //Match Existing Patient and process
    }
    else if (action === "add-new") {
      this.RegisterNewPatient();
    }
    else if (action === "close") {
      this.ShowExistingPatientListPage = false;
    }
    this.loading = false;
  }

  //common function to set focus on  given Element.
  setFocusById(targetId: string, waitingTimeinMS: number = 10): void {
    this.coreService.FocusInputById(targetId);
  }

  PhoneNumberMandatory(): void {
    if (!this.IsPhoneMandatory) {
      this.NewPatient.UpdateValidator("off", "PhoneNumber");
    }
  }

  hotkeys(event): void {
    if (event.keyCode === 27) {
      this.CallBackAddClose.emit({ close: true });
    }
  }

  UpdateMunicipality(event): void {
    if (event) {
      this.NewPatient.MunicipalityId = event.data ? event.data.MunicipalityId : null;
    }
  }

  OnLastNameChanged($event): void {
    if ($event) {
      const lastName = $event.target.value;
      this.PatientLastName = lastName;
    }
  }

  OnEthnicGroupChangeCallBack(ethnicGroup): void {
    if (ethnicGroup) {
      this.NewPatient.EthnicGroup = ethnicGroup.ethnicGroup;
    }
  }
}
