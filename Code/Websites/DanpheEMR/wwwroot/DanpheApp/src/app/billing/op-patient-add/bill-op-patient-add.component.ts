import { Component, ChangeDetectorRef, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from '../../core/shared/core.service';
import { CommonFunctions } from '../../shared/common.functions';
import { DanpheHTTPResponse } from '../../shared/common-models';
import * as moment from 'moment/moment';
import { BillingBLService } from '../shared/billing.bl.service';
import { PatientService } from '../../patients/shared/patient.service';
import { PatientsBLService } from '../../patients/shared/patients.bl.service';
import { CountrySubdivision } from '../../settings-new/shared/country-subdivision.model';
import { BillingOpPatientVM } from './bill-op-patientVM';
import { DanpheCache, MasterType } from '../../shared/danphe-cache-service-utility/cache-services';
import { UnicodeService } from '../../common/unicode.service';
import { Router } from '@angular/router';
import { Municipality } from '../../shared/address-controls/municipality-model';

@Component({
  selector: 'bill-op-patient-add',
  templateUrl: './bill-op-patient-add.html',
  styles: [`padding-7-tp{padding-top: 7px;}`],
  host: { '(window:keydown)': 'hotkeys($event)' }
})

// App Component class
export class BillOutpatientAddComponent {

  public newPatient: BillingOpPatientVM = new BillingOpPatientVM();

  public Country_All: any = null;
  public districts_All: Array<CountrySubdivision> = [];
  public districts_Filtered: Array<CountrySubdivision> = [];
  public selectedDistrict: CountrySubdivision = new CountrySubdivision();
  public olderAddressList: Array<any> = [];

  public loading: boolean = false;
  public GoToBilling: boolean = false;
  public isPhoneMandatory: boolean = true;

  public showMunicipality: boolean = false;

  @Output() public callBackAddClose: EventEmitter<Object> = new EventEmitter<Object>();

  public showLocalName: boolean = true;

  constructor(public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public patientBlService: PatientsBLService,
    public coreService: CoreService,
    public patientService: PatientService,
    public billingBLService: BillingBLService,
    public unicode: UnicodeService,
    public router: Router,
  ) {

    this.Initialize();
    this.isPhoneMandatory = this.coreService.GetIsPhoneNumberMandatory();
    this.showMunicipality = this.coreService.ShowMunicipality().ShowMunicipality;
    this.showLocalName = this.coreService.showLocalNameFormControl;
  }

  ngOnInit() {
    let country = this.coreService.GetDefaultCountry();
    let subDivision = this.coreService.GetDefaultCountrySubDivision();
    this.newPatient.CountryId = country ? country.CountryId : null;
    this.selectedDistrict.CountrySubDivisionId = this.newPatient.CountrySubDivisionId = subDivision ? subDivision.CountrySubDivisionId : null;
    this.selectedDistrict.CountrySubDivisionName = this.newPatient.CountrySubDivisionName = subDivision ? subDivision.CountrySubDivisionName : null;
    this.setFocusById("newPatFirstName");
    this.phoneNumberMandatory();
  }


  public Initialize() {
    this.Country_All = DanpheCache.GetData(MasterType.Country, null);
    this.districts_All = DanpheCache.GetData(MasterType.SubDivision, null);


    if (this.coreService.Masters.UniqueDataList && this.coreService.Masters.UniqueDataList.UniqueAddressList) {
      this.olderAddressList = this.coreService.Masters.UniqueDataList.UniqueAddressList;
    }

  }

  public districtListFormatter(data: any): string {
    let html = data["CountrySubDivisionName"];
    return html;
  }

  public AssignSelectedDistrict() {
    if (this.selectedDistrict && this.selectedDistrict.CountrySubDivisionId) {
      this.newPatient.CountrySubDivisionId = this.selectedDistrict.CountrySubDivisionId;
      this.newPatient.CountrySubDivisionName = this.selectedDistrict.CountrySubDivisionName;
    }
  }

  public CountryDDL_OnChange() {
    this.districts_Filtered = this.districts_All.filter(c => c.CountryId == this.newPatient.CountryId);
  }

  public CalculateDob() {
    this.newPatient.DateOfBirth = this.patientService.CalculateDOB(Number(this.newPatient.Age), this.newPatient.AgeUnit);
  }



  CheckValiadtionAndRegisterNewPatient(goToBilling: boolean) {
    this.GoToBilling = goToBilling;
    if (this.loading) {
      this.newPatient.CountrySubDivisionId = this.selectedDistrict ? this.selectedDistrict.CountrySubDivisionId : null;
      for (var i in this.newPatient.OutPatientValidator.controls) {
        this.newPatient.OutPatientValidator.controls[i].markAsDirty();
        this.newPatient.OutPatientValidator.controls[i].updateValueAndValidity();
      }  
      if (this.newPatient.IsValid(undefined, undefined) && (this.newPatient.CountrySubDivisionId != null || this.newPatient.CountrySubDivisionId != undefined)) {
        //check if middlename exists or not to append to Shortname 
        var midName = this.newPatient.MiddleName;
        if (midName) {
          midName = this.newPatient.MiddleName.trim() + " ";
        } else {
          midName = "";
        }
         
        //removing extra spaces typed by the users
        this.newPatient.FirstName = this.newPatient.FirstName.trim();
        this.newPatient.MiddleName = this.newPatient.MiddleName ? this.newPatient.MiddleName.trim() : null;
        this.newPatient.LastName = this.newPatient.LastName.trim();
        this.newPatient.ShortName = this.newPatient.FirstName + " " + midName + this.newPatient.LastName;

        this.CheckExistingPatientsAndSubmit();
      }
      else {
        this.msgBoxServ.showMessage('failed', ["Some of the inputs are invalid. Please check and try again. !"]);
        this.loading = false;//re-enable the buttons after showing the error message.
      }
    }
  }

  public matchedPatientList: any;
  public showExstingPatientListPage: boolean = false;

  public CheckExistingPatientsAndSubmit() {
    if (!this.newPatient.PatientId) {
      let age = this.newPatient.Age + this.newPatient.AgeUnit;
      this.billingBLService.GetExistedMatchingPatientList(this.newPatient.FirstName, this.newPatient.LastName, this.newPatient.PhoneNumber, age, this.newPatient.Gender)
        .subscribe(res => {
          if (res.Status == "OK" && res.Results.length) {
            this.matchedPatientList = res.Results;
            this.showExstingPatientListPage = true;
            this.loading = false;
          }
          else {
            this.RegisterNewPatient();
          }
        }, (err) => {
          this.loading = false;
          this.msgBoxServ.showMessage('failed', ["Failed to add new Patient. Please try later !"]);
        });
    }
    else {
      this.RegisterNewPatient();
    }

  }

  RegisterNewPatient() {
    this.ConcatinateAgeAndUnit();

    this.billingBLService.AddNewOutpatienPatient(this.newPatient)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.loading = false;

          if (this.GoToBilling) {
            this.callBackAddClose.emit({ action: "register-and-billing", data: res.Results, close: true });
          }
          else {
            this.callBackAddClose.emit({ action: "register-only", data: res.Results, close: true });
          }


        }
        else {
          this.msgBoxServ.showMessage('failed', ["Failed to add new Patient. Please try later !"]);
          this.loading = false;
        }
      }, (err) => {
        this.loading = false;
        this.msgBoxServ.showMessage('failed', ["Failed to add new Patient. Please try later !"]);
      });
  }

  //we're storing Age and Age unit in a single column.
  public ConcatinateAgeAndUnit() {
    if (this.newPatient.Age && this.newPatient.AgeUnit) {
      this.newPatient.Age = this.newPatient.Age + this.newPatient.AgeUnit;
    }
  }

  public CloseAddNewPatPopUp() {
    this.callBackAddClose.emit({ close: true });
  }

  translate(language) {
    this.unicode.translate(language);
    if (language == "english") {
      var localName = <HTMLInputElement>document.getElementById("patNameLocal");
      let ipLocalName = localName.value;
      this.newPatient.PatientNameLocal = ipLocalName.length > 0 ? ipLocalName : "";
    }
  }
  //if the user selects any patient from the matched list of patient. assign it to current patient instead of creating a new patient.
  AssignMatchedPatientAndProceed(PatientId) {
    let existingPatient = this.matchedPatientList.find(a => a.PatientId == PatientId);
    existingPatient.CountrySubDivisionName = this.districts_All.find(a => a.CountrySubDivisionId == existingPatient.CountrySubDivisionId).CountrySubDivisionName;
    this.callBackAddClose.emit({ action: "register-and-billing", data: existingPatient, close: true });
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

  emitCloseAction($event) {
    var action = $event.action;
    var data = $event.data;

    if (action == "use-existing") {
      let patientId = data;
      this.AssignMatchedPatientAndProceed(patientId); //Match Existing Patient and process
    }
    else if (action == "add-new") {
      this.RegisterNewPatient();
    }
    else if (action == "close") {
      this.showExstingPatientListPage = false;
    }
    this.loading = false;
  }

  //common function to set focus on  given Element. 
  setFocusById(targetId: string, waitingTimeinMS: number = 10) {
    this.coreService.FocusInputById(targetId);
  }

  public phoneNumberMandatory() {
    if (!this.isPhoneMandatory) {
      this.newPatient.UpdateValidator("off", "PhoneNumber");
    }
  }

  public hotkeys(event) {
    if (event.keyCode == 27) {
      this.callBackAddClose.emit({ close: true });
    }
  }

  public updateMunicipality(event) {
    if (event) {
      this.newPatient.MunicipalityId = event.data;
    }
  }
}
