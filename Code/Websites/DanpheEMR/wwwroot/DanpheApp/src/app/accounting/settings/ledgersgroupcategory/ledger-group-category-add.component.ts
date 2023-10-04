import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { AccountingLedgerVoucherMapViewModel } from '../shared/ledgergroup-voucherledgergroupmap-view.model';
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';
import { ledgerGroupCategoryModel } from '../shared/ledger-group-category.model'
import { ChartofAccountModel } from '../shared/chart-of-account.model'
import { SecurityService } from '../../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { AccountingService } from '../../shared/accounting.service';


@Component({
    selector: 'ledger-group-category-add',
    templateUrl: './ledger-group-category-add.html'
})
export class LedgerGroupCategoryAddComponent {

    public showAddPage: boolean = false;
    @Input("selectedLedgerGroupCategory")
    public selectedLedgerGroupCategory: ledgerGroupCategoryModel;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

    public CurrentLedgerGroupCategory: ledgerGroupCategoryModel;
    public chartOfAccounts: Array<ChartofAccountModel> = new Array<ChartofAccountModel>();
    public tempChartOfAccounts: Array<ChartofAccountModel> = new Array<ChartofAccountModel>();
    constructor(public accountingSettingsBLService: AccountingSettingsBLService,public accountingService: AccountingService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService) {
        this.GetAllChartOfAccount();
    }
    @Input("showAddPage")
    public set value(val: boolean) {
        this.showAddPage = val;
        if (this.selectedLedgerGroupCategory) {
            this.CurrentLedgerGroupCategory = new ledgerGroupCategoryModel();
        }
        else {
            this.CurrentLedgerGroupCategory = new ledgerGroupCategoryModel();
            this.CurrentLedgerGroupCategory.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        }
    }

    GetAllChartOfAccount() {
        if (!!this.accountingService.accCacheData.COA && this.accountingService.accCacheData.COA.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
            this.CallBackChartOfAccountList(this.accountingService.accCacheData.COA)//mumbai-team-june2021-danphe-accounting-cache-change
        }
    }

    CallBackChartOfAccountList(res) {
        this.tempChartOfAccounts = res;//mumbai-team-june2021-danphe-accounting-cache-change
        this.tempChartOfAccounts = this.tempChartOfAccounts.slice();//mumbai-team-june2021-danphe-accounting-cache-change
        this.chartOfAccounts = [];
        for (var i = 0; i < this.tempChartOfAccounts.length; i++) {
            if (this.tempChartOfAccounts[i].IsActive) {
                this.chartOfAccounts.push(this.tempChartOfAccounts[i]);
            }
        }

    }


    //adding new Ledger
    SubmitLedgerGrpCategory() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentLedgerGroupCategory.LedgerGroupCategoryValidator.controls) {
            this.CurrentLedgerGroupCategory.LedgerGroupCategoryValidator.controls[i].markAsDirty();
            this.CurrentLedgerGroupCategory.LedgerGroupCategoryValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentLedgerGroupCategory.IsValidCheck(undefined, undefined)) {
            this.CurrentLedgerGroupCategory.CreatedOn = moment().format("YYYY-MM-DD");
            this.accountingSettingsBLService.AddLedgersGroupCategory(this.CurrentLedgerGroupCategory)
                .subscribe(
                res => {
                    this.msgBoxServ.showMessage("success", ["Ledger Group Category Added"]);
                    this.CurrentLedgerGroupCategory
                    this.CallBackAddLedgerGroupCategory(res);
                    this.CurrentLedgerGroupCategory = new ledgerGroupCategoryModel();
                },
                err => {
                    this.logError(err);
                });
        }
    }


    Close() {
        this.selectedLedgerGroupCategory = null;
        this.showAddPage = false;
    }

    //after adding Ledger is succesfully added  then this function is called.
    CallBackAddLedgerGroupCategory(res) {
        if (res.Status == "OK") {
            let currentLedGrpCategory = new ledgerGroupCategoryModel();
            let currentLedgerGrpCategory = Object.assign(currentLedGrpCategory, res.Results);
            this.callbackAdd.emit({ currentLedgerGrpCategory });
        }
        else {
            this.msgBoxServ.showMessage("error", ['Check log for details']);
            console.log(res.ErrorMessage);
        }
    }

    logError(err: any) {
        console.log(err);
    }

}