import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CountrySubdivision } from '../../../settings-new/shared/country-subdivision.model';
import { CoreService } from '../../../core/shared/core.service';
import { Patient } from '../../../patients/shared/patient.model';
import { MaternityBLService } from '../../shared/maternity.bl.service';
import { MaternityPatient, MaternityPatientVM } from '../../shared/maternity.model';
import { MaternityService } from '../../shared/maternity.service';
import { PatientInfoVM } from './patient-detailsVM';
import { DanpheCache } from '../../../shared/danphe-cache-service-utility/cache-services';
import { MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';


@Component({
    selector: 'maternity-patient-add',
    templateUrl: './maternity-patient-add.html'
})

export class MaternityPatientAddComponent {

    @Input('pat-to-add')
    public patientInfo: Patient;

    @Input('pat-to-update')
    public patToUpdate: MaternityPatientVM;
    public PatientDetails: PatientInfoVM = new PatientInfoVM();
    public MaternityPatient: MaternityPatientVM = new MaternityPatientVM();
    public allCountry: any = null;
    public allDistricts: Array<CountrySubdivision> = [];
    public districts_Filtered: Array<CountrySubdivision> = [];
    public selectedDistrict: CountrySubdivision = new CountrySubdivision();
    @Output()
    public callBackAddClose: EventEmitter<Object> = new EventEmitter<Object>();
    public olderAddressList: Array<any> = [];
    public isUpdate: boolean = false;

    constructor(public maternityBlService: MaternityBLService,
        public maternityServ: MaternityService,
        public coreService: CoreService,
        public msgBoxServ: MessageboxService) {
        this.Initialize();
    }

    ngOnInit() {
        if (this.patToUpdate && this.patToUpdate.PatientId) {
            this.isUpdate = true;
            this.GetPatientDetailsById(this.patToUpdate.PatientId);
            this.MaternityPatient = Object.assign(this.MaternityPatient, this.patToUpdate);
        } else {
            this.isUpdate = false;
            if (this.patientInfo && this.patientInfo.PatientId) {
                this.GetPatientDetailsById(this.patientInfo.PatientId);
            } else {
                this.PatientDetails = new PatientInfoVM();
                let country = this.coreService.GetDefaultCountry();
                let subDivision = this.coreService.GetDefaultCountrySubDivision();
                this.PatientDetails.CountryId = country ? country.CountryId : null;
                this.PatientDetails.CountrySubDivisionId = subDivision ? subDivision.CountrySubDivisionId : null;
            }
        }
    }

    Initialize() {
        this.allCountry = DanpheCache.GetData(MasterType.Country, null);
        this.allDistricts = DanpheCache.GetData(MasterType.SubDivision, null);
        if (this.coreService.Masters.UniqueDataList && this.coreService.Masters.UniqueDataList.UniqueAddressList) {
            this.olderAddressList = this.coreService.Masters.UniqueDataList.UniqueAddressList;
        }
    }

    GetPatientDetailsById(id: number) {
        this.maternityBlService.GetPatientDetailById(id)
            .subscribe(res => {
                if (res.Status == "OK" && res.Results != null) {
                    this.PatientDetails = Object.assign(new PatientInfoVM(), res.Results);
                    if (this.allDistricts && this.allDistricts.length > 0) {
                        let data = this.allDistricts.filter(c => c.CountrySubDivisionId == this.PatientDetails.CountrySubDivisionId)
                        this.selectedDistrict = data[0];
                    }
                    let seperatedAgeUnit = this.maternityServ.SeperateAgeAndUnit(this.PatientDetails.Age);
                    if (seperatedAgeUnit) {
                        this.PatientDetails.Age = seperatedAgeUnit.Age;
                        this.PatientDetails.AgeUnit = seperatedAgeUnit.Unit;
                    }
                } else {
                    this.msgBoxServ.showMessage("error", ['Failed to load data']);
                }
            });
    }

    Close() {
        this.callBackAddClose.emit({ close: true });
    }

    setFocusById(targetId: string, waitingTimeinMS: number = 10) {
        var timer = window.setTimeout(function () {
            let htmlObject = document.getElementById(targetId) as HTMLInputElement;
            if (htmlObject) {
                htmlObject.focus();
                htmlObject.select();
            }
            clearTimeout(timer);
        }, waitingTimeinMS);
    }

    CalculateDob() {
        this.PatientDetails.DateOfBirth = this.maternityServ.CalculateDOB(Number(this.PatientDetails.Age), this.PatientDetails.AgeUnit);
    }

    CountryDDL_OnChange() {
        this.districts_Filtered = this.allDistricts.filter(c => c.CountryId == this.PatientDetails.CountryId);
    }

    AddNewMatPatient() {

        this.coreService.loading = true;
        this.MaternityPatient.PatientId = this.PatientDetails.PatientId;

        for (var i in this.MaternityPatient.MaternityPatientValidator.controls) {
            this.MaternityPatient.MaternityPatientValidator.controls[i].markAsDirty();
            this.MaternityPatient.MaternityPatientValidator.controls[i].updateValueAndValidity();
        }
        if (this.MaternityPatient.IsValid(undefined, undefined)) {
            this.maternityBlService.AddMaternityPatient(this.MaternityPatient).subscribe(res => {
                if (res.Status == "OK") {
                    this.callBackAddClose.emit({ close: true });
                    this.msgBoxServ.showMessage('success', ["Patient details updated successfully."]);

                    this.coreService.loading = false;
                } else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);

                    this.coreService.loading = false;
                }
            });
        }

    }

    districtListFormatter(data: any): string {
        let html = data["CountrySubDivisionName"];
        return html;
    }

    AssignSelectedDistrict() {
        if (this.selectedDistrict && this.selectedDistrict.CountrySubDivisionId) {
            this.patientInfo.CountrySubDivisionId = this.selectedDistrict.CountrySubDivisionId;
            this.patientInfo.CountrySubDivisionName = this.selectedDistrict.CountrySubDivisionName;
        }
    }

    UpdateMaternityPatient() {
        this.coreService.loading = true;
        this.MaternityPatient.PatientId = this.patToUpdate.PatientId;
        for (var i in this.MaternityPatient.MaternityPatientValidator.controls) {
            this.MaternityPatient.MaternityPatientValidator.controls[i].markAsDirty();
            this.MaternityPatient.MaternityPatientValidator.controls[i].updateValueAndValidity();
        }
        if (this.MaternityPatient.IsValid(undefined, undefined)) {
            this.maternityBlService.UpdateMaternityPatient(this.MaternityPatient).subscribe(res => {
                if (res.Status == "OK") {
                    this.callBackAddClose.emit({ close: true });
                    this.coreService.loading = false;
                    //this.GetMaternityPatient();
                    //this.matPatToUpdate = null;
                    this.msgBoxServ.showMessage('success', ["Patient details updated successfully."]);
                } else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                    this.coreService.loading = false;
                }
            });
        }

    }
}

