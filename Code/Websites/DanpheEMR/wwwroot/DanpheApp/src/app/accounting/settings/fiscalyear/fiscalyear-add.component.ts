import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';
import { CoreService } from '../../../core/shared/core.service';
import { FiscalYearModel } from '../shared/fiscalyear.model';
import { SecurityService } from '../../../security/shared/security.service';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { NepaliCalendarService } from '../../../shared/calendar/np/nepali-calendar.service';

@Component({
    selector: 'fiscalyear-add',
    templateUrl: './fiscalyear-add.html'
})
export class FiscalYearAddComponent {

    public showAddPage: boolean = false;
    @Input("selectedFiscalYear")
    public selectedFiscalYear: FiscalYearModel;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

    public currentFiscalYear: FiscalYearModel = new FiscalYearModel();

    public calType: string = "";
    constructor(public accountingSettingsBLService: AccountingSettingsBLService,
        public nepaliCalendarService: NepaliCalendarService,
        public securityService: SecurityService, public coreService: CoreService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService) {
        this.LoadCalendarTypes();
        this.SetCurrentFiscalYear();

    }
    @Input("showAddPage")
    public set value(val: boolean) {
        this.showAddPage = val;
        if (this.selectedFiscalYear) {
            this.currentFiscalYear = Object.assign(this.currentFiscalYear, this.selectedFiscalYear);
            this.SetCurrentFiscalYear();
        }
        else {
            this.SetCurrentFiscalYear();
        }
    }

    AddFiscalYear() {
        ////checking Validation 
        for (var i in this.currentFiscalYear.FiscalYearValidator.controls) {
            this.currentFiscalYear.FiscalYearValidator.controls[i].markAsDirty();
            this.currentFiscalYear.FiscalYearValidator.controls[i].updateValueAndValidity();
        }
        if (this.currentFiscalYear.IsValidCheck(undefined, undefined)) {
            ///During First Time Add Current Balance and Opening Balance is Equal 
            this.accountingSettingsBLService.AddFiscalYear(this.currentFiscalYear)
                .subscribe(
                res => {
                    if (res.Status == "OK" && res.Results != null) {
                        this.msgBoxServ.showMessage("success", ["Fiscal year Added"]);
                        this.currentFiscalYear
                        this.CallBackAddLedgerGroup(res);
                        this.currentFiscalYear = new FiscalYearModel();
                    }
                   else if (res.Status == "OK" && res.Results == null)
                    {
                        this.msgBoxServ.showMessage("error", ['Fiscal Year is Already Avaliable......Try Different Fiscal Year']);
                    }
                    else {
                        this.msgBoxServ.showMessage("error", ['Check log for details']);
                        console.log(res.ErrorMessage);
                    }

                },
                err => {
                    console.log(err);
                });
        }
    }
    selectProperFiscalYearName() {
        ////If Parameter is Only English then we Set Fiscal Year Name to English Only
        if (this.calType == "en") {
            this.SetFiscalYearNameForEnglishParameterOnly();
        }
        else {
            ////else Parameter is np or en any or both then we Set Fiscal Year Name to Nepali Only
            this.SetFiscalYearNameForNepaliAndEnglishParameter()
        }


    }

    SetFiscalYearNameForNepaliAndEnglishParameter() {

        if (this.calType) {
            let str1: string = null;
            let str2: string = null;

            let startYRDate = this.currentFiscalYear.StartDate.toString();
            var checkStartYRDate = moment(startYRDate, 'YYYY', true).isValid();
            if (checkStartYRDate) {
                str1 = startYRDate;
            }
            else {
                let npTodaysStDate = this.nepaliCalendarService.ConvertEngToNepDate(startYRDate);
                let yr = (npTodaysStDate.Year).toString();
                str1 = yr;
            }
            let endYRDate = this.currentFiscalYear.EndDate.toString();
            var checkEndYRDate = moment(endYRDate, 'YYYY', true).isValid();
            if (checkEndYRDate) {
                str2 = endYRDate;
            }
            else {
                let npTodaysENDDate = this.nepaliCalendarService.ConvertEngToNepDate(endYRDate);
                let endyr = (npTodaysENDDate.Year).toString();
                str2 = endyr;
            }
            if (str1 != null && str2 != null) {
                this.currentFiscalYear.FiscalYearName = str1 + '-' + str2;
            }
        }
    }



    SetFiscalYearNameForEnglishParameterOnly() {
        if (this.calType) {
            let str1: string = null;
            let str2: string = null;

            let startYRDate = this.currentFiscalYear.StartDate.toString();
            var chkDates = moment(startYRDate, 'YYYY-MM-DD', true).isValid();
            if (chkDates) {
                let npTodaysStDate = moment(startYRDate).format("YYYY");
                str1 = npTodaysStDate;
            }
            else {
                str1 = startYRDate;
            }
            let enddate = this.currentFiscalYear.EndDate.toString();
            var chkDate = moment(enddate, 'YYYY-MM-DD', true).isValid();
            if (chkDate) {
                let npTodaysEndDate = moment(enddate).format("YYYY");
                str2 = npTodaysEndDate;
            }
            else {
                str2 = enddate;
            }
            if (str1 != null && str2 != null) {
                this.currentFiscalYear.FiscalYearName = str1 + '-' + str2;
            }
        }
    }

    SetCurrentFiscalYear() {
        /////Get Current Date by Moment()
        if (this.calType) {
            let engTodayDate = moment().format("YYYY-MM-DD");
            let npTodayDate = this.nepaliCalendarService.ConvertEngToNepDate(engTodayDate);
            ////Set Start Year Date Month is Shrawn 1st (month=Shrawn and Day=1st)
            npTodayDate.Month = 4;
            npTodayDate.Day = 1;
            /// tempStartYearDate is now contain current year with month=Shrawn and Day=1st
            let tempStartYearDate = moment(this.nepaliCalendarService.ConvertNepToEngDate(npTodayDate)).format("YYYY-MM-DD");

            ///Final Fiscal Year English Start Date 
            let engFinalEndYearDate = moment(tempStartYearDate).add(1, 'years').format('YYYY-MM-DD');
            ///Final Fiscal Year Nepali Start Date
            let npFinalEndYearDate = this.nepaliCalendarService.ConvertEngToNepDate(engFinalEndYearDate);
            ////Set End Year Date Month is Asar 31st (month=Asar and Day=31st)
            npFinalEndYearDate.Month = 3;
            let days = this.nepaliCalendarService.GetDaysOfMonthBS(npFinalEndYearDate.Year, npFinalEndYearDate.Month);
            let len = days.length; ////Total no of Days in Month of Selected Year
            npFinalEndYearDate.Day = len;
            let tempEndYearDate = moment(this.nepaliCalendarService.ConvertNepToEngDate(npFinalEndYearDate)).format("YYYY-MM-DD");

            this.currentFiscalYear.StartDate = tempStartYearDate;
            this.currentFiscalYear.EndDate = tempEndYearDate;
            ///Setting Fiscal year name with StartYear - EndYear
            this.currentFiscalYear.FiscalYearName = (npTodayDate.Year) + '-' + npFinalEndYearDate.Year;
        }

    }

    Close() {
        this.currentFiscalYear = new FiscalYearModel();
        this.showAddPage = false;
    }
    LoadCalendarTypes() {
        let Parameter = this.coreService.Parameters;
        Parameter = Parameter.filter(parms => parms.ParameterName == "CalendarTypes");
        let calendarTypeObject = JSON.parse(Parameter[0].ParameterValue);
        let result = calendarTypeObject.AccountingFiscalYear;
        if (result != null) {
            this.calType = result;
        }
        else {
           /// console.log('Something Wrong with Setting Parameter Value to Date Picker');
            this.msgBoxServ.showMessage("error", ['Something Wrong with Setting Parameter Value to Date Picker']);
        }

    }

    //after adding Ledger is succesfully added  then this function is called.
    CallBackAddLedgerGroup(res) {
        if (res.Status == "OK") {
            let currentFiscal = new FiscalYearModel();
            currentFiscal = Object.assign(currentFiscal, res.Results);
            this.callbackAdd.emit({ currentFiscal });
        }
        else {
            this.msgBoxServ.showMessage("error", ['Check log for details']);
            console.log(res.ErrorMessage);
        }
    }



}
