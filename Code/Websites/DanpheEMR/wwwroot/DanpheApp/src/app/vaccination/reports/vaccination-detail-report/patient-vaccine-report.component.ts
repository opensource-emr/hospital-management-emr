import { Component } from "@angular/core";
import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from "../../../security/shared/security.service";
import { GeneralFieldLabels } from "../../../shared/DTOs/general-field-label.dto";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { VaccinationBLService } from "../../shared/vaccination.bl.service";
import VaccinationGridColumnSettings from "../../shared/vaccination.grid.settings";

@Component({
    templateUrl: './patient-vaccine-report.html'
})
export class PatientVaccinationDetailReportComponent {
    public timeId: any = null;
    public vaccIdList: Array<number> = new Array<number>();
    public isInitialLoad: boolean = true;
    public fromDate: string = null;
    public toDate: string = null;
    public gender: string = "All";

    public reportData: Array<any> = new Array<any>();
    public vaccinationPatientReportGridColumns: any;
    public GeneralFieldLabel = new GeneralFieldLabels();

    constructor(public securityService: SecurityService, public msgBoxService: MessageboxService, public vaccinationBlService: VaccinationBLService, public coreservice: CoreService,) {
        this.vaccinationPatientReportGridColumns = VaccinationGridColumnSettings.vaccinationPatientReportGridColumns;
        this.GeneralFieldLabel = coreservice.GetFieldLabelParameter();
        this.vaccinationPatientReportGridColumns[8].headerName = `${this.GeneralFieldLabel.Caste}`;
    }

    onDateChange($event) {
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
        if ((this.fromDate != null) && (this.toDate != null) && (this.vaccIdList.length > 0) && !this.isInitialLoad
            && (this.gender && this.gender.trim().length > 0)) {
            if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
                this.GetDataFilterByVaccines(this.fromDate, this.toDate, this.gender, this.vaccIdList);
            } else {
                this.msgBoxService.showMessage("failed", ['Please enter valid From date and To date']);
            }
        }
    }

    GetDataFilterByVaccines(from, to, gender, vaccList) {
        this.reportData = [];
        this.vaccinationBlService.GetIntegratedVaccineReport(from, to, gender, vaccList).subscribe(res => {
            if (res.Status == "OK") {
                this.reportData = res.Results;
            } else {
                this.msgBoxService.showMessage("error", [res.ErrorMessage]);
            }
        }, err => {
            console.log(err.ErrorMessage);
            this.msgBoxService.showMessage("error", ['Error occured while getting report']);
        });
    }

    public GetDataFilterByVaccinesAndGender() {
        if ((this.fromDate != null) && (this.toDate != null) && (this.vaccIdList.length > 0) && (this.gender && this.gender.trim().length > 0)) {
            if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
                this.GetDataFilterByVaccines(this.fromDate, this.toDate, this.gender, this.vaccIdList);
            } else {
                this.msgBoxService.showMessage('failed', ['Please enter valid From date and To date']);
            }
        }
    }

    public VaccineOnSlected($event) {
        this.isInitialLoad = false;
        this.vaccIdList = [];
        // this.reportList = [];
        if ($event && $event.length) {
            $event.forEach(v => {
                this.vaccIdList.push(v.VaccineId);
            })
        }
        if (this.timeId) {
            window.clearTimeout(this.timeId);
            this.timeId = null;
        }
        this.timeId = window.setTimeout(() => {
            this.GetDataFilterByVaccinesAndGender();
        }, 1000);
    }

    public GenderChanged() {
        if (this.timeId) {
            window.clearTimeout(this.timeId);
            this.timeId = null;
        }
        this.timeId = window.setTimeout(() => {
            this.GetDataFilterByVaccinesAndGender();
        }, 1000);
    }
    gridExportOptions = {
        fileName: 'VaccineRport' + moment().format('YYYY-MM-DD') + '.xls',
    };
}
