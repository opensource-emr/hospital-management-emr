import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { AccountingBLService } from "../shared/accounting.bl.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { FiscalYearModel } from "../settings/shared/fiscalyear.model";
import { AccountClosureViewModel } from "../settings/shared/accounting-view-models";
import { CommonFunctions } from "../../shared/common.functions";
import { TransactionItem } from "./shared/transaction-item.model";
import { TransactionModel } from "./shared/transaction.model";
import { SecurityService } from "../../security/shared/security.service";
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
@Component({
    templateUrl: './account-closure.html',
})
export class AccountClosureComponent {
    public closureData: Array<any> = new Array<any>();
    public activeFiscalYear: FiscalYearModel = new FiscalYearModel();
    public nextFiscalYear: FiscalYearModel = new FiscalYearModel();
    public closureVM: AccountClosureViewModel = new AccountClosureViewModel();
    public showAccountClosureUI: boolean = false;

    constructor(
        public msgBoxServ: MessageboxService,
        public accBLService: AccountingBLService, public nepaliCalendarServ: NepaliCalendarService,
        public securityService: SecurityService, public changeDetRef:ChangeDetectorRef) {
        //this.loadAccountClosureData();
        this.getActiveFiscalYear();
        this.showAccountClosureUI = true;
        this.nextFiscalYear.StartDate = this.nextFiscalYear.EndDate = moment().format("YYYY-MM-DD");
    }

    //loadAccountClosureData() {
    //    this.accBLService.GetAccountClosureData().subscribe(res => {
    //        if (res.Status == "OK") {
    //            this.closureData = res.Results;
    //            this.closureData = this.closureData.filter(a => a.COA == "Assets" || a.COA == "Liabilities");
    //            this.CalculateTotalAmounts();
    //        }
    //    });
    //}

    getActiveFiscalYear() {
        this.accBLService.GetActiveFiscalYear().subscribe(res => {
            if (res.Status == "OK") {
                this.activeFiscalYear = res.Results;
            }
        });
    }

    //CalculateTotalAmounts() {
    //    for (var i = 0; i < this.closureData.length; i++) {
    //        var overallDrTotal = 0;
    //        var overallCrTotal = 0;
    //        for (var j = 0; j < this.closureData[i].TypeList.length; j++) {
    //            var tCrAmt = 0;
    //            var tDrAmt = 0;
    //            for (var k = 0; k < this.closureData[i].TypeList[j].LedgersList.length; k++) {
    //                this.closureData[i].TypeList[j].LedgersList[k].CrAmount = CommonFunctions.parseAmount(this.closureData[i].TypeList[j].LedgersList[k].CrAmount);
    //                this.closureData[i].TypeList[j].LedgersList[k].DrAmount = CommonFunctions.parseAmount(this.closureData[i].TypeList[j].LedgersList[k].DrAmount);
    //                let crAmt = this.closureData[i].TypeList[j].LedgersList[k].CrAmount;
    //                let drAmt = this.closureData[i].TypeList[j].LedgersList[k].DrAmount;
    //                if (crAmt > drAmt) {
    //                    this.closureData[i].TypeList[j].LedgersList[k]["NetAmount"] = crAmt - drAmt;
    //                    this.closureData[i].TypeList[j].LedgersList[k]['DrCr'] = 0;
    //                }

    //                else {
    //                    this.closureData[i].TypeList[j].LedgersList[k]["NetAmount"] = drAmt - crAmt;
    //                    this.closureData[i].TypeList[j].LedgersList[k]['DrCr'] = 1;
    //                }

    //                tCrAmt = tCrAmt + crAmt;
    //                tDrAmt = tDrAmt + drAmt

    //            }
    //            this.closureData[i].TypeList[j]["TotalDrAmount"] = tDrAmt;
    //            this.closureData[i].TypeList[j]["TotalCrAmount"] = tCrAmt;
    //            overallDrTotal = overallDrTotal + tDrAmt;
    //            overallCrTotal = overallCrTotal + tCrAmt;
    //        }
    //        this.closureData[i]["OverAllDrTotal"] = overallDrTotal;
    //        this.closureData[i]["OverAllCrTotal"] = overallCrTotal;
    //    }
    //}

    postAccountClosure() {
        for (var i in this.nextFiscalYear.FiscalYearValidator.controls) {
            this.nextFiscalYear.FiscalYearValidator.controls[i].markAsDirty();
            this.nextFiscalYear.FiscalYearValidator.controls[i].updateValueAndValidity();
        }
        if (moment(this.nextFiscalYear.EndDate).diff(this.nextFiscalYear.StartDate, 'months')<11) {
            this.msgBoxServ.showMessage('error', ["Difference between Start date and End date is minimum 11 months"]);
            return;
        }
        if (this.nextFiscalYear.IsValidCheck(undefined, undefined)) {
            this.formattingData();
            this.accBLService.PostAccountClosure(this.nextFiscalYear).subscribe(res => {
                if (res.Status == "OK") {
                    this.showAccountClosureUI = false;
                    this.msgBoxServ.showMessage('Success', ["data posted."]);
                }
            });
        }
    }

    formattingData() {
        this.nextFiscalYear.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.nextFiscalYear.StartDate = this.nextFiscalYear.StartDate.concat(" 00:00:00");
        this.nextFiscalYear.EndDate = this.nextFiscalYear.EndDate.concat(" 23:59:59");

    //    this.closureVM = new AccountClosureViewModel();
    //    this.nextFiscalYear.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    //    this.closureVM.nextFiscalYear = this.nextFiscalYear;

    //    //making txn item
    //    this.closureVM.TnxModel = new TransactionModel();
    //    this.closureVM.TnxModel.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    //    //this is for avoiding null on voucher id
    //    this.closureVM.TnxModel.VoucherId = 0;

    //    this.closureData.forEach(
    //        a => {
    //            a.TypeList.forEach(
    //                b => {
    //                    b.LedgersList.forEach(
    //                        c => {
    //                            var x = new TransactionItem();
    //                            x.LedgerId = c.LedgerId;
    //                            x.DrCr = c.DrCr;
    //                            x.Amount = c.NetAmount;
    //                            x.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    //                            this.closureVM.TnxModel.TransactionItems.push(x);
    //                        });
    //                });
    //        });
    }

    DefineFiscalYearName() {
        let str1 = "";
        let str2 = "";
        if (this.nextFiscalYear.StartDate && this.nextFiscalYear.EndDate) {
            str1 = moment(this.nextFiscalYear.StartDate).format('YYYY');
            str2 = moment(this.nextFiscalYear.EndDate).format('YYYY');

            this.nextFiscalYear.FiscalYearName = str1 + '-' + str2;
            this.nextFiscalYear.NpFiscalYearName = this.TransferToNepaliDateName();
        }
    }

    TransferToNepaliDateName() {
        let startdate = this.nepaliCalendarServ.ConvertEngToNepDateString(moment(this.nextFiscalYear.StartDate).format('YYYY-MM-DD'));
        let enddate = this.nepaliCalendarServ.ConvertEngToNepDateString(moment(this.nextFiscalYear.EndDate).format('YYYY-MM-DD'));
        return moment(startdate).format('YYYY') + "-" + moment(enddate).format('YYYY');
    }
    
    ngAfterViewChecked()
    {
    this.changeDetRef.detectChanges();
    }
}