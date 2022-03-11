import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { SecurityService } from "../../../security/shared/security.service";
import { VaccinationBLService } from "../../shared/vaccination.bl.service";
import VaccinationGridColumnSettings from "../../shared/vaccination.grid.settings";
import { PatientVaccineDetailModel } from "../../shared/patient-vaccine-detail.model";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";

@Component({
    templateUrl: './vaccination-appointment-details-report.html'
})
export class PatientVaccinationAppointmentDetailsReportComponent {
    public fromDate: string = null;
    public toDate: string = null;
    public AppointmentType: string = 'all';

    public DailyAppointmentReportData: Array<any> = [];
    public DailyAppointmentReportGridColumns: Array<any> = [];
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

    public loading: boolean = false;

    constructor(public securityService: SecurityService,
        public msgBoxService: MessageboxService,
        public vaccinationBlService: VaccinationBLService) {
        this.DailyAppointmentReportGridColumns = VaccinationGridColumnSettings.vaccinationAppointmentDetailsReportColumns;
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("VisitDateTime", true));
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("DateOfBirth", false));
    }

    OnFromToDateChange($event) {
        this.fromDate = $event ? $event.fromDate : moment().format('YYYY-MM-DD');
        this.toDate = $event ? $event.toDate : moment().format('YYYY-MM-DD');
    }

    GetAppointmentDetailsReport() {
        this.DailyAppointmentReportData = [];
        this.vaccinationBlService.GetAppointmentDetailsReport(this.fromDate, this.toDate, this.AppointmentType)
            .finally(() => { this.loading = false; })
            .subscribe(res => {
                if (res.Status == "OK") {
                    if (res.Results.length > 0) {
                        this.DailyAppointmentReportData = res.Results;
                    }
                    else {
                        this.msgBoxService.showMessage("notice-message", ["No Data is Available For Selcted Parameter"]);
                    }
                } else {
                    this.msgBoxService.showMessage("error", [res.ErrorMessage]);
                }
            }, err => {
                console.log(err.ErrorMessage);
                this.msgBoxService.showMessage("error", ['Error occured while getting report']);
            });
    }


    gridExportOptions = {
        fileName: 'VaccinationAppointmentDetailsReport' + moment().format('YYYY-MM-DD') + '.xls',
    };
}
