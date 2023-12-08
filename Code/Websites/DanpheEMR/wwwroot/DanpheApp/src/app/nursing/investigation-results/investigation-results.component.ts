import { Component } from '@angular/core';
import * as moment from 'moment';
import { VisitService } from '../../appointments/shared/visit.service';
import { CoreService } from '../../core/shared/core.service';
import { PatientService } from '../../patients/shared/patient.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_DateTimeFormat, ENUM_MessageBox_Status } from '../../shared/shared-enums';
import { InvestigationResultsView_DTO } from '../shared/dto/investigation-results-view.dto';
import { InvestigationResult_DTO } from '../shared/dto/investigation-results.dto';
import { NursingBLService } from '../shared/nursing.bl.service';

@Component({
    templateUrl: './investigation-results.component.html'


})
export class InvestigationResultsComponent {
    public Days: number = 10;
    public FromDate: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
    public ToDate: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
    public investigationResultList: Array<InvestigationResult_DTO> = [];
    public showPrintPage: boolean = false;
    public investigationResultViewList: Array<InvestigationResultsView_DTO> = new Array<InvestigationResultsView_DTO>();
    public DateHeaders: Array<string> = [];
    public isInvalidInput: boolean = false;
    public isNumValid: boolean = true;
    public divContentObj: any = { innerHTML: '' };
    constructor(
        public coreService: CoreService,
        public patientservice: PatientService,
        public visitservice: VisitService,
        public nursingBLService: NursingBLService,
        public msgBoxServ: MessageboxService,
    ) {
        this.ConvertDaysToDate(this.Days);
        this.LoadReport();
    }
    validateInput() {
        if (this.Days < 1 || this.Days > 20) {
            this.isInvalidInput = true;
        } else {
            this.isInvalidInput = false;
        }
    }
    ConvertDaysToDate(days: number): void {
        this.isNumValid = true;
        if (days >= 1 && days <= 20) {
            const date = new Date();
            if (days > 1) {
                date.setDate(date.getDate() - days + 1);
            }
            this.DateHeaders = [];
            this.FromDate = moment(date).format(ENUM_DateTimeFormat.Year_Month_Day);
            const fromDate = moment(this.FromDate);
            const toDate = moment(this.ToDate).add(1, 'day');
            while (fromDate.isBefore(toDate, 'day')) {
                this.DateHeaders.push(moment(fromDate).format(ENUM_DateTimeFormat.Year_Month_Day));
                fromDate.add(1, 'days');
            }
        }
        else {
            this.isNumValid = false;
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ['Please enter days from 1 to 20']);
        }
    }
    LoadReport() {
        this.ConvertDaysToDate(this.Days);
        this.isNumValid = true;
        let patientId = this.patientservice.getGlobal().PatientId;
        let patientVisitId = this.visitservice.getGlobal().PatientVisitId;
        this.nursingBLService.GetInvestigationResults(this.FromDate, this.ToDate, patientId, patientVisitId)
            .subscribe(res => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.investigationResultList = res.Results;
                    this.FormatInvestigationResult(this.investigationResultList);
                }
                else {

                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
                }
            });
    }
    public FormatInvestigationResult(data: Array<InvestigationResult_DTO>) {
        this.investigationResultViewList = [];
        const uniqueCombinations = new Set<string>();
        data.forEach(item => {
            const combination = item.Test + ' ,' + item.ComponentName + ' ,' + item.Unit;
            uniqueCombinations.add(combination);
        });
        const resultList = Array.from(uniqueCombinations).map(combination => {
            const [Test, ComponentName, Unit] = combination.split(' ,');
            return { Test, ComponentName, Unit };
        });

        resultList.forEach(item => {
            let result = new InvestigationResultsView_DTO();
            result.TestName = item.Test;
            result.ComponentName = item.ComponentName;
            result.Unit = item.Unit;
            const fromDate = moment(this.FromDate);
            const toDate = moment(this.ToDate).add(1, 'day');
            while (fromDate.isBefore(toDate, 'day')) {
                let value = data.filter(a => a.Test === item.Test && a.ComponentName === item.ComponentName && fromDate.isSame(moment(a.ResultDate)));
                if (value) {
                    result.Values.push(value.map((a) => a.Value).join(','));
                } else {
                    result.Values.push('');
                }
                fromDate.add(1, 'days');
            }
            this.investigationResultViewList.push(result);
        });
    }
    PrintResults() {
        this.divContentObj = this.divContentObj.innerHTML + document.getElementById('result_list').innerHTML;
        this.showPrintPage = true;
    }
    HidePrintPage() {
        this.showPrintPage = false;
        this.divContentObj = { innerHTML: '' };
    }
}
