import { Component, ChangeDetectorRef, EventEmitter, Output, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { resolve } from 'url';
import { CoreService } from '../../../core/shared/core.service';
import { PatientService } from '../../../patients/shared/patient.service';
import { CountrySubdivision } from '../../../settings-new/shared/country-subdivision.model';
import { DanpheCache, MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';
import { PHRMPatient } from '../../shared/phrm-patient.model';

@Component({
  selector: 'phrm-op-patient-add',
  templateUrl: './phrm-op-patient-add.html',
  styles: [`padding-7-tp{padding-top: 7px;}`]
})
export class PhrmOutpatientAddComponent {
  //master data for form filling
  public countryList: any = null;
  public districtList: Array<CountrySubdivision> = [];
  public districtListFiltered: Array<CountrySubdivision> = [];
  public selectedDistrict: CountrySubdivision = new CountrySubdivision();
  public olderAddressList: Array<any> = [];

  @Input("patient-info") public newPatient: PHRMPatient = new PHRMPatient();
  @Input("showPopUp") public showPopUp: any;

  @Output("call-back-close") callBackClose: EventEmitter<any> = new EventEmitter();
  @Output("call-back-add-update") callBackAddUpdate: EventEmitter<any> = new EventEmitter();

  public EditMode: boolean = false;
  public loading: boolean = false;

  public matchedPatientList: any;
  public showExstingPatientListPage: boolean = false;

  constructor(public changeDetector: ChangeDetectorRef, public coreService: CoreService, public patientService: PatientService, public pharmacyBLService: PharmacyBLService) {
    this.GetMasterData();
  }

  ngOnInit() {
    this.AssignDefaultCountryAndSubDivision();
    this.ModifyValidatorsInPatientModel();
    this.CheckForEditMode();
    this.setFocusById("newPatFirstName");
  }

  private AssignDefaultCountryAndSubDivision() {
    let country = this.coreService.GetDefaultCountry();
    let subDivision = this.coreService.GetDefaultCountrySubDivision();
    this.newPatient.CountryId = country ? country.CountryId : null;
    this.selectedDistrict.CountrySubDivisionId = this.newPatient.CountrySubDivisionId = subDivision ? subDivision.CountrySubDivisionId : null;
    this.selectedDistrict.CountrySubDivisionName = this.newPatient.CountrySubDivisionName = subDivision ? subDivision.CountrySubDivisionName : null;
  }

  private ModifyValidatorsInPatientModel() {
    this.newPatient.PHRMPatientValidator.addControl("CountryId", new FormControl("", Validators.required));
    this.newPatient.PHRMPatientValidator.addControl("CountrySubDivisionId", new FormControl("", Validators.required));
    this.newPatient.PHRMPatientValidator.markAsPristine();
    this.newPatient.PHRMPatientValidator.markAsUntouched();
  }

  private CheckForEditMode() {
    //First Name will be empty for the first time patient is being added.
    if (this.newPatient.FirstName != "") {
      this.EditMode = true;
      this.DivideAgeAndAgeUnit();
    }
  }

  private DivideAgeAndAgeUnit() {
    if (this.newPatient.Age != null) {
      this.newPatient.AgeUnit = this.newPatient.Age.substring(this.newPatient.Age.length, this.newPatient.Age.length - 1);
      this.newPatient.Age = this.newPatient.Age.substring(0, this.newPatient.Age.length - 1);
    }
  }

  public GetMasterData() {
    this.countryList = DanpheCache.GetData(MasterType.Country, null);
    this.districtList = DanpheCache.GetData(MasterType.SubDivision, null);
    if (this.coreService.Masters.UniqueDataList && this.coreService.Masters.UniqueDataList.UniqueAddressList) {
      this.olderAddressList = this.coreService.Masters.UniqueDataList.UniqueAddressList;
    }
  }

  public districtListFormatter(data: any): string {
    let html = data["CountrySubDivisionName"];
    return html;
  }

  public OnDistrictChange() {
    if (this.selectedDistrict && this.selectedDistrict.CountrySubDivisionId) {
      this.newPatient.CountrySubDivisionId = this.selectedDistrict.CountrySubDivisionId;
      this.newPatient.CountrySubDivisionName = this.selectedDistrict.CountrySubDivisionName;
    }
  }

  public OnCountryChange() {
    this.districtListFiltered = this.districtList.filter(c => c.CountryId == this.newPatient.CountryId);
  }

  public CalculateDob() {
    this.newPatient.DateOfBirth = this.patientService.CalculateDOB(Number(this.newPatient.Age), this.newPatient.AgeUnit);
  }

  async SavePateintLocally() {
    this.loading = false;
    for (var i in this.newPatient.PHRMPatientValidator.controls) {
      this.newPatient.PHRMPatientValidator.controls[i].markAsDirty();
      this.newPatient.PHRMPatientValidator.controls[i].updateValueAndValidity();
    }
    if (this.newPatient.IsValidCheck(undefined, undefined)) {
      //removing extra spaces typed by the users
      this.newPatient.FirstName = this.newPatient.FirstName.trim();
      this.newPatient.MiddleName = (this.newPatient.MiddleName == null) ? "" : this.newPatient.MiddleName.trim();
      this.newPatient.LastName = this.newPatient.LastName.trim();
      this.newPatient.ShortName = this.newPatient.FirstName + " " + ((this.newPatient.MiddleName != "") ? (this.newPatient.MiddleName + " ") : "") + this.newPatient.LastName;

      if ((await this.IsPatientExistInDb()) == false) {
        this.EmitNewPatient();
      }
    }
  }

  private EmitNewPatient() {
    this.ConcatinateAgeAndAgeUnit();
    this.callBackAddUpdate.emit({ currentPatient: this.newPatient });
  }

  public IsPatientExistInDb(): Promise<boolean> {
    this.loading = true;
    //converting Observable to Promise in order to wait for the response from api call
    return this.pharmacyBLService.GetExistedMatchingPatientList(this.newPatient.FirstName, this.newPatient.LastName, this.newPatient.PhoneNumber)
    .toPromise()
    .then(res => {
      if (res.Status == "OK" && res.Results.length) {
        this.matchedPatientList = res.Results;
        this.showExstingPatientListPage = true;
        return true;
      }
      else {
        return false;
      }
    });
  }

  //we're storing Age and Age unit in a single column.
  public ConcatinateAgeAndAgeUnit() {
    //if age unit is already there in Age, do not concatenate again.
    if (["Y", "M", "D"].includes(this.newPatient.Age.toString()) == false)
      this.newPatient.Age = this.newPatient.Age + this.newPatient.AgeUnit;
  }
  public Close() {
    this.ResetPatient();
    this.showPopUp = false;
    this.callBackClose.emit();
  }

  private ResetPatient() {
    this.newPatient = new PHRMPatient();
  }

  //if the user selects any patient from the matched list of patient. assign it to current patient instead of creating a new patient.
  AssignMatchedPatientAndProceed(PatientId) {
    let existingPatient = this.matchedPatientList.find(a => a.PatientId == PatientId);
    existingPatient.CountrySubDivisionName = this.districtList.find(a => a.CountrySubDivisionId == existingPatient.CountrySubDivisionId).CountrySubDivisionName;
    this.callBackAddUpdate.emit({ currentPatient: existingPatient });
  }

  emitCloseAction($event) {
    var action = $event.action;
    var data = $event.data;

    if (action == "use-existing") {
      let patientId = data;
      this.AssignMatchedPatientAndProceed(patientId); //Match Existing Patient and process
    }
    else if (action == "add-new") {
      this.EmitNewPatient();
    }
    else if (action == "close") {
      this.showExstingPatientListPage = false;
    }
  }

  /**
    * @method setFocusById
    * @param {targetId} Id to be focused
    * @param {waitingTimeinMS} waititng time for the focus to be delayed
    * Set Focus to the id provided
  */
  setFocusById(targetId: string, waitingTimeinMS: number = 10) {
    var timer = window.setTimeout(function () {
      let itmNameBox = document.getElementById(targetId);
      if (itmNameBox) {
        itmNameBox.focus();
      }
      clearTimeout(timer);
    }, waitingTimeinMS);
  }
}
