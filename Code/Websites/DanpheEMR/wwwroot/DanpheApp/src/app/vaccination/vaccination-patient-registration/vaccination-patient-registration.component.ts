import { ChangeDetectorRef, Component, HostListener, ViewChild } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Input, Output, EventEmitter } from "@angular/core";
import { SecurityService } from "../../security/shared/security.service"
import { CoreService } from '../../core/shared/core.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { VaccinationPatient } from '../shared/vaccination-patient.model';
import * as moment from 'moment/moment';
import { CommonFunctions } from '../../shared/common.functions';
import { PatientService } from '../../patients/shared/patient.service';
import { VaccinationBLService } from '../shared/vaccination.bl.service';
import { CountrySubdivision } from '../../settings-new/shared/country-subdivision.model';
import { DanpheCache, MasterType } from '../../shared/danphe-cache-service-utility/cache-services';
import { PatientsBLService } from '../../patients/shared/patients.bl.service';
import { VaccinationService } from '../shared/vaccination.service';



@Component({
    selector: "vaccination-patient-registration",
    templateUrl: "./vaccination-patient-registration.html",
    host: { '(window:keydown)': 'hotkeys($event)' }
})

// App Component class
export class VaccinationPatientRegistrationComponent {

    public model: VaccinationPatient;
    public calType: string = "";
    public olderAddressList: Array<any> = [];

    @Input("patientId")
    public patientId: any;

    @Output("vaccineRegEmitter")
    vaccineRegEmitter: EventEmitter<Object> = new EventEmitter<Object>();

    public loading: boolean = false;

    public Country_All: any = null;
    public districts_All: Array<CountrySubdivision> = [];
    public districts_Filtered: Array<CountrySubdivision> = [];
    public selectedDistrict: CountrySubdivision = new CountrySubdivision();
    public isVaccRegNumAutoIncreaseEnabled: boolean;
    public CastEthnicGroupList: Array<any> = Array<any>();
    public IsEditMode: boolean;
    public showMunicipality: boolean = false;
    public vaccDeptName: string = "IMMUNIZATION";

    constructor(public securityService: SecurityService, public router: Router,
        public coreService: CoreService, public patientService: PatientService,
        public msgBoxServ: MessageboxService, public vaccinationBlService: VaccinationBLService,
        public changeDetector: ChangeDetectorRef, public vaccinationService: VaccinationService
    ) {
        this.LoadCastEthnicGroupList();
        this.LoadCalendarTypes();
        if (this.coreService.Masters.UniqueDataList && this.coreService.Masters.UniqueDataList.UniqueAddressList) {
            this.olderAddressList = this.coreService.Masters.UniqueDataList.UniqueAddressList;
        }
        this.isVaccRegNumAutoIncreaseEnabled = this.coreService.IsVaccRegNumAutoIncreamentEnabled();
        this.showMunicipality = this.coreService.ShowMunicipality().ShowMunicipality;

        let paramObj = this.coreService.Parameters.find(p => p.ParameterName == "ImmunizationDeptName" && p.ParameterGroupName == "Common");
        if (paramObj && paramObj.ParameterValue) {
            this.vaccDeptName = paramObj.ParameterValue;
        }
    }

    //Code added to enable Enter Key selection and focus on next html tag in SELECT htm tag: starts
    @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent) {
        if (this.coreService.selectEnterKeyCaptureEnabled) {
            this.coreService.FocusInputById(this.coreService.nextFocusElemId);
            return;
        }
        return;
    }
    //Code added to enable Enter Key selection and focus on next html tag in SELECT htm tag: ends

    ngOnInit() {
        this.Country_All = DanpheCache.GetData(MasterType.Country, null);
        this.districts_All = DanpheCache.GetData(MasterType.SubDivision, null);
        if (this.patientId > 0) {
            this.IsEditMode = true;
            this.GetPatientForEdit(this.patientId);
        } else {
            this.IsEditMode = false;
            this.model = new VaccinationPatient();
            if (this.model.DateOfBirth == null) {
                this.model.DateOfBirth = moment().format('YYYY-MM-DD');
            }
            else if (isNaN(Date.parse(this.model.DateOfBirth))) {
                this.model.DateOfBirth = moment().format('YYYY-MM-DD');
            }
            this.AssignCountryAndSubDivision();
            if (this.isVaccRegNumAutoIncreaseEnabled) { this.model.PatientValidator.controls["VaccinationRegNo"].disable(); } else { this.GetLatestVaccRegNumber(); }

        }
    }

    ngAfterViewInit() {
        this.changeDetector.detectChanges();
        this.SetFocusById('regPatMotherName');
    }

    GetLatestVaccRegNumber() {
        this.vaccinationBlService.GetLatestVaccRegistrationNumber().subscribe(res => {
            if (res.Status == "OK") {
                this.model.VaccinationRegNo = res.Results;
            }
        }, (err) => {
            this.msgBoxServ.showMessage("Error", [err.error.ErrorMessage]);
            console.log(err.error.ErrorMessage);
        }
        );
    }

    AssignCountryAndSubDivision() {
        let country = this.coreService.GetDefaultCountry();
        let subDivision = this.coreService.GetDefaultCountrySubDivision();
        this.model.CountryId = country ? country.CountryId : null;
        this.selectedDistrict.CountrySubDivisionId = this.model.CountrySubDivisionId = subDivision ? subDivision.CountrySubDivisionId : null;
        this.selectedDistrict.CountrySubDivisionName = this.model.CountrySubDivisionName = subDivision ? subDivision.CountrySubDivisionName : null;
    }

    GetPatientForEdit(id: number) {
        this.loading = true;
        this.vaccinationBlService.GetVaccinationPatientById(id).subscribe(res => {
            if (res.Status == "OK") {
                let dataRes = res.Results;
                // if (dataRes.Age && dataRes.Age.length) {
                //     dataRes.Age = dataRes.Age.trim();
                //     dataRes.Age = dataRes.Age.substring(0, dataRes.Age.length - 2);
                // }
                let seperatedAgeUnit = this.vaccinationService.SeperateAgeAndUnit(dataRes.Age);
                if (seperatedAgeUnit) {
                    dataRes.Age = seperatedAgeUnit.Age;
                    dataRes.AgeUnit = seperatedAgeUnit.Unit;
                }
                this.model = Object.assign(new VaccinationPatient(), dataRes);
                if (this.model.CountryId && this.model.CountrySubDivisionId) {
                    let dis = this.districts_All.find(d => d.CountrySubDivisionId == this.model.CountrySubDivisionId);
                    this.selectedDistrict.CountrySubDivisionId = dis.CountrySubDivisionId;
                    this.selectedDistrict.CountrySubDivisionName = dis.CountrySubDivisionName;
                } else {
                    this.AssignCountryAndSubDivision();
                }
                if (this.isVaccRegNumAutoIncreaseEnabled) { this.model.PatientValidator.controls["VaccinationRegNo"].disable(); }
                if (!this.model.VaccinationRegNo) {
                    this.GetLatestVaccRegNumber();
                }
                this.loading = false;
            } else {
                this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                this.loading = false;
            }
        });
    }

    LoadCalendarTypes() {
        let Parameter = this.coreService.Parameters;
        Parameter = Parameter.filter(parms => parms.ParameterName == "CalendarTypes");
        let calendarTypeObject = JSON.parse(Parameter[0].ParameterValue);
        this.calType = calendarTypeObject.PatientRegistration;
    }

    GenerateAge() {
        let dobYear: number = Number(moment(this.model.DateOfBirth).format("YYYY"));
        if (dobYear > 1900) {
            if (this.model.AgeUnit == "Y") {
                this.model.Age = String(moment().diff(moment(this.model.DateOfBirth), 'years'));
            }
            else if (this.model.AgeUnit == "M") {
                this.model.Age = String(moment().diff(moment(this.model.DateOfBirth), 'months'));
            }
            else if (this.model.AgeUnit == "D") {
                this.model.Age = String(moment().diff(moment(this.model.DateOfBirth), 'days') + 1);
            }


        }
    }

    public AssignSelectedDistrict() {
        if (this.selectedDistrict && this.selectedDistrict.CountrySubDivisionId) {
            this.model.CountrySubDivisionId = this.selectedDistrict.CountrySubDivisionId;
            this.model.CountrySubDivisionName = this.selectedDistrict.CountrySubDivisionName;
        }
    }

    public CountryDDL_OnChange() {
        this.districts_Filtered = this.districts_All.filter(c => c.CountryId == this.model.CountryId);
    }

    public districtListFormatter(data: any): string {
        let html = data["CountrySubDivisionName"];
        return html;
    }

    capitalizeFirstLetter(controlName) {
        let cntrl = this.model.PatientValidator.controls[controlName];
        if (cntrl) {
            let str: string = cntrl.value;
            let returnStr: string = CommonFunctions.CapitalizeFirstLetter(str);
            cntrl.setValue(returnStr);
        }
    }

    CalculateDob() {
        if ((this.model.Age || this.model.Age > "0") && this.model.AgeUnit) {
            var age: number = Number(this.model.Age);
            var ageUnit: string = this.model.AgeUnit;
            this.model.DateOfBirth = this.vaccinationService.CalculateDOB(age, ageUnit);
        }
        else {
            this.model.PatientValidator.controls["Age"].reset(null);
            this.model.Age = null;
        }
    }

    AddUpdateVaccinationPatient() {
        this.loading = true;

        if (!(typeof (this.selectedDistrict) == "object")) {
            this.model.PatientValidator.controls["CountrySubDivisionId"].reset(null)
            this.model.CountrySubDivisionId = null;
            this.model.CountrySubDivisionName = null;
        }

        if (!this.isVaccRegNumAutoIncreaseEnabled && !(this.model.VaccinationRegNo > 0)) { this.loading = false; return; }

        for (var i in this.model.PatientValidator.controls) {
            this.model.PatientValidator.controls[i].markAsDirty();
            this.model.PatientValidator.controls[i].updateValueAndValidity();
        }
        if (this.model.IsValidCheck(undefined, undefined)) {
            this.vaccinationBlService.AddUpdateVaccinationPatient(this.model).subscribe(res => {
                if (res.Status == "OK") {
                    this.vaccineRegEmitter.emit({
                        close: true, dataAddedUpdated: true, PatientId: res.Results.PatientId,
                        IsEditMode: this.IsEditMode, PatientVisitId: res.Results.PatientVisitId
                    });

                    let successMsgTxt = this.IsEditMode ? "Patient updated successfully." : "Patient Added successfully.";

                    this.msgBoxServ.showMessage('success', [successMsgTxt]);
                    this.loading = false;
                } else {
                    this.loading = false;
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            }, err => {
                this.loading = false;
                this.msgBoxServ.showMessage("error", [err.error.ErrorMessage]);
            });
        } else {
            this.loading = false;
        }
    }

    CloseVaccinationRegister(addUpdate: boolean) {
        this.vaccineRegEmitter.emit({ close: true, dataAddedUpdated: addUpdate, PatientId: null, IsEditMode: this.IsEditMode });
    }

    SetFocusById(IdToBeFocused: string) {
        this.coreService.FocusInputById(IdToBeFocused);
    }

    setBabyName() {
        // if (this.patientId) { return; }
        let motherName = this.model.MotherName;
        let str: string;
        if (motherName) {
            str = CommonFunctions.CapitalizeFirstLetter(motherName);
            this.model.ShortName = "Baby of " + str;
        } else {
            this.model.ShortName = '';
        }
    }

    //this function is hotkeys when pressed by user
    public hotkeys(event) {
        if (event.keyCode == 27) {
            this.vaccineRegEmitter.emit({ close: true });
        }

    }

    public EthnicGroupAutoSelect() {
        let LastNameArray: Array<any> = this.model.MotherName.split(" ");
        let lastName: string;

        if (LastNameArray.length > 1) {
            lastName = LastNameArray[LastNameArray.length - 1];

            if (lastName == '' && LastNameArray.length > 3) {
                lastName = LastNameArray[2]; // escaping all spaces after last name (with middle name)             
            } else if (lastName == '' && LastNameArray.length > 2) {
                lastName = LastNameArray[1]; // escaping all spaces after last name (no middle name)              
            }
            lastName = lastName.toLowerCase();
        } else {
            // assign default ethnicity
            this.model.EthnicGroup = 'Brahmin/Chhetri';
            return;
        }

        // Compair Casts with entered last name
        let tempEthnic: string;
        this.CastEthnicGroupList.forEach(a => {
            if (a.CastKeyWords.length > 0 && a.CastKeyWords.find(b => b == lastName)) {
                tempEthnic = a.EthnicGroup;
                return;
            }
        });

        if (tempEthnic) {
            this.model.EthnicGroup = tempEthnic;
        } else {
            // assign default ethnicity
            this.model.EthnicGroup = 'Brahmin/Chhetri';
        }

    }
    public LoadCastEthnicGroupList() {
        this.vaccinationBlService.GetCastEthnicGroupList().subscribe(res => {
            if (res.Status = "OK") {
                var temp: any = res.Results;
                temp.forEach(a => {
                    if (a.CastKeyWords) {
                        a.CastKeyWords = a.CastKeyWords.split(',');
                    } else {
                        a.CastKeyWords = [];
                    }
                });
                this.CastEthnicGroupList = temp;
            }
        })
    }

    public updateMunicipality(event) {
        if (event) {
            this.model.MunicipalityId = event.data;
        }
    }
}

