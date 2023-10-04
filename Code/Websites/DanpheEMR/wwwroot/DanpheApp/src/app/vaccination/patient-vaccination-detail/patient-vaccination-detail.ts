import { ChangeDetectorRef, Component, HostListener } from '@angular/core'
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
import VaccinationGridColumnSettings from '../shared/vaccination.grid.settings';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../shared/danphe-grid/NepaliColGridSettingsModel';
import { PatientVaccineDetailModel } from '../shared/patient-vaccine-detail.model';
import { BillingFiscalYear } from '../../billing/shared/billing-fiscalyear.model';



@Component({
    selector: "patient-vaccination-detail",
    templateUrl: "./patient-vaccination-detail.html",
    styles: ['.error-msg{font-size: 11px; font-weight: normal;}']
})

// App Component class
export class PatientVaccinationDetailComponent {
    @Input("patientId") public patientId: number;
    @Input("patientDetail") public patientDetail: any;
    public loading: boolean = false;
    public vaccinesListOfPat: any;
    public patientVaccListGridColumns: any;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public patientVaccineDetail: PatientVaccineDetailModel;
    public isVaccineListLoaded: boolean = false;

    public vaccineList: Array<any> = [];
    public doseListOfVaccine: Array<any> = [];
    public isVaccRegNumAutoIncreaseEnabled: boolean;
    public vaccRegNumber: number;
    public selectedFiscalYear: number;
    public allFiscalYrs: Array<BillingFiscalYear> = [];
    public latestVaccRegNumForSelectedFiscYear: number;
    public timeId: any;
    public duplicateRegNumberData: any;

    constructor(public securityService: SecurityService, public router: Router,
        public coreService: CoreService, public patientService: PatientService,
        public msgBoxServ: MessageboxService, public vaccinationBlService: VaccinationBLService,
        public changeDetector: ChangeDetectorRef
    ) {
        this.patientVaccListGridColumns = VaccinationGridColumnSettings.patientVaccinationListGridColumns;
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(
            new NepaliDateInGridColumnDetail("VaccineDate", true)
        );
        this.isVaccRegNumAutoIncreaseEnabled = this.coreService.IsVaccRegNumAutoIncreamentEnabled();
    }

    ngOnInit() {
        console.log(this.patientDetail);
        this.selectedFiscalYear = this.patientDetail.VaccinationFiscalYearId;
        console.log(this.selectedFiscalYear);
        this.GetAllFiscalYrs();
        this.patientVaccineDetail = new PatientVaccineDetailModel();
        this.GetAllVaccinesWithDoses();
        this.GetAllVaccinesOfPatient();
        this.vaccRegNumber = this.patientDetail.VaccinationRegNo;
    }


    GetAllFiscalYrs() {
        this.vaccinationBlService.GetAllFiscalYears()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.allFiscalYrs = res.Results;
                }
            });
    }

    GetLatestRegistrationNumber() {
        this.vaccinationBlService.GetLatestVaccRegistrationNumber(this.selectedFiscalYear).subscribe(res => {
            if (res.Status == "OK") {
                this.latestVaccRegNumForSelectedFiscYear = res.Results;
            }
        }, (err) => { console.log(err.error.ErrorMessage); }
        );

        this.GetExistingDuplicateDataWithSelectedRegNum();
    }

    vaccRegNumberChanged() {
        this.GetExistingDuplicateDataWithSelectedRegNum();
    }

    GetExistingDuplicateDataWithSelectedRegNum() {
        if ((this.vaccRegNumber > 0) && (this.selectedFiscalYear > 0)) {
            this.vaccinationBlService.GetExistingVaccRegNumData(this.selectedFiscalYear, this.vaccRegNumber).subscribe(res => {
                if (res.Status == "OK") {
                    this.duplicateRegNumberData = res.Results;
                }
            }, (err) => { console.log(err.error.ErrorMessage); }
            );
        } else {
            this.msgBoxServ.showMessage("error", ["Please enter valid vaccination registration number and fiscal years."]);
        }
    }

    UpdateVaccineRegNumberForPatient() {
        if (this.duplicateRegNumberData && (this.duplicateRegNumberData.PatientId != this.patientId)) {
            this.msgBoxServ.showMessage("error", ["Cannot use this vaccination registration number. It is already used."]);
            this.loading = false;
        }
        if ((this.vaccRegNumber > 0) && (this.selectedFiscalYear > 0)) {
            this.vaccinationBlService.UpdateVaccineRegNumberOfPatient(this.patientId, this.vaccRegNumber, this.selectedFiscalYear).subscribe(res => {
                if (res.Status == "OK") {
                    this.msgBoxServ.showMessage("success", ["Vaccination registration number updated successfully"]);
                    this.loading = false;
                } else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                    this.loading = false;
                }
            }, (err) => {
                this.msgBoxServ.showMessage("error", ['Error occured while updating Registration Number. Please check your data entered.']);
                this.loading = false;
            });
        } else {
            this.msgBoxServ.showMessage("error", ["Please enter valid vaccination registration number and fiscal years."]);
            this.loading = false;
        }
    }

    GetAllVaccinesWithDoses() {
        this.vaccinationBlService.GetAllVaccinesListWithDosesMapped(true).subscribe(res => {
            if (res.Status == "OK") {
                this.vaccineList = res.Results;
                this.loading = false;
            } else {
                this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                this.loading = false;
            }
        });
    }


    GetAllVaccinesOfPatient() {
        this.loading = true;
        this.vaccinesListOfPat = [];
        this.vaccinationBlService.GetAllVaccinesOfPatientByPatientId(this.patientId).subscribe(res => {
            if (res.Status == "OK") {
                this.vaccinesListOfPat = res.Results;
                this.loading = false;
            } else {
                this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                this.loading = false;
            }
        });
    }

    PatVaccinationListGridActions($event) {
        switch ($event.Action) {
            case "edit":
                this.patientVaccineDetail = Object.assign(new PatientVaccineDetailModel(), $event.Data);
                this.VaccineChanged(true);
                this.changeDetector.detectChanges();
                break;
            default:
                break;
        }
    }

    VaccineChanged(isEdit: boolean = false) {
        if (this.patientVaccineDetail.VaccineId > 0) {
            let vaccSelected = this.vaccineList.find(v => v.VaccineId == this.patientVaccineDetail.VaccineId);
            this.doseListOfVaccine = vaccSelected ? vaccSelected.DoseDetail : [];
        }
        if (isEdit) {
            this.patientVaccineDetail.PatVaccineDetailValidator.controls["DoseNumber"].reset(this.patientVaccineDetail.DoseNumber);
        } else {
            this.patientVaccineDetail.PatVaccineDetailValidator.controls["DoseNumber"].reset(0);
            this.patientVaccineDetail.DoseNumber = 0;
        }
    }

    AddVaccineForPatient() {
        this.loading = true;
        this.patientVaccineDetail.PatientId = this.patientId;
        for (var i in this.patientVaccineDetail.PatVaccineDetailValidator.controls) {
            this.patientVaccineDetail.PatVaccineDetailValidator.controls[i].markAsDirty();
            this.patientVaccineDetail.PatVaccineDetailValidator.controls[i].updateValueAndValidity();
        }
        if (this.patientVaccineDetail.IsValidCheck(undefined, undefined)) {
            this.vaccinationBlService.AddUpdatePatientVaccineDetail(this.patientVaccineDetail).subscribe(res => {
                if (res.Status == "OK") {
                    let msg = this.patientVaccineDetail.PatientVaccineId ? "Patient vaccine successfully added" : "Patient vaccine successfully updated";
                    this.msgBoxServ.showMessage('success', ["Patient vaccine successfully added"]);
                    this.loading = false;
                    this.GetAllVaccinesOfPatient();
                    this.Reset();
                } else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                    this.loading = false;
                }
            });
        } else {
            this.loading = false;
        }
    }

    Reset() {
        this.patientVaccineDetail = new PatientVaccineDetailModel();
        let currDatetime = moment().format().toString();
        this.patientVaccineDetail.VaccineDate = currDatetime;
    }
}
